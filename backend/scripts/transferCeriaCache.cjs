const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../dbPostgres');
const store = require('../services/ceriaAnalysisStore').createAnalysisStore(pool);
async function main() {
    const [mode, filename] = process.argv.slice(2);
    if (!['export', 'import'].includes(mode) || !filename) throw new Error('Usage: node backend/scripts/transferCeriaCache.cjs export|import <file.json>');
    await store.get('schema-check');
    if (mode === 'export') {
        const { rows } = await pool.query('SELECT cache_key, response, saved_at FROM ceria_analysis_cache ORDER BY saved_at');
        await fs.mkdir(path.dirname(path.resolve(filename)), { recursive: true });
        await fs.writeFile(filename, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), rows }, null, 2));
        console.log(`EXPORTED ${rows.length} hasil analisis ke ${filename}`);
    } else {
        const data = JSON.parse(await fs.readFile(filename, 'utf8'));
        if (data.version !== 1 || !Array.isArray(data.rows)) throw new Error('Format backup tidak valid');
        for (const row of data.rows) {
            if (!/^CERIA:[a-f0-9]{64}$/.test(row.cache_key) || typeof row.response?.text !== 'string' || !row.response.text.trim() || !Number.isFinite(Date.parse(row.saved_at))) throw new Error('Baris backup tidak valid');
        }
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const row of data.rows) await client.query(`INSERT INTO ceria_analysis_cache (cache_key, response, saved_at) VALUES ($1, $2::jsonb, $3)
                ON CONFLICT (cache_key) DO UPDATE SET response = EXCLUDED.response, saved_at = EXCLUDED.saved_at
                WHERE ceria_analysis_cache.saved_at < EXCLUDED.saved_at`, [row.cache_key, JSON.stringify(row.response), row.saved_at]);
            await client.query('COMMIT');
            console.log(`IMPORTED ${data.rows.length} hasil analisis; hasil lebih baru di server dipertahankan.`);
        } catch (error) { await client.query('ROLLBACK'); throw error; }
        finally { client.release(); }
    }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
