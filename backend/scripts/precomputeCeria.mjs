import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
const require = createRequire(import.meta.url);
const year = Number(process.argv.find(arg => arg.startsWith('--year='))?.split('=')[1] || 2025);
if (![2024, 2025].includes(year)) throw new Error('Tahun tidak didukung');
const outputDir = year === 2025 ? '.local/ceria-precompute' : '.local/ceria-precompute/2024';
const verifyOnly = process.argv.includes('--verify');
const tokenLimitArg = process.argv.find(arg => arg.startsWith('--max-output-tokens='));
const batchTokenLimit = tokenLimitArg ? Number(tokenLimitArg.split('=')[1]) : undefined;
if (batchTokenLimit !== undefined && (!Number.isInteger(batchTokenLimit) || batchTokenLimit < 500 || batchTokenLimit > 4000)) throw new Error('Batas token harus antara 500 dan 4000');
if (verifyOnly) process.env.CERIA_CACHE_ONLY = 'true';
const pool = require('../dbPostgres');
const express = require('express');
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
    req.ceriaPrecompute = !verifyOnly;
    req.ceriaBatchMaxOutputTokens = batchTokenLimit;
    req.ceriaCacheProbe = req.headers['x-cache-probe'] === 'true';
    next();
});
app.use('/api/ai', require('../routes/ai'));
const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
const origin = `http://127.0.0.1:${server.address().port}`;
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const originalFetch = globalThis.fetch;
const delay = verifyOnly ? 0 : Math.max(20000, Number(process.env.CERIA_BATCH_DELAY_MS) || 20000);
let lastRequest = 0;
let jobName = '';
let totalJobs = 0;
let stoppedReason = null;
const results = [];
const log = console.log.bind(console);
console.log = (...args) => {
    if (String(args[0]).startsWith('AI_CALL_TRIGGERED') || String(args[0]).startsWith('[AI Cache]') || String(args[0]).startsWith('[AI Deduplication]')) return;
    log(...args);
};
globalThis.fetch = async (url, options) => {
    if (String(url).startsWith('/data/')) return new Response(await readFile(resolve('public', String(url).slice(1)), 'utf8'));
    if (url !== '/api/ai/generate') return originalFetch(url, options);
    const probe = await originalFetch(origin + url, { ...options, headers: { ...options.headers, 'X-Cache-Probe': 'true' }, signal: AbortSignal.timeout(30000) });
    if (probe.ok) {
        const saved = await probe.clone().json();
        if (saved.cacheSource !== 'database') throw new Error('Cache belum tersimpan di database.');
        results.push({ job: jobName, cached: true, savedAt: saved.savedAt });
        return probe;
    }
    if (verifyOnly) throw new Error(`Belum tersimpan: ${jobName}`);
    if (probe.status !== 404) throw new Error(`Pemeriksaan cache gagal: HTTP ${probe.status}`);
    const remaining = delay - (Date.now() - lastRequest);
    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
    lastRequest = Date.now();
    const response = await originalFetch(origin + url, { ...options, signal: AbortSignal.timeout(120000) });
    const body = await response.clone().json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${body.message || body.error || 'AI gagal'}`);
        error.status = response.status;
        error.retryAfter = Number(response.headers.get('retry-after'));
        throw error;
    }
    if (verifyOnly && (!body.cached || body.cacheSource !== 'database')) throw new Error('Hasil belum tersedia di database.');
    if (body.persistenceError) throw new Error('Hasil AI belum tersimpan di database; batch dihentikan.');
    results.push({ job: jobName, cached: !!body.cached, savedAt: body.savedAt });
    return response;
};
try {
    await pool.query('SELECT 1');
    const { load2025 } = await vite.ssrLoadModule('/src/modules/ceria/services/yearData.ts');
    const ai = await vite.ssrLoadModule('/src/modules/ceria/services/geminiService.ts');
    const { projectForecast, forecastMethod } = await vite.ssrLoadModule('/src/modules/ceria/services/forecast2025.ts');
    const { load2024 } = await vite.ssrLoadModule('/src/modules/ceria/services/year2024.ts');
    const data = year === 2025 ? await load2025() : await load2024();
    const jobs = [];
    for (const domain of Object.keys(data.keyIndicatorsByDomain)) {
        if (!data.keyIndicatorsByDomain[domain].length) continue;
        jobs.push([`Dashboard ${year} / ${domain}`, () => ai.getExecutiveBriefing(domain, data.keyIndicatorsByDomain[domain], data.allActiveAlerts.filter(a => domain === 'Semua' || a.domain === domain), undefined, {
            year, datasets: data.analysisDatasets.filter(d => domain === 'Semua' || d.entry.proposedDomain === domain || d.entry.id === 'populasi_aud').map(d => d.data)
        })]);
    }
    for (const alert of data.allActiveAlerts) jobs.push([`Alert / ${alert.region} / ${alert.domain}`, () => ai.getSmartRecommendations(alert)]);
    for (const region of Object.values(data.regionsDetails)) jobs.push([`Wilayah & laporan / ${region.name}`, () => ai.getRegionalAnalysisInsight(region)]);
    for (const domain of [...new Set(data.forecastPairs.map(p => p.domain))]) for (const months of [3, 6]) {
        const forecast = projectForecast(data.forecastPairs, domain, months);
        const sorted = [...forecast].sort((a, b) => b.change - a.change);
        jobs.push([`Forecast / ${domain} / ${months} bulan`, () => ai.getForecastingInsight(domain, `${months} Bulan`, sorted.filter(r => r.change > 0).slice(0, 3), sorted.filter(r => r.change < 0).slice(-3).reverse(), forecast.reduce((s, r) => s + r.change, 0) / forecast.length, undefined, { year: 2025, method: forecastMethod, pairs: data.forecastPairs.filter(p => p.domain === domain) })]);
    }
    const stats = Object.values(data.domainsData).filter(d => d.regions.length).map(d => {
        const sorted = [...d.regions].sort((a, b) => a.riskScore - b.riskScore);
        return { domain: d.id, averageRisk: d.averageRisk, criticalRegionsCount: d.criticalRegionsCount, bestPerformer: sorted[0], worstPerformer: sorted[sorted.length - 1] };
    });
    jobs.push([`Laporan perbandingan domain ${year}`, () => ai.getDomainComparisonInsight(year, { stats })]);
    totalJobs = jobs.length;
    console.log(`BATCH_READY ${jobs.length} pekerjaan; jeda ${delay / 1000} detik, satu permintaan aktif.`);
    for (const [index, [name, run]] of jobs.entries()) {
        jobName = name;
        console.log(`BATCH_START ${index + 1}/${jobs.length} ${name}`);
        try { await run(); }
        catch (error) {
            if (![402, 429].includes(error.status) || !(error.retryAfter > 0 && error.retryAfter <= 600)) throw error;
            const waitSeconds = Math.max(120, error.retryAfter);
            console.log(`BATCH_PAUSE ${waitSeconds} detik sesuai Retry-After; satu percobaan ulang.`);
            await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
            await run();
        }
        console.log(`BATCH_SAVED ${index + 1}/${jobs.length} ${name}`);
        await mkdir(outputDir, { recursive: true });
        await writeFile(`${outputDir}/${verifyOnly ? 'verification' : 'progress'}.json`, JSON.stringify({ updatedAt: new Date().toISOString(), total: jobs.length, results }, null, 2));
    }
    console.log('BATCH_COMPLETE');
} catch (error) {
    stoppedReason = error.message;
    console.error('BATCH_STOPPED', jobName, error.message);
    process.exitCode = 1;
} finally {
    await mkdir(outputDir, { recursive: true });
    await writeFile(`${outputDir}/${verifyOnly ? 'verification' : 'progress'}.json`, JSON.stringify({ year, updatedAt: new Date().toISOString(), total: totalJobs, completed: results.length, stoppedAt: stoppedReason ? jobName : null, stoppedReason, results }, null, 2));
    await vite.close();
    server.close();
    await pool.end();
    process.exit(process.exitCode || 0);
}
