import type { Domain, RegionalForecastData, ForecastDataPoint } from '../types';

export interface ForecastPair {
    region: string;
    domain: Domain;
    indicators: string[];
    previousRisk: number;
    currentRisk: number;
}
export const forecastMethod = 'Skenario linear dua titik 2024–2025; kesetaraan definisi, populasi, dan tahun sumber belum diverifikasi. Perubahan skor tahunan dibagi 12 lalu dikalikan horizon. Bukan prediksi statistik tervalidasi; tidak ada interval keyakinan. Skor memakai indikator berpasangan saja, sehingga dapat berbeda dari skor dashboard. Rata-rata wilayah tidak dibobot populasi.';
const numeric = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};
const normalize = (name: string) => name.toLowerCase().replace(/kepulauan|kep\./g, 'kep').replace(/[^a-z0-9]/g, '');
const sum = (a: unknown, b: unknown) => numeric(a) === null || numeric(b) === null ? null : numeric(Number(numeric(a)) + Number(numeric(b)));
export function buildForecastPairs(baseline: any, datasets: { entry: any; data: any }[]): ForecastPair[] {
    const old = (key: string, province: string) => Object.entries(baseline[key] || {}).find(([name]) => normalize(name) === normalize(province))?.[1] as any;
    const configurations: { id: string; domain: Domain; fields: { key: string; label: string; good: boolean; previous: (province: string) => unknown }[] }[] = [
        { id: 'gizi', domain: 'Kesehatan & Gizi', fields: [
            { key: 'stunting', label: 'Stunting', good: false, previous: p => sum(old('gizi',p)?.severelyStunted,old('gizi',p)?.stunted) },
            { key: 'wasting', label: 'Wasting', good: false, previous: p => sum(old('gizi',p)?.severelyWasted,old('gizi',p)?.wasted) },
            { key: 'underweight', label: 'Underweight', good: false, previous: p => sum(old('gizi',p)?.severelyUnderweight,old('gizi',p)?.underweight) }
        ] },
        { id: 'imunisasi', domain: 'Kesehatan & Gizi', fields: [{ key:'total', label:'Imunisasi IDL', good:true, previous:p => old('idl',p) }] },
        { id: 'kia', domain: 'Kesehatan & Gizi', fields: [{ key:'kunjungan_k4', label:'Kunjungan K4', good:true, previous:p => old('anc',p)?.anc }] },
        { id: 'identitas_anak', domain:'Perlindungan', fields:[{ key:'total', label:'Akta kelahiran', good:true, previous:p => old('akta',p) }] },
        { id: 'perkawinan_anak', domain:'Perlindungan', fields:[{ key:'perkawinan_anak', label:'Perkawinan anak', good:false, previous:p => old('perkawinan_anak',p) }] }
    ];
    const groups = new Map<string, { region:string; domain:Domain; labels:string[]; before:number[]; after:number[] }>();
    for (const config of configurations) {
        const dataset = datasets.find(d => d.entry.id === config.id)?.data;
        for (const row of dataset?.provinces || []) for (const field of config.fields) {
            const before = numeric(field.previous(row.province));
            const after = numeric(row[field.key]);
            if (before === null || after === null) continue;
            const key = `${row.province}:${config.domain}`;
            const group = groups.get(key) || { region:row.province, domain:config.domain, labels:[] as string[], before:[] as number[], after:[] as number[] };
            group.labels.push(field.label);
            group.before.push(field.good ? 100-before : before);
            group.after.push(field.good ? 100-after : after);
            groups.set(key,group);
        }
    }
    const mean = (values:number[]) => values.reduce((a,b)=>a+b,0)/values.length;
    return [...groups.values()].map(g => ({ region:g.region, domain:g.domain, indicators:g.labels, previousRisk:mean(g.before), currentRisk:mean(g.after) }));
}
export function projectForecast(pairs: ForecastPair[], domain: Domain, months:number): RegionalForecastData[] {
    if (![3,6].includes(months)) throw new Error('Horizon harus 3 atau 6 bulan');
    const level = (n:number): RegionalForecastData['currentRiskLevel'] => n>85?'Kritis':n>70?'Tinggi':n>55?'Sedang':'Rendah';
    const round = (n:number) => Number(n.toFixed(2));
    return pairs.filter(p=>p.domain===domain).map((p,id)=>{
        const currentRisk=round(p.currentRisk);
        const predictedRisk=round(Math.max(0,Math.min(100,p.currentRisk+(p.currentRisk-p.previousRisk)*months/12)));
        return { id, region:p.region, domain:p.domain, currentRisk, predictedRisk, change:round(predictedRisk-currentRisk), currentRiskLevel:level(currentRisk), predictedRiskLevel:level(predictedRisk) };
    });
}
export function forecastChart(pairs:ForecastPair[], domain:Domain, months:number): ForecastDataPoint[] {
    const selected=pairs.filter(p=>p.domain===domain);
    if (!selected.length) return [];
    const mean=(values:number[])=>Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2));
    const point=(month:string,value:number,timeOffset:number,actual:boolean):ForecastDataPoint=>({month,timeOffset,actual:actual?value:null,predicted:value,predicted_upper:value,predicted_lower:value});
    return [point('2024',mean(selected.map(p=>p.previousRisk)),0,true),point('2025',mean(selected.map(p=>p.currentRisk)),12,true),point(`2025 + ${months} bln`,mean(projectForecast(pairs,domain,months).map(p=>p.predictedRisk)),12+months,false)];
}
