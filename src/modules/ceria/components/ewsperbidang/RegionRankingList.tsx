import React, { useState, useMemo } from 'react';
import { RegionPerformance } from '../../types';
import { TrendingUpIcon, TrendingDownIcon, ChevronUpIcon, ChevronDownIcon } from '../icons/Icons';

interface RegionRankingListProps {
    regions: RegionPerformance[];
}

const RegionRankingList: React.FC<RegionRankingListProps> = ({ regions }) => {
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

    const sortedRegions = useMemo(() => {
        return [...regions].sort((a, b) => {
            if (sortDirection === 'desc') {
                return b.riskScore - a.riskScore;
            }
            return a.riskScore - b.riskScore;
        });
    }, [regions, sortDirection]);

    const toggleSort = () => {
        setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Peringkat Risiko Wilayah</h3>
                <button onClick={toggleSort} className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    <span>Urutkan</span>
                    {sortDirection === 'desc' ? <ChevronDownIcon className="w-4 h-4 ml-1" /> : <ChevronUpIcon className="w-4 h-4 ml-1" />}
                </button>
            </div>
            <ul className="space-y-2 h-96 lg:h-[26rem] overflow-y-auto pr-2">
                {sortedRegions.map((region, index) => (
                    <li key={region.id} className="p-3 bg-slate-50 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-sm font-bold text-slate-500 w-6">{index + 1}.</span>
                            <p className="text-sm font-semibold text-slate-800">{region.name}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className={`flex items-center text-xs font-bold ${region.trend >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {region.trend >= 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
                                <span className="ml-1">{Math.abs(region.trend)}</span>
                            </div>
                            <div className="text-base font-bold text-indigo-700 w-8 text-right">{region.riskScore}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RegionRankingList;
