import React from 'react';
import { RegionalRiskScore } from '../../types';
import { ChartBarIcon } from '../icons/Icons';

interface NationalRiskOverviewProps {
  data: RegionalRiskScore[];
}

const NationalRiskOverview: React.FC<NationalRiskOverviewProps> = ({ data }) => {

    const getRiskColor = (score: number) => {
        if (score > 85) return 'bg-red-700';
        if (score > 70) return 'bg-red-500';
        if (score > 55) return 'bg-orange-500';
        if (score > 40) return 'bg-yellow-400';
        return 'bg-emerald-500';
    };

    const sortedData = [...data].sort((a, b) => b.score - a.score).slice(0, 10);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2" />
                Top 10 High-Risk Provinces
            </h3>
             <p className="text-sm text-slate-500 mb-4">Peringkat provinsi berdasarkan skor risiko tertinggi.</p>
            
            <div className="flex-grow space-y-3 pr-2 -mr-2 overflow-y-auto">
                {sortedData.map((region) => {
                    const barColor = getRiskColor(region.score);
                    return (
                        <div key={region.name} className="flex items-center group" title={`${region.name} - Skor Risiko: ${region.score}`}>
                            <div className="w-2/5 sm:w-1/3 text-sm font-medium text-slate-600 truncate pr-2">
                                {region.name}
                            </div>
                            <div className="w-3/5 sm:w-2/3 flex items-center">
                                <div className="w-full bg-slate-200 rounded-full h-5 relative">
                                    <div 
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${barColor}`}
                                        style={{ width: `${region.score}%` }}
                                    >
                                    </div>
                                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-bold text-white mix-blend-difference">
                                        {region.score}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end flex-wrap gap-x-2 gap-y-1 mt-4 text-xs text-slate-600">
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-1"></span>Rendah</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 mr-1"></span>Sedang</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500 mr-1"></span>Tinggi</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 mr-1"></span>Kritis</div>
                <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-sm bg-red-700 mr-1"></span>Sangat Kritis</div>
            </div>
        </div>
    );
};

export default NationalRiskOverview;