import React from 'react';
import { KabupatenKotaDetailData,RegionDetailData } from '../../types';
import { BellAlertIcon,ChartBarIcon,UsersIcon } from '../icons/Icons';
import { useData } from '../../context/DataContext';

interface RegionSummaryProps {
    data: RegionDetailData | KabupatenKotaDetailData;
    alertsCount?: number;
}


const RegionSummary: React.FC<RegionSummaryProps> = ({ data, alertsCount }) => {
    const { appData } = useData();
    const values = Object.values(appData?.regionsDetails || {});
    const nationalAverageRisk = values.length ? Number((values.reduce((s,r) => s+r.overallRisk,0)/values.length).toFixed(1)) : 0;
    const riskDifference = data.overallRisk - nationalAverageRisk;
    
    const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, footer?: React.ReactNode }> = ({ icon, title, value, footer }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
            <div className="flex items-center mb-2">
                {icon}
                <p className="ml-3 text-sm font-semibold text-slate-600 uppercase">{title}</p>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
            {footer && <div className="mt-auto pt-2 text-xs text-slate-500">{footer}</div>}
        </div>
    );
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-1">
                 <h3 className="text-lg font-bold">Wilayah Terpilih</h3>
                 <p className="text-3xl font-bold mt-2">{data.name}</p>
                 <p className="text-sm opacity-80 mt-1">ID: {data.id}</p>
            </div>
            <StatCard 
                icon={<ChartBarIcon className="w-8 h-8 text-indigo-500" />}
                title="Skor Risiko"
                value={data.overallRisk.toString()}
                footer={
                    <div className={`flex items-center font-bold ${riskDifference > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {riskDifference.toFixed(1)} vs. Rata-rata Nasional ({nationalAverageRisk})
                    </div>
                }
            />
            <StatCard 
                icon={<UsersIcon className="w-8 h-8 text-indigo-500" />}
                title={'populationAgeGroup' in data && data.populationAgeGroup ? `Penduduk Usia ${data.populationAgeGroup}` : 'Populasi Anak Usia Dini'}
                value={'populationUnavailable' in data && data.populationUnavailable ? 'Belum tersedia' : data.population.toLocaleString('id-ID')}
                footer={'populationDetails' in data && data.populationDetails ? <div><p>Usia 0–6: {data.populationDetails.proportionAge0To6.toLocaleString('id-ID')}% dari total penduduk.</p><p>Usia 5–6: {data.populationDetails.countAge5To6.toLocaleString('id-ID')} jiwa.</p></div> : <p>Estimasi populasi anak usia dini di wilayah.</p>}
            />
            <StatCard 
                icon={<BellAlertIcon className="w-8 h-8 text-indigo-500" />}
                title="Alert Aktif"
                value={(alertsCount ?? data.activeAlertsCount).toString()}
                footer={<p>Jumlah alert aktif di wilayah &amp; sub-wilayahnya.</p>}
            />
        </div>
    );
};

export default RegionSummary;
