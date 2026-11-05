import {
ActiveAlertData,
AlertLevel,
AppData,
DataSource,
Domain,
DomainData,
DomainFilter,
DomainIndicatorData,
DomainMetric,
DomainMetrics,
InterventionPlan,
KabupatenKotaDetailData,
KeyIndicatorData,
LogEntry,
ParentData,
RegionalForecastData,
RegionalRiskScore,
RegionDetailData,
ResourceData
} from '../types';

// --- UTILITY FUNCTIONS ---
const parseValue = (val: string | undefined | number): number | null => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return val;
  const strVal = String(val).trim();
  if (strVal === 'NA' || strVal === '–' || strVal === '') return null;
  return parseFloat(strVal.replace(',', '.'));
};

const parsePopulation = (val: string | undefined): number => {
    if (!val) return 0;
    // Removes ~, dots, and then parses as integer.
    return parseInt(val.replace(/[~.]/g, ''), 10) || 0;
};

const generateId = (name: string): string => {
    return name.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
}

const generateHistoricalData = (baseScore: number, length: number = 6): { month: string; score: number }[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
    return months.slice(-length).map(month => ({
        month,
        score: parseFloat(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 10)).toFixed(1))
    }));
};

// --- DATA LOADING & PROCESSING ---
const CACHE_KEY = 'ceria_data_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const loadAndProcessData = async (): Promise<AppData> => {
    // 1. Try to load from cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                console.log('🚀 Loading CERIA data from cache');
                const parsedData = data as AppData;
                parsedData.getRegionDetails = (regionId: string) => parsedData.regionsDetails[regionId] || null;
                parsedData.getAvailableRegions = () => Object.values(parsedData.regionsDetails).map(r => ({ id: r.id, name: r.name })).sort((a,b) => a.name.localeCompare(b.name));
                parsedData.getDomainData = (domainId: string) => parsedData.domainsData[domainId] || null;
                return parsedData;
            }
        } catch (e) {
            console.warn('⚠️ Cache corrupted, falling back to fetch');
        }
    }

    console.log('📡 Fetching aggregated CERIA data...');
    const response = await fetch('/data/ceria_aggregated.json');
    if (!response.ok) throw new Error('Gagal memuat data master CERIA');
    
    const rawData = await response.json();
    
    const {
        kesehatan_lingkungan: kesehatanLingkunganRawData,
        perkawinan_anak: perkawinanAnakRawData,
        kasus_perlindungan_anak: kasusPerlindunganAnakRawData,
        paud_akreditasi: paudAccreditationRawData,
        paud_kualifikasi_guru: paudTeacherQualificationRawData,
        anc: ancData,
        gizi: nutritionData,
        akta: aktaData,
        idl: idlData,
        kemiskinan: kemiskinanData,
        pkh: pkhData,
        sanitasi: sanitasiData,
        populasi_anak_usia_dini: anakUsiaDiniPopulationRawData,
        partisipasi_paud: paudParticipationRawData,
    } = rawData;
    
    // Process auxiliary data for tables
    const paudAccreditationData = (paudAccreditationRawData as any[]).map((d: any) => ({
        'Provinsi': d.provinsi,
        'Jumlah PAUD': d.jumlah,
        'Status Akreditasi': `${d.akreditasi}%`,
        'Rasio Guru-Murid': d.rasio
    }));
    
    const paudTeacherQualificationData = (paudTeacherQualificationRawData as any[]).map((d: any) => ({
        'Provinsi': d.provinsi,
        'Jumlah Guru PAUD': d.jumlah,
        'Guru Kualifikasi S1/D4': d.s1d4,
        'Persentase (%)': `${d.persentase.toFixed(2)}%`
    }));

    const allProvinceNames = new Set([
        ...Object.keys(aktaData),
        ...Object.keys(kesehatanLingkunganRawData),
        ...Object.keys(perkawinanAnakRawData)
    ]);
    const provinces = Array.from(allProvinceNames);

    // --- MOCK DATA GENERATION LOGIC ---
    const regionsDetails: Record<string, RegionDetailData> = {};

    provinces.forEach(provName => {
        const id = generateId(provName);
        
        const createDomainMetrics = (metrics: (DomainMetric | null)[]): DomainMetrics => {
            const validMetrics = metrics.filter((m): m is DomainMetric => m !== null);
            if (validMetrics.length === 0) return { riskScore: 0, metrics: [] };
            let totalRisk = 0;
            const riskContributingMetrics = validMetrics.filter(m => !m.label.trim().startsWith('-'));
            riskContributingMetrics.forEach(m => {
                const value = typeof m.value === 'number' ? m.value : (parseValue(m.value) || 0);
                let risk;
                if (m.maxValueForRisk) {
                    const normalizedValue = Math.min(100, (value / m.maxValueForRisk) * 100);
                    risk = m.higherIsBetter ? 100 - normalizedValue : normalizedValue;
                } else {
                    risk = m.higherIsBetter ? 100 - value : value;
                }
                totalRisk += risk;
            });
            const riskScore = riskContributingMetrics.length > 0 ? parseFloat((totalRisk / riskContributingMetrics.length).toFixed(1)) : 0;
            return { riskScore, metrics: validMetrics };
        };
        
        let lookupKey = provName;
        if (provName === 'Kep. Riau') lookupKey = 'Kepulauan Riau';
        if (provName === 'Kep. Bangka Belitung') lookupKey = 'Kepulauan Bangka Belitung';

        const newHealthData = (kesehatanLingkunganRawData as any)[lookupKey];
        const vKeluhan = newHealthData ? newHealthData.keluhan : null;
        const vKesakitan = newHealthData ? newHealthData.kesakitan : null;
        
        const provNutrition = (nutritionData as any)[provName];
        const vStunting = provNutrition ? parseFloat((provNutrition.severelyStunted + provNutrition.stunted).toFixed(1)) : null;
        const vWasting = provNutrition ? parseFloat((provNutrition.severelyWasted + provNutrition.wasted).toFixed(1)) : null;
        const vUnderweight = provNutrition ? parseFloat((provNutrition.severelyUnderweight + provNutrition.underweight).toFixed(1)) : null;
        
        const provAnc = (ancData as any)[provName];
        const vAnc = provAnc ? provAnc.anc : null;
        const vPersalinan = provAnc ? provAnc.persalinan : null;
        
        const vAkta = parseValue((aktaData as any)[provName]);
        const vPerkawinanAnak = (perkawinanAnakRawData as any)[provName] ?? null;
        
        let provKasusName = provName;
        if (provName === 'Kepulauan Riau') provKasusName = 'Kep. Riau';
        const vKasus = (kasusPerlindunganAnakRawData as any)[provKasusName] ?? 0;
        
        const vIdl = parseValue((idlData as any)[provName]);
        const vKemiskinan = parseValue((kemiskinanData as any)[provName]);
        const vPkh = parseValue((pkhData as any)[provName]);
        
        const sanData = (sanitasiData as any)[provName];
        const vAir = parseValue(sanData?.air);
        let vSanitasi = newHealthData?.sanitasi ?? parseValue(sanData?.sanitasi);
        
        const paudProvData = (paudParticipationRawData as any)[provName];
        const vPaud06 = parseValue(paudProvData?.partisipasi_0_6);
        const vPaudPraSD = parseValue(paudProvData?.partisipasi_pra_sd);
        
        // --- 1. Kesehatan dan Gizi ---
        const kesehatanDanGizi = createDomainMetrics([
            vStunting !== null ? { label: 'Prevalensi Stunting (TB/U)', value: vStunting, unit: '%', nationalAverage: 21.8, higherIsBetter: false } : null,
            vWasting !== null ? { label: 'Gizi Buruk (Wasting)', value: vWasting, unit: '%', nationalAverage: 7.7, higherIsBetter: false } : null,
            vUnderweight !== null ? { label: 'Gizi Kurang (Underweight)', value: vUnderweight, unit: '%', nationalAverage: 17.7, higherIsBetter: false } : null,
            vIdl !== null ? { label: 'Cakupan Imunisasi Dasar (IDL)', value: vIdl, unit: '%', nationalAverage: 63.7, higherIsBetter: true } : null,
            vAnc !== null ? { label: 'Kunjungan ANC K4', value: vAnc, unit: '%', nationalAverage: 93.5, higherIsBetter: true } : null,
            vPersalinan !== null ? { label: 'Persalinan oleh Nakes', value: vPersalinan, unit: '%', nationalAverage: 90.3, higherIsBetter: true } : null,
            vKeluhan !== null ? { label: 'Tingkat Keluhan Kesehatan', value: vKeluhan, unit: '%', nationalAverage: 38.71, higherIsBetter: false } : null,
            vKesakitan !== null ? { label: 'Angka Kesakitan', value: vKesakitan, unit: '%', nationalAverage: 20.20, higherIsBetter: false } : null
        ]);

        // --- 2. Pendidikan ---
        const pendidikan = createDomainMetrics([
            vPaud06 !== null ? { label: 'Partisipasi PAUD (0–6 th)', value: vPaud06, unit: '%', nationalAverage: 27.3, higherIsBetter: true } : null,
            vPaudPraSD !== null ? { label: 'Partisipasi 1 Th Sebelum SD', value: vPaudPraSD, unit: '%', nationalAverage: 95.2, higherIsBetter: true } : null
        ]);

        // --- 3. Pengasuhan ---
        // Mock data for parenting/stimulation since direct source is sparse
        const mockStimulation = parseFloat((75 + Math.random() * 15).toFixed(1));
        const pengasuhan = createDomainMetrics([
             { label: 'Stimulasi Perkembangan', value: mockStimulation, unit: '%', nationalAverage: 80, higherIsBetter: true },
             { label: 'Praktik Pengasuhan Positif', value: parseFloat((mockStimulation - 5).toFixed(1)), unit: '%', nationalAverage: 75, higherIsBetter: true }
        ]);

        // --- 4. Perlindungan ---
        const perlindungan = createDomainMetrics([
            vAkta !== null ? { label: 'Kepemilikan Akta Lahir', value: vAkta, unit: '%', nationalAverage: 88, higherIsBetter: true } : null,
            vPerkawinanAnak !== null ? { label: 'Perkawinan Usia Anak (<18 th)', value: vPerkawinanAnak, unit: '%', nationalAverage: 5.9, higherIsBetter: false } : null,
            { label: 'Jumlah Kasus Kekerasan Anak', value: vKasus, unit: 'kasus', nationalAverage: 1000, higherIsBetter: false, maxValueForRisk: 5000 }
        ]);

        // --- 5. Kesejahteraan Sosial (Combines Kemiskinan + Lingkungan) ---
        const kesejahteraanSosial = createDomainMetrics([
            vKemiskinan !== null ? { label: 'Anak di Bawah Garis Kemiskinan', value: vKemiskinan, unit: '%', nationalAverage: 12.4, higherIsBetter: false } : null,
            vPkh !== null ? { label: 'Keluarga Penerima PKH', value: vPkh, unit: '%', nationalAverage: 15.1, higherIsBetter: false } : null,
            vAir !== null ? { label: 'Akses Air Minum Layak', value: vAir, unit: '%', nationalAverage: 91, higherIsBetter: true } : null,
            vSanitasi !== null ? { label: 'Akses Sanitasi Layak', value: vSanitasi, unit: '%', nationalAverage: 83.22, higherIsBetter: true } : null
        ]);

        const domains = { 
            'Kesehatan & Gizi': kesehatanDanGizi, 
            'Pendidikan': pendidikan, 
            'Pengasuhan': pengasuhan, 
            'Perlindungan': perlindungan, 
            'Kesejahteraan Sosial': kesejahteraanSosial 
        };
        
        // Calculate overall risk
        const validDomains = Object.values(domains).filter(d => d.metrics.length > 0);
        const overallRisk = validDomains.length > 0 
            ? parseFloat((validDomains.reduce((sum, d) => sum + d.riskScore, 0) / validDomains.length).toFixed(1))
            : 0;

        regionsDetails[id] = {
            id, name: provName, overallRisk, population: parsePopulation((anakUsiaDiniPopulationRawData as any)[provName]), activeAlertsCount: 0, domains, historicalRisk: generateHistoricalData(overallRisk),
        };
    });

    // --- INTEGRATE ADDITIONAL DATA (Education updates) ---
    const nameToIdMap = new Map(Object.values(regionsDetails).map(r => [r.name, r.id]));
    
    (paudAccreditationRawData as any[]).forEach((newProvData: any) => {
        const provNameKey = newProvData.provinsi === 'Kepulauan Bangka Belitung' ? 'Kep. Bangka Belitung' : newProvData.provinsi;
        const provinceId = nameToIdMap.get(provNameKey);
        if (provinceId && regionsDetails[provinceId]) {
            const province = regionsDetails[provinceId];
            if (newProvData.provinsi === 'Kepulauan Bangka Belitung') province.name = 'Kepulauan Bangka Belitung';
            const educationMetrics = province.domains['Pendidikan'].metrics;
            educationMetrics.push({ label: 'Jumlah Satuan PAUD', value: newProvData.jumlah, unit: '', nationalAverage: 1500, higherIsBetter: true, });
            educationMetrics.push({ label: 'Persentase Akreditasi PAUD', value: newProvData.akreditasi, unit: '%', nationalAverage: 75, higherIsBetter: true, });
            const ratioValue = parseInt(newProvData.rasio.split(':')[1], 10);
            educationMetrics.push({ label: 'Rasio Guru-Murid', value: `1:${ratioValue}`, unit: '', nationalAverage: 12, higherIsBetter: false, });
            
            // Recalculate Education Risk
            let totalRisk = 0;
            const riskMetrics: {value: number, higherIsBetter: boolean}[] = [];
            educationMetrics.forEach(m => {
                const numericVal = typeof m.value === 'number' ? m.value : (parseValue(m.value) || 0);
                if (m.label !== 'Jumlah Satuan PAUD') {
                     if (m.label === 'Rasio Guru-Murid') {
                         if (!isNaN(ratioValue)) riskMetrics.push({ value: ratioValue, higherIsBetter: false });
                     } else {
                         riskMetrics.push({ value: numericVal, higherIsBetter: m.higherIsBetter });
                     }
                }
            });
            riskMetrics.forEach(m => { totalRisk += m.higherIsBetter ? 100 - m.value : m.value; });
            province.domains['Pendidikan'].riskScore = riskMetrics.length > 0 ? parseFloat((totalRisk / riskMetrics.length).toFixed(1)) : province.domains['Pendidikan'].riskScore;
            
            // Recalculate Overall Risk
            const validDomains = Object.values(province.domains).filter(d => d.metrics.length > 0);
            province.overallRisk = validDomains.length > 0 
                ? parseFloat((validDomains.reduce((sum, d) => sum + d.riskScore, 0) / validDomains.length).toFixed(1))
                : 0;
        }
    });

    (paudTeacherQualificationRawData as any[]).forEach((teacherData: any) => {
        let provNameKey = teacherData.provinsi;
        if (provNameKey === 'Kep. Riau') provNameKey = 'Kepulauan Riau';
        const provinceId = nameToIdMap.get(provNameKey);
        if (provinceId && regionsDetails[provinceId]) {
            const province = regionsDetails[provinceId];
            const educationMetrics = province.domains['Pendidikan'].metrics;
            educationMetrics.push({ label: 'Jumlah Guru PAUD', value: teacherData.jumlah, unit: '', nationalAverage: 35000, higherIsBetter: true, });
            educationMetrics.push({ label: 'Persentase Guru S1/D4', value: teacherData.persentase, unit: '%', nationalAverage: 94, higherIsBetter: true, });
            
            // Recalculate Education Risk
            let totalRisk = 0;
            const riskMetrics: {value: number, higherIsBetter: boolean}[] = [];
            educationMetrics.forEach(m => {
                const numericVal = typeof m.value === 'number' ? m.value : (parseValue(m.value) || 0);
                if (m.label !== 'Jumlah Satuan PAUD' && m.label !== 'Jumlah Guru PAUD') {
                     if (m.label === 'Rasio Guru-Murid') {
                         const ratio = typeof m.value === 'string' && m.value.includes(':') ? parseInt(m.value.split(':')[1], 10) : 0;
                         if (ratio > 0) riskMetrics.push({ value: ratio, higherIsBetter: false });
                     } else {
                         riskMetrics.push({ value: numericVal, higherIsBetter: m.higherIsBetter });
                     }
                }
            });
            riskMetrics.forEach(m => { totalRisk += m.higherIsBetter ? 100 - m.value : m.value; });
            province.domains['Pendidikan'].riskScore = riskMetrics.length > 0 ? parseFloat((totalRisk / riskMetrics.length).toFixed(1)) : province.domains['Pendidikan'].riskScore;
            
            // Recalculate Overall Risk
            const validDomains = Object.values(province.domains).filter(d => d.metrics.length > 0);
            province.overallRisk = validDomains.length > 0 
                ? parseFloat((validDomains.reduce((sum, d) => sum + d.riskScore, 0) / validDomains.length).toFixed(1))
                : 0;
        }
    });

    // --- DERIVED & OTHER MOCK DATA ---
    const kabupatenKotaDetails: Record<string, KabupatenKotaDetailData> = {};
    const allActiveAlerts: ActiveAlertData[] = Object.values(regionsDetails).flatMap(region => {
        const alerts: ActiveAlertData[] = [];
        Object.entries(region.domains).forEach(([domainName, domainData]) => {
            if (domainData.riskScore > 85) alerts.push({ id: `${region.id}-${domainName}-crit`, level: AlertLevel.Critical, title: `Risiko Sangat Tinggi di Bidang ${domainName}`, region: region.name, domain: domainName as Domain, riskScore: domainData.riskScore });
            else if (domainData.riskScore > 70) alerts.push({ id: `${region.id}-${domainName}-high`, level: AlertLevel.High, title: `Risiko Tinggi di Bidang ${domainName}`, region: region.name, domain: domainName as Domain, riskScore: domainData.riskScore, trend: parseFloat(((Math.random()-0.2) * 5).toFixed(1)) });
        });
        return alerts;
    }).sort((a,b) => b.riskScore - a.riskScore);
    Object.values(regionsDetails).forEach(r => { r.activeAlertsCount = allActiveAlerts.filter(a => a.region === r.name).length; });
    const nationalHistoricalRisk = generateHistoricalData(Object.values(regionsDetails).reduce((sum, r) => sum + r.overallRisk, 0) / provinces.length, 6);
    const regionalForecastData: RegionalForecastData[] = [];
    const getRiskLevel = (score: number): 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah' => { if (score > 85) return 'Kritis'; if (score > 70) return 'Tinggi'; if (score > 55) return 'Sedang'; return 'Rendah'; };
    let forecastId = 1;
    const relevantDomainsForForecast: Domain[] = ['Kesehatan & Gizi', 'Pendidikan', 'Pengasuhan', 'Perlindungan', 'Kesejahteraan Sosial'];
    Object.values(regionsDetails).forEach(region => {
        relevantDomainsForForecast.forEach(domain => {
            const currentRisk = region.domains[domain].riskScore;
            if (currentRisk > 0) {
                const change = parseFloat(((Math.random() - 0.5) * 10).toFixed(1));
                const predictedRisk = Math.max(0, Math.min(100, parseFloat((currentRisk + change).toFixed(1))));
                regionalForecastData.push({ id: forecastId++, region: region.name, domain: domain, currentRisk, predictedRisk, change, currentRiskLevel: getRiskLevel(currentRisk), predictedRiskLevel: getRiskLevel(predictedRisk), });
            }
        });
    });
    const domainsData: Record<string, DomainData> = {};
    const domainKeys: Domain[] = ['Kesehatan & Gizi', 'Pendidikan', 'Pengasuhan', 'Perlindungan', 'Kesejahteraan Sosial'];
    domainKeys.forEach(domain => {
        const regionsForDomain = Object.values(regionsDetails).map(r => ({ id: r.id, name: r.name, riskScore: r.domains[domain].riskScore, trend: parseFloat(((Math.random() - 0.5) * 5).toFixed(1)) })).sort((a,b) => b.riskScore - a.riskScore);
        const firstRegionWithMetrics = Object.values(regionsDetails).find(r => r.domains[domain]?.metrics.length > 0);
        const sampleMetrics = firstRegionWithMetrics ? firstRegionWithMetrics.domains[domain].metrics : [];
        const indicators: DomainIndicatorData[] = sampleMetrics.map(metric => {
            const allValuesRaw = Object.values(regionsDetails).map(r => r.domains[domain]?.metrics.find(m => m.label === metric.label)?.value).filter(v => v !== undefined);
            const allValues = allValuesRaw.map(v => {
                if (typeof v === 'string') {
                    if (v.includes(':')) return parseInt(v.split(':')[1], 10);
                    const parsed = parseFloat(v.replace(',', '.'));
                    return isNaN(parsed) ? 0 : parsed;
                }
                return v;
            }).filter(v => v !== null && !isNaN(v as number));
            if (allValues.length === 0) return { indicatorName: metric.label, nationalAverage: `${metric.nationalAverage}${metric.unit}`, bestPerformer: { name: 'N/A', value: `N/A` }, worstPerformer: { name: 'N/A', value: `N/A` } };
            const best = metric.higherIsBetter ? Math.max(...allValues) : Math.min(...allValues);
            const worst = metric.higherIsBetter ? Math.min(...allValues) : Math.max(...allValues);
            const findPerformer = (value: number) => Object.values(regionsDetails).find(r => {
                const val = r.domains[domain]?.metrics.find(m => m.label === metric.label)?.value;
                if (typeof val === 'string' && val.includes(':')) return parseInt(val.split(':')[1], 10) === value;
                const numericVal = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
                return numericVal === value;
            });
            const formatValue = (v: number | string) => metric.label.includes('Rasio') ? `1:${v}` : `${v}${metric.unit}`;
            return { indicatorName: metric.label, nationalAverage: formatValue(metric.nationalAverage), bestPerformer: { name: findPerformer(best)?.name || 'N/A', value: formatValue(best) }, worstPerformer: { name: findPerformer(worst)?.name || 'N/A', value: formatValue(worst) } };
        });
        domainsData[domain] = { id: domain, name: domain, averageRisk: parseFloat((regionsForDomain.reduce((sum, r) => sum + r.riskScore, 0) / regionsForDomain.length).toFixed(1)), criticalRegionsCount: regionsForDomain.filter(r => r.riskScore > 70).length, regions: regionsForDomain, topAlerts: allActiveAlerts.filter(a => a.domain === domain).slice(0, 3), indicators };
    });
    
    // Helper to calc average
    const calculateNationalAverage = (getter: (r: RegionDetailData) => number | null | undefined): KeyIndicatorData => {
        const values = Object.values(regionsDetails).map(getter).filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
        const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
        return { value: `${avg.toFixed(1)}%`, label: '', change: parseFloat(((Math.random() - 0.5) * 5).toFixed(1)), changeType: Math.random() > 0.5 ? 'increase' : 'decrease', domain: 'Semua' };
    };

    const keyIndicatorsByDomain: Record<DomainFilter, KeyIndicatorData[]> = {
        'Semua': [ { ...calculateNationalAverage(r => { const m = r.domains['Pendidikan'].metrics.find(m => m.label.includes('PAUD (0–6 th)')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Rata-rata Partisipasi PAUD Nasional' }, { ...calculateNationalAverage(r => { const m = r.domains['Perlindungan'].metrics.find(m => m.label.includes('Akta')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Rata-rata Kepemilikan Akta Lahir' }, { ...calculateNationalAverage(r => { const m = r.domains['Kesehatan & Gizi'].metrics.find(m => m.label.includes('Wasting')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Rata-rata Gizi Buruk (Wasting)' }, ],
        'Kesehatan & Gizi': [ { ...calculateNationalAverage(r => { const m = r.domains['Kesehatan & Gizi'].metrics.find(m => m.label.includes('Stunting')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Prevalensi Stunting' }, { ...calculateNationalAverage(r => { const m = r.domains['Kesehatan & Gizi'].metrics.find(m => m.label.includes('Imunisasi')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Cakupan Imunisasi Dasar' }, { ...calculateNationalAverage(r => { const m = r.domains['Kesehatan & Gizi'].metrics.find(m => m.label.includes('ANC')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Kunjungan ANC K4' }, ],
        'Pendidikan': [ { ...calculateNationalAverage(r => { const m = r.domains['Pendidikan'].metrics.find(m => m.label.includes('PAUD (0–6 th)')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Partisipasi PAUD (0–6 th)' }, { ...calculateNationalAverage(r => { const m = r.domains['Pendidikan'].metrics.find(m => m.label.includes('Sebelum SD')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Partisipasi 1 Th Sebelum SD' }, ],
        'Pengasuhan': [ { ...calculateNationalAverage(r => { const m = r.domains['Pengasuhan'].metrics.find(m => m.label.includes('Stimulasi')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Stimulasi Perkembangan' }],
        'Perlindungan': [ { ...calculateNationalAverage(r => { const m = r.domains['Perlindungan'].metrics.find(m => m.label.includes('Akta')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Kepemilikan Akta Lahir' } ],
        'Kesejahteraan Sosial': [ { ...calculateNationalAverage(r => { const m = r.domains['Kesejahteraan Sosial'].metrics.find(m => m.label.includes('Kemiskinan')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Anak di Bawah Garis Kemiskinan' }, { ...calculateNationalAverage(r => { const m = r.domains['Kesejahteraan Sosial'].metrics.find(m => m.label.includes('Air')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Akses Air Minum Layak' }, { ...calculateNationalAverage(r => { const m = r.domains['Kesejahteraan Sosial'].metrics.find(m => m.label.includes('Sanitasi')); return typeof m?.value === 'number' ? m.value : parseValue(m?.value as string); }), label: 'Akses Sanitasi Layak' } ],
    };
    
    const getRegionDetails = (regionId: string): RegionDetailData | null => regionsDetails[regionId] || null;
    const getAvailableRegions = () => Object.values(regionsDetails).map(r => ({ id: r.id, name: r.name })).sort((a,b) => a.name.localeCompare(b.name));
    const getDomainData = (domainId: string): DomainData | null => domainsData[domainId] || null;
    const dataSources: DataSource[] = [ { id: 'kemendikbud', name: 'Kemendikbud Ristek', status: 'connected', lastSync: 'Hari ini, 08:00' }, { id: 'kemenkes', name: 'Kementerian Kesehatan', status: 'connected', lastSync: 'Hari ini, 08:05' }, { id: 'kemensos', name: 'Kementerian Sosial', status: 'delayed', lastSync: 'Kemarin, 17:30' }, { id: 'kemen-pppa', name: 'KemenPPPA', status: 'error', lastSync: '3 hari lalu' }, ];
    const processingLogs: LogEntry[] = [ { timestamp: '10:15:01', level: 'INFO', message: 'Data pipeline execution started.' }, { timestamp: '10:15:05', level: 'INFO', message: 'Successfully fetched 38 records from Kemenkes API.' }, { timestamp: '10:15:08', level: 'INFO', message: 'Successfully fetched 38 records from Kemendikbud API.' }, { timestamp: '10:15:10', level: 'WARN', message: 'Kemensos API response delayed. Using cached data from 2024-06-29.' }, { timestamp: '10:15:12', level: 'ERROR', message: 'Failed to connect to KemenPPPA API. Endpoint returned 503.' }, { timestamp: '10:16:00', level: 'INFO', message: 'Data aggregation and cleaning complete.' }, { timestamp: '10:17:30', level: 'INFO', message: 'Risk score recalculation finished for all regions.' }, { timestamp: '10:17:32', level: 'INFO', message: 'Data pipeline execution finished successfully.' }, ];
    const mockInterventionPlans: InterventionPlan[] = [];
    const mockResourceData: ResourceData = { sdm: [], anggaran: [], material: [], };
    const regionalRiskScores: RegionalRiskScore[] = Object.values(regionsDetails).map(r => ({ name: r.name, score: r.overallRisk }));
    const mockParentData: ParentData = { childProfile: { name: 'Anak Anda', age: 'Data belum ada', avatarUrl: 'https://i.pravatar.cc/150?u=defaultchild', lastWeight: null, lastHeight: null, }, upcomingEvents: [], growthHistory: [], stimulationChecklist: [], };

    const result: AppData = {
        regionsDetails,
        kabupatenKotaDetails,
        allActiveAlerts,
        nationalHistoricalRisk,
        regionalForecastData,
        domainsData,
        keyIndicatorsByDomain,
        paudParticipationData2024: Object.entries(paudParticipationRawData).map(([provinsi, values]: [string, any]) => ({ provinsi, partisipasiPaud0to6Th: parseValue(values.partisipasi_0_6), partisipasi1ThSebelumSD: parseValue(values.partisipasi_pra_sd), })),
        paudAccreditationData,
        paudTeacherQualificationData,
        riskAssessmentData: [],
        forecastChartData: [],
        dataSources,
        processingLogs,
        mockInterventionPlans,
        mockResourceData,
        regionalRiskScores,
        mockParentData,
        getRegionDetails,
        getAvailableRegions,
        getDomainData,
    };

    // 3. Save to cache
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: result,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('⚠️ Failed to save CERIA data to cache (possibly quota exceeded)');
    }

    return result;
}