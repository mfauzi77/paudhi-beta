import React from 'react';
// Fix: Import `Domain`, `DomainData`, and `DomainMetrics` to resolve type inference issues in the component.
import { DOMAIN_ITEMS } from '../../constants';
import { useData } from '../../context/DataContext';
import { Domain,DomainComparisonData,DomainData,DomainMetrics,MonthlySummaryData,RegionPerformance,ReportData } from '../../types';
import DomainBreakdown from '../dataperwilayah/DomainBreakdown';
import RegionalAnalysisInsight from '../dataperwilayah/RegionalAnalysisInsight';
import RegionalProfileRadarChart from '../dataperwilayah/RegionalProfileRadarChart';
import RegionSummary from '../dataperwilayah/RegionSummary';
import { CalendarIcon,ChevronDownIcon,ChevronUpIcon,DocumentArrowDownIcon,DocumentChartBarIcon,ExclamationTriangleIcon,MinusIcon,TrendingDownIcon,TrendingUpIcon,TrophyIcon } from '../icons/Icons';

interface ReportDisplayProps {
    reportData: ReportData | null;
    isLoading: boolean;
    error: string | null;
}

const MonthlyPerformanceContent: React.FC<{ data: MonthlySummaryData }> = ({ data }) => {
    const TrendIndicator: React.FC<{ change: number; type: 'increase' | 'decrease' | 'stable' }> = ({ change, type }) => {
        if (type === 'stable' || change === 0) {
            return (<div className="flex items-center text-xs font-bold text-slate-500"><MinusIcon /><span className="ml-1">Stabil</span></div>);
        }
        const isPositiveChange = change > 0;
        const isGood = (type === 'increase' && isPositiveChange) || (type === 'decrease' && !isPositiveChange);
        const color = isGood ? 'text-emerald-500' : 'text-red-500';
        const icon = isPositiveChange ? <ChevronUpIcon /> : <ChevronDownIcon />;
        return (<div className={`flex items-center text-xs font-bold ${color}`}>{icon}<span className="ml-1">{Math.abs(change)}%</span></div>);
    };

    const MoverList: React.FC<{ title: string, regions: RegionPerformance[], color: string }> = ({ title, regions, color }) => (
        <div>
            <h3 className={`text-base font-bold text-slate-800 mb-2`}>{title}</h3>
            <ul className="space-y-2">
                {regions.map(region => (
                    <li key={region.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                        <span className="text-sm font-semibold">{region.name}</span>
                        <div className={`flex items-center font-bold text-sm ${color}`}>
                            {region.trend >= 0 ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                            {region.trend > 0 ? '+' : ''}{region.trend.toFixed(1)}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="space-y-10">
            <section>
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Ringkasan Nasional</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-slate-500">Skor Risiko Nasional</p>
                        <p className="text-2xl font-bold text-indigo-600">{data.nationalRisk.score.toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-slate-100 rounded-lg">
                        <p className="text-sm text-slate-500">Perubahan Bulanan</p>
                        <p className={`text-2xl font-bold ${data.nationalRisk.change >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {data.nationalRisk.change > 0 ? '+' : ''}{data.nationalRisk.change.toFixed(1)}
                        </p>
                    </div>
                </div>
            </section>
            <section>
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Indikator Kunci Nasional</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data.keyIndicators.map(indicator => (
                        <div key={indicator.label} className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-semibold text-slate-700 h-10">{indicator.label}</p>
                            <p className="text-3xl font-bold text-indigo-600">{indicator.value}</p>
                            <div className="mt-2"><TrendIndicator change={indicator.change} type={indicator.changeType} /></div>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Pergerakan Risiko Regional</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <MoverList title="Wilayah Dengan Perbaikan Terbesar" regions={data.topImprovingRegions} color="text-emerald-500" />
                    <MoverList title="Wilayah Dengan Pemburukan Terbesar" regions={data.topWorseningRegions} color="text-red-500" />
                </div>
            </section>
        </div>
    );
};

const DomainComparisonContent: React.FC<{ data: DomainComparisonData }> = ({ data }) => {
    
    const getRiskColor = (score: number) => {
        if (score > 75) return 'bg-red-500';
        if (score > 60) return 'bg-orange-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    return (
        <section>
             <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Tabel Perbandingan Antar Domain</h2>
             <div className="overflow-x-auto not-prose">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-2 sm:px-6 py-3 rounded-l-lg">Domain Layanan</th>
                            <th scope="col" className="px-2 sm:px-6 py-3 text-center">Rata-rata Risiko</th>
                            <th scope="col" className="px-2 sm:px-6 py-3 text-center">Wilayah Kritis</th>
                            <th scope="col" className="px-2 sm:px-6 py-3">Performa Terbaik</th>
                            <th scope="col" className="px-2 sm:px-6 py-3 rounded-r-lg">Performa Terendah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.stats.map(stat => {
                            const domainInfo = DOMAIN_ITEMS.find(d => d.id === stat.domain);
                            return(
                                <tr key={stat.domain} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-2 sm:px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {domainInfo?.icon}
                                            <span className="ml-2">{stat.domain}</span>
                                        </div>
                                    </th>
                                    <td className="px-2 sm:px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-lg">{stat.averageRisk.toFixed(1)}</span>
                                            <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                                                <div className={`h-2 rounded-full ${getRiskColor(stat.averageRisk)}`} style={{width: `${stat.averageRisk}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                     <td className="px-2 sm:px-6 py-4 text-center font-bold text-lg text-red-600">{stat.criticalRegionsCount}</td>
                                    <td className="px-2 sm:px-6 py-4">
                                        <div className="flex items-center text-xs">
                                            <TrophyIcon className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
                                            <div className="truncate">
                                                <span className="font-semibold">{stat.bestPerformer?.name}</span>
                                                <span className="text-slate-500"> ({stat.bestPerformer?.riskScore})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-6 py-4">
                                        <div className="flex items-center text-xs">
                                            <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                                            <div>
                                                <span className="font-semibold">{stat.worstPerformer?.name}</span>
                                                <span className="text-slate-500"> ({stat.worstPerformer?.riskScore})</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
             </div>
        </section>
    )
}


const ReportDisplay: React.FC<ReportDisplayProps> = ({ reportData, isLoading, error }) => {
    const { appData } = useData();
    const domainsData = appData?.domainsData || {};

    const { regionalProfile, nationalProfile } = React.useMemo(() => {
        const regionData = reportData?.regionData;
        if (!regionData) return { regionalProfile: [], nationalProfile: [] };
        const regional = Object.entries(regionData.domains).map(([key, value]) => ({ axis: key as Domain, value: (value as DomainMetrics).riskScore }));
        const national = Object.entries(domainsData).map(([key, value]) => ({ axis: key as Domain, value: (value as DomainData).averageRisk }));
        return { regionalProfile: regional, nationalProfile: national };
    }, [reportData?.regionData, domainsData]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-800">Menyusun Laporan...</h3>
                <p className="text-sm text-slate-500">Mengumpulkan data dan analisis untuk Anda.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700">Gagal Membuat Laporan</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
        );
    }
    
    if (!reportData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <DocumentChartBarIcon className="w-20 h-20 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">Selamat Datang di Pusat Laporan</h3>
                <p className="mt-1 max-w-md">Gunakan panel di sebelah kiri untuk membuat laporan analisis yang terperinci.</p>
            </div>
        );
    }

    const { params, title, generatedAt, regionData, monthlySummary, domainComparisonData, aiSummary } = reportData;

    return (
        <div id="report-content" className="prose-sm max-w-none">
            {/* Report Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-300">
                <div>
                    <p className="text-base font-semibold text-indigo-700">Laporan Analisis CERIA</p>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">{title}</h1>
                    <div className="flex items-center text-sm text-slate-500 mt-2">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>Dibuat pada: {generatedAt}</span>
                    </div>
                </div>
                <div className="print:hidden">
                    <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700">
                       <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                        Export ke PDF
                    </button>
                </div>
            </div>

            {/* Report Body */}
            <div className="mt-8 space-y-10">
                {/* AI Summary is always on top */}
                {aiSummary && (
                    <section>
                        <div className="not-prose">
                            <RegionalAnalysisInsight 
                                insight={aiSummary}
                                lastAnalyzed={null}
                                isLoading={false}
                                error={null}
                                onRegenerate={() => alert("Fungsi analisis belum diimplementasikan di sini.")}
                            />
                        </div>
                    </section>
                )}
                
                {params.type === 'regional-deep-dive' && regionData && (
                    <>
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Ringkasan Wilayah</h2>
                            <div className="not-prose">
                                <RegionSummary data={regionData} />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Profil Risiko vs. Nasional</h2>
                            <div className="p-4 bg-slate-50 rounded-lg not-prose">
                                <RegionalProfileRadarChart 
                                    regionName={regionData.name}
                                    regionalProfile={regionalProfile}
                                    nationalProfile={nationalProfile}
                                />
                            </div>
                        </section>
                        
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Rincian per Bidang Layanan</h2>
                             <div className="not-prose">
                                <DomainBreakdown domains={regionData.domains} />
                             </div>
                        </section>
                    </>
                )}

                {params.type === 'monthly-performance' && monthlySummary && (
                    <div className="not-prose">
                        <MonthlyPerformanceContent data={monthlySummary} />
                    </div>
                )}

                {params.type === 'domain-comparison' && domainComparisonData && (
                    <div className="not-prose">
                        <DomainComparisonContent data={domainComparisonData} />
                    </div>
                )}

                {/* Footer can be added here */}
                 <div className="pt-8 mt-10 text-center text-xs text-slate-400 border-t">
                    <p>Laporan ini dibuat secara otomatis oleh CERIA (Cerdas, Efektif, Responsif, Inovatif, Akurat)</p>
                    <p>Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan</p>
                </div>
            </div>
        </div>
    );
};

export default ReportDisplay;
