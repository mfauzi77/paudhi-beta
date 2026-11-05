import React from 'react';
import { KabupatenKotaDetailData } from '../../types';
import { MapPinIcon, BellAlertIcon, UsersIcon, ArrowRightIcon } from '../icons/Icons';

const RiskBar: React.FC<{ score: number }> = ({ score }) => {
    const getRiskColor = (s: number) => {
        if (s > 85) return 'bg-red-700';
        if (s > 70) return 'bg-red-500';
        if (s > 55) return 'bg-orange-500';
        if (s > 40) return 'bg-yellow-400';
        return 'bg-emerald-500';
    };

    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
                className={`h-2.5 rounded-full ${getRiskColor(score)}`}
                style={{ width: `${score}%` }}
                title={`Skor Risiko: ${score}`}
            ></div>
        </div>
    );
};


const KabupatenKotaCard: React.FC<{ data: KabupatenKotaDetailData, onSelect: (id: string) => void }> = ({ data, onSelect }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col hover:shadow-md hover:border-indigo-300 transition-all duration-200">
            <div className="flex-grow">
                <h4 className="font-bold text-slate-800">{data.name}</h4>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between items-center">
                        <span>Skor Risiko</span>
                        <span className="font-bold text-indigo-600">{data.overallRisk}</span>
                    </div>
                    <RiskBar score={data.overallRisk} />
                    <div className="flex items-center pt-2">
                        <UsersIcon className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Populasi: {data.population.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center">
                        <BellAlertIcon className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Alert Aktif: {data.activeAlertsCount}</span>
                    </div>
                </div>
            </div>
             <button onClick={() => onSelect(data.id)} className="mt-4 w-full text-center px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors flex items-center justify-center">
                Lihat Detail <ArrowRightIcon className="w-3 h-3 ml-1" />
             </button>
        </div>
    );
};


const KabupatenKotaList: React.FC<{ data: KabupatenKotaDetailData[], onSelectKabupatenKota: (id: string) => void }> = ({ data, onSelectKabupatenKota }) => {
    
    const sortedData = [...data].sort((a,b) => b.overallRisk - a.overallRisk);

    return (
        <div className="bg-slate-50 p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
                 <MapPinIcon className="w-6 h-6 mr-3 text-indigo-500"/>
                 <h3 className="text-lg font-bold text-slate-800">Rincian Risiko per Kabupaten/Kota</h3>
            </div>
           
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedData.map(item => (
                    <KabupatenKotaCard key={item.id} data={item} onSelect={onSelectKabupatenKota} />
                ))}
            </div>
        </div>
    );
};

export default KabupatenKotaList;
