import React from 'react';
import { RegionalForecastData } from '../../types';
import { TrendingUpIcon, TrendingDownIcon } from '../icons/Icons';

interface TopMoversProps {
    data: RegionalForecastData[];
}

const TopMovers: React.FC<TopMoversProps> = ({ data }) => {
    const sortedByChange = [...data].sort((a, b) => b.change - a.change);
    const topIncreases = sortedByChange.filter(item => item.change > 0).slice(0, 3);
    const topDecreases = sortedByChange.filter(item => item.change < 0).slice(-3).reverse();

    const MoverItem: React.FC<{ item: RegionalForecastData }> = ({ item }) => (
        <li className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm font-semibold text-slate-800">{item.region}</p>
                <p className="text-xs text-slate-500">{item.domain}</p>
            </div>
            <div className={`flex items-center text-sm font-bold ${item.change >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                 {item.change >= 0 ? 
                    <TrendingUpIcon className="w-4 h-4 mr-1" /> :
                    <TrendingDownIcon className="w-4 h-4 mr-1" />
                }
                <span>{item.change > 0 ? `+${item.change}` : item.change}</span>
            </div>
        </li>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Movers</h3>
            <div>
                <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Top Risk Escalations</h4>
                <ul className="divide-y divide-slate-100">
                    {topIncreases.map(item => <MoverItem key={`inc-${item.id}`} item={item} />)}
                </ul>
            </div>
            <div className="mt-4">
                <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Top Improvements</h4>
                 <ul className="divide-y divide-slate-100">
                    {topDecreases.map(item => <MoverItem key={`dec-${item.id}`} item={item} />)}
                </ul>
            </div>
        </div>
    );
};

export default TopMovers;
