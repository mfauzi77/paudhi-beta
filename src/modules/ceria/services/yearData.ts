import { AlertLevel, AppData, Domain, DomainFilter, KeyIndicatorData, RegionDetailData } from '../types';
import { buildForecastPairs } from './forecast2025';

export const domains: Domain[] = ['Kesehatan & Gizi', 'Pendidikan', 'Pengasuhan', 'Perlindungan', 'Kesejahteraan Sosial'];
export async function load2025(signal?: AbortSignal): Promise<AppData> {
    const read = async (url: string) => {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Gagal memuat ${url}`);
        return response.json();
    };
    const mapping = await read('/data/2025/mapping.json');
    const datasets = await Promise.all([...mapping.entries, ...(mapping.supportingDatasets || [])].filter((e: any) => e.datasetUrl).map(async (entry: any) => ({ entry, data: await read(entry.datasetUrl) })));
    const result = build2025(datasets);
    try {
        const baseline = await read('/data/ceria_aggregated.json');
        result.forecastPairs = buildForecastPairs(baseline, datasets);
        applyIndicatorComparisons(result, datasets, baseline);
    } catch (error) {
        if (signal?.aborted) throw error;
        result.forecastPairs = [];
        result.forecastLoadError = 'Data pembanding 2024 gagal dimuat. Muat ulang untuk mencoba lagi.';
    }
    return result;
}

// Compare the same province cohort on both sides; never subtract a provincial
// mean from the published national value. These are dataset differences, not
// verified changes in population outcomes.
export function applyIndicatorComparisons(result: AppData, datasets: { entry: any; data: any }[], baseline: any) {
    const fields: Record<string, Record<string, [string, string?]>> = {
        imunisasi: { total: ['idl'] },
        identitas_anak: { total: ['akta'] },
        perkawinan_anak: { perkawinan_anak: ['perkawinan_anak'] },
        pkh: { total: ['pkh'] },
        infrastruktur: { air_minum_layak: ['sanitasi', 'air'], sanitasi_layak: ['sanitasi', 'sanitasi'], fasilitas_cuci_tangan: ['sanitasi', 'cuci'] },
    };
    const normalize = (s: string) => s.toLowerCase().replace(/kepulauan|kep\./g, 'kep').replace(/[^a-z0-9]/g, '');
    const numeric = (value: unknown): number | null => {
        if (value === null || value === undefined || String(value).trim() === '') return null;
        const n = Number(String(value).replace(',', '.'));
        return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
    };
    const round = (n: number) => Number(n.toFixed(2));
    for (const { entry, data } of datasets) {
        for (const [path, [oldKey, oldField]] of Object.entries(fields[entry.id] || {})) {
            const label = path === 'total' ? data.title.split(' per Provinsi')[0] : data.indicators?.[path]?.label;
            const card = result.keyIndicatorsByDomain[entry.proposedDomain as Domain]?.find(k => k.label === label);
            if (!card) continue;
            const oldRows = new Map(Object.entries(baseline[oldKey] || {}).map(([name, value]) => [normalize(name), value]));
            const pairs: { before: number; after: number }[] = [];
            for (const row of data.provinces) {
                const old: any = oldRows.get(normalize(row.province));
                const before = numeric(oldField ? old?.[oldField] : old);
                const after = numeric(row[path]);
                if (before !== null && after !== null) pairs.push({ before, after });
            }
            if (!pairs.length) continue;
            const previous = pairs.reduce((s, p) => s + p.before, 0) / pairs.length;
            const current = pairs.reduce((s, p) => s + p.after, 0) / pairs.length;
            card.comparison = { change: round(current - previous), provinceCount: pairs.length, previous: round(previous), current: round(current) };
        }
    }
}

export function build2025(datasets: { entry: any; data: any }[], year = 2025): AppData {
    const regionsDetails: AppData['regionsDetails'] = {};
    const keys = Object.fromEntries(['Semua', ...domains].map(d => [d, [] as KeyIndicatorData[]])) as Record<DomainFilter, KeyIndicatorData[]>;
    const at = (row: any, path: string) => path.split('.').reduce((v, key) => v?.[key], row);
    const numberText = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    for (const { data } of datasets) for (const row of data.provinces) {
        const id = row.province.toLowerCase().replace(/\./g, '').replace(/ /g, '-');
        if (!regionsDetails[id]) regionsDetails[id] = {
            id, name: row.province, year, population: 0, populationUnavailable: true,
            overallRisk: 0, activeAlertsCount: 0, historicalRisk: [],
            domains: Object.fromEntries(domains.map(d => [d, { metrics: [] as RegionDetailData['domains'][Domain]['metrics'], riskScore: 0 }])) as RegionDetailData['domains']
        };
    }
    for (const { entry, data } of datasets) {
        if (entry.id === 'populasi_aud') {
            for (const row of data.provinces) {
                const region = Object.values(regionsDetails).find(r => r.name === row.province)!;
                region.population = row.jumlah_3_6;
                region.populationUnavailable = false;
                region.populationAgeGroup = '3–6 tahun';
                region.populationDetails = { proportionAge0To6: row.proporsi_0_6, countAge3To6: row.jumlah_3_6, countAge5To6: row.jumlah_5_6 };
            }
            continue;
        }
        const domain = entry.proposedDomain as Domain;
        if (!domains.includes(domain)) continue;
        // Keep both poverty periods. Breakdown percentages remain in the full AI dataset.
        const paths: string[] = entry.fieldPaths.includes('total') ? ['total'] : entry.fieldPaths.filter((p: string) => !p.startsWith('perkotaan.') && !p.startsWith('perdesaan.'));
        for (const path of paths) {
            const baseLabel = path === 'total' ? data.title.split(' per Provinsi')[0] : data.indicators?.[path]?.label || `Kemiskinan ${path.endsWith('maret') ? 'Maret' : 'September'} 2025`;
            const label = data.academicYear ? `${baseLabel} (TA ${data.academicYear})` : baseLabel;
            const national = at(data.national, path);
            const highGood = ['imunisasi', 'kia', 'partisipasi_paud', 'kualifikasi_guru', 'identitas_anak', 'infrastruktur'].includes(entry.id);
            // Counts, PKH and the older poverty semester do not contribute to the composite score.
            const riskEligible = data.unit === '%' && entry.id !== 'pkh' && path !== 'total.maret' && data.indicators?.[path]?.riskEligible !== false;
            keys[domain].push({ label, value: typeof national === 'number' ? `${numberText(national)}${data.unit === '%' ? '%' : ` ${data.unit}`}` : 'Belum tersedia', domain, change: 0, changeType: 'stable', trendUnavailable: true });
            for (const row of data.provinces) {
                const region = Object.values(regionsDetails).find(r => r.name === row.province)!;
                const value = at(row, path);
                region.domains[domain].metrics.push({ label, value: typeof value === 'number' ? value : 'Belum tersedia', unit: data.unit, nationalAverage: typeof national === 'number' ? national : Number.NaN, higherIsBetter: highGood, riskEligible });
            }
        }
    }
    const allActiveAlerts: AppData['allActiveAlerts'] = [];
    for (const region of Object.values(regionsDetails)) {
        const scores: number[] = [];
        for (const domain of domains) {
            const metrics = region.domains[domain].metrics.filter(m => m.riskEligible && typeof m.value === 'number');
            if (!metrics.length) continue;
            const score = Number((metrics.reduce((s, m) => s + (m.higherIsBetter ? 100 - Number(m.value) : Number(m.value)), 0) / metrics.length).toFixed(1));
            region.domains[domain].riskScore = score;
            scores.push(score);
            if (score > 70) allActiveAlerts.push({ id: `${year}-${region.id}-${domain}`, year, level: score > 85 ? AlertLevel.Critical : AlertLevel.High, title: `Risiko ${score > 85 ? 'Sangat Tinggi' : 'Tinggi'} di Bidang ${domain}`, region: region.name, domain, riskScore: score });
        }
        region.overallRisk = scores.length ? Number((scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1)) : 0;
        region.activeAlertsCount = allActiveAlerts.filter(a => a.region === region.name).length;
    }
    keys.Semua = domains.flatMap(d => keys[d]);
    const domainsData: AppData['domainsData'] = {};
    for (const domain of domains) {
        const regions = Object.values(regionsDetails).filter(r => r.domains[domain].metrics.some(m => typeof m.value === 'number')).map(r => ({ id: r.id, name: r.name, riskScore: r.domains[domain].riskScore, trend: 0 }));
        const samples = Object.values(regionsDetails)[0]?.domains[domain].metrics || [];
        domainsData[domain] = { id: domain, name: domain, averageRisk: regions.length ? Number((regions.reduce((s,r) => s+r.riskScore, 0)/regions.length).toFixed(1)) : 0, regions, criticalRegionsCount: regions.filter(r => r.riskScore > 70).length, topAlerts: allActiveAlerts.filter(a => a.domain === domain).slice(0,3), indicators: samples.map(sample => {
            const values = Object.values(regionsDetails).map(r => ({ name: r.name, metric: r.domains[domain].metrics.find(m => m.label === sample.label)! })).filter(r => typeof r.metric.value === 'number').sort((a,b) => Number(a.metric.value)-Number(b.metric.value));
            const display = (r: typeof values[number] | undefined) => ({ name: r?.name || 'Belum tersedia', value: r ? `${numberText(Number(r.metric.value))} ${sample.unit}` : 'Belum tersedia' });
            return { indicatorName: sample.label, nationalAverage: Number.isFinite(sample.nationalAverage) ? `${numberText(sample.nationalAverage)} ${sample.unit}` : 'Belum tersedia', bestPerformer: display(sample.higherIsBetter ? values[values.length-1] : values[0]), worstPerformer: display(sample.higherIsBetter ? values[0] : values[values.length-1]) };
        }) };
    }
    return { year, analysisDatasets: datasets, regionsDetails, domainsData, keyIndicatorsByDomain: keys, allActiveAlerts,
        kabupatenKotaDetails: {}, nationalHistoricalRisk: [], regionalForecastData: [], paudParticipationData2024: [], paudAccreditationData: [], paudTeacherQualificationData: [], riskAssessmentData: [], forecastChartData: [], dataSources: [], processingLogs: [], mockInterventionPlans: [], mockResourceData: { sdm: [], anggaran: [], material: [] }, regionalRiskScores: Object.values(regionsDetails).map(r => ({ name: r.name, score: r.overallRisk })),
        mockParentData: { childProfile: { name: 'Anak Anda', age: 'Data belum ada', avatarUrl: '', lastWeight: null, lastHeight: null }, upcomingEvents: [], growthHistory: [], stimulationChecklist: [] },
        getRegionDetails: id => regionsDetails[id] || null, getAvailableRegions: () => Object.values(regionsDetails).map(r => ({ id:r.id, name:r.name })), getDomainData: id => domainsData[id] || null
    };
}

