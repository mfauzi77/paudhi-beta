import React from 'react';
import { DomainData } from '../../types';
import { ChartBarIcon, BellAlertIcon, GlobeAltIcon } from '../icons/Icons';

interface DomainSummaryProps {
    data: DomainData;
}

const DomainSummary: React.FC<DomainSummaryProps> = ({ data }) => {
    
    const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, description: string }> = ({ icon, title, value, description }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm">
             <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                </div>
                {icon}
            </div>
        </div>
    );
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                icon={<GlobeAltIcon className="w-10 h-10 text-blue-500" />}
                title="Rata-Rata Risiko Nasional"
                value={data.averageRisk.toFixed(1)}
                description={`Untuk bidang ${data.name}`}
            />
            <StatCard 
                icon={<BellAlertIcon className="w-10 h-10 text-red-500" />}
                title="Wilayah Kritis/Tinggi"
                value={data.criticalRegionsCount.toString()}
                description="Jumlah wilayah dengan risiko tinggi."
            />
             <StatCard 
                icon={<ChartBarIcon className="w-10 h-10 text-emerald-500" />}
                title="Wilayah Terpantau"
                value={data.regions.length.toString()}
                description="Total wilayah yang masuk dalam analisis."
            />
        </div>
    );
};

export default DomainSummary;
