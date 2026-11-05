import { build2025 } from './yearData';

// Read the archived values directly, without the legacy mockData generators.
export function build2024(raw: any) {
    const numeric = (v: unknown): number | null => {
        if (v === null || v === undefined || String(v).trim() === '') return null;
        const n = Number(String(v).replace(',', '.'));
        return Number.isFinite(n) ? n : null;
    };
    const normalize = (s: string) => s.toLowerCase().replace(/kepulauan|kep\./g, 'kep').replace(/[^a-z0-9]/g, '');
    const names = Object.keys(raw.akta);
    const datasets: { entry: any; data: any }[] = [];
    const add = (id: string, domain: string, source: string, fields: Record<string, string>, transform?: (row: any) => any) => {
        const lookup = new Map(Object.entries(raw[source] || {}).map(([name, row]) => [normalize(name), row]));
        datasets.push({
            entry: { id, proposedDomain: domain, fieldPaths: Object.keys(fields) },
            data: {
                title: source, year: 2024, unit: '%', national: null,
                source: 'Arsip aplikasi: public/data/ceria_aggregated.json; sumber asli dan tahun pengamatan belum diverifikasi.',
                analysisScope: 'Data provinsi dalam arsip 2024. Tidak tersedia angka nasional atau deret waktu. Skor risiko adalah rata-rata indikator tersedia, bukan prevalensi; jangan menyimpulkan tren atau hubungan sebab-akibat.',
                indicators: Object.fromEntries(Object.entries(fields).map(([key, label]) => [key, { label }])),
                provinces: names.map(province => {
                    const original: any = lookup.get(normalize(province));
                    const row = transform ? transform(original) : original;
                    return { province, ...Object.fromEntries(Object.keys(fields).map(key => [key, numeric(row?.[key])])) };
                })
            }
        });
    };
    add('imunisasi', 'Kesehatan & Gizi', 'idl', { idl: 'Imunisasi Dasar Lengkap' }, v => ({ idl: v }));
    add('gizi', 'Kesehatan & Gizi', 'gizi', { stunting: 'Stunting', wasting: 'Wasting', underweight: 'Underweight' }, v => {
        const sum = (a: string, b: string) => numeric(v?.[a]) === null || numeric(v?.[b]) === null ? null : Number((numeric(v[a])! + numeric(v[b])!).toFixed(2));
        return { stunting: sum('severelyStunted', 'stunted'), wasting: sum('severelyWasted', 'wasted'), underweight: sum('severelyUnderweight', 'underweight') };
    });
    add('kia', 'Kesehatan & Gizi', 'anc', { anc: 'Kunjungan ANC (definisi arsip)', persalinan: 'Persalinan (definisi arsip)' });
    add('kesehatan_lingkungan', 'Kesehatan & Gizi', 'kesehatan_lingkungan', { keluhan: 'Keluhan kesehatan', kesakitan: 'Angka kesakitan' });
    add('partisipasi_paud', 'Pendidikan', 'partisipasi_paud', { partisipasi_0_6: 'Partisipasi PAUD usia 0–6 tahun', partisipasi_pra_sd: 'Partisipasi prasekolah sebelum SD' });
    add('identitas_anak', 'Perlindungan', 'akta', { akta: 'Kepemilikan Akta Kelahiran' }, v => ({ akta: v }));
    add('perkawinan_anak', 'Perlindungan', 'perkawinan_anak', { perkawinan_anak: 'Perkawinan Anak' }, v => ({ perkawinan_anak: v }));
    add('kemiskinan', 'Kesejahteraan Sosial', 'kemiskinan', { kemiskinan: 'Kemiskinan anak (definisi arsip)' }, v => ({ kemiskinan: v }));
    add('pkh', 'Kesejahteraan Sosial', 'pkh', { pkh: 'Penerima PKH' }, v => ({ pkh: v }));
    add('infrastruktur', 'Kesejahteraan Sosial', 'sanitasi', { air: 'Air minum layak', sanitasi: 'Sanitasi layak', cuci: 'Fasilitas cuci tangan' });
    return { ...build2025(datasets, 2024), forecastPairs: [] };
}

export async function load2024(signal?: AbortSignal) {
    const response = await fetch('/data/ceria_aggregated.json', { signal });
    if (!response.ok) throw new Error('Gagal memuat arsip data 2024');
    return build2024(await response.json());
}
