
import React, { useState, useMemo } from 'react';
import { RegionalForecastData, SortKey, SortDirection } from '../../types';
import { TrendingUpIcon, TrendingDownIcon, ChevronUpIcon, ChevronDownIcon, SwitchVerticalIcon, DocumentPlusIcon } from '../icons/Icons';

interface RegionalRiskTableProps {
    data: RegionalForecastData[];
    onCreatePlan: (forecast: RegionalForecastData) => void;
}

const RegionalRiskTable: React.FC<RegionalRiskTableProps> = ({ data, onCreatePlan }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'change', direction: 'descending' });

    const sortedData = useMemo(() => {
        let sortableData = [...data];
        if (sortConfig !== null) {
            sortableData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <SwitchVerticalIcon className="w-4 h-4 text-slate-400" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className="w-4 h-4 text-indigo-500" />;
        }
        return <ChevronDownIcon className="w-4 h-4 text-indigo-500" />;
    };

    const getRiskLevelStyles = (level: RegionalForecastData['currentRiskLevel']) => {
        switch (level) {
            case 'Kritis': return 'bg-red-100 text-red-800';
            case 'Tinggi': return 'bg-orange-100 text-orange-800';
            case 'Sedang': return 'bg-yellow-100 text-yellow-800';
            case 'Rendah': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    const ThSortable: React.FC<{ sortKey: SortKey, children: React.ReactNode, className?: string }> = ({ sortKey, children, className }) => (
        <th scope="col" className={`px-2 sm:px-6 py-3 ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 group">
                <span>{children}</span>
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">{getSortIcon(sortKey)}</span>
            </button>
        </th>
    );

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Prediksi Risiko Detail per Wilayah</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <ThSortable sortKey="region" className="rounded-l-lg">Wilayah</ThSortable>
                            <ThSortable sortKey="domain">Domain</ThSortable>
                            <ThSortable sortKey="currentRisk" className="text-center">Risiko Saat Ini</ThSortable>
                            <th scope="col" className="px-2 sm:px-6 py-3 text-center">Level Risiko (Saat Ini)</th>
                            <ThSortable sortKey="predictedRisk" className="text-center">Prediksi Risiko</ThSortable>
                             <th scope="col" className="px-2 sm:px-6 py-3 text-center">Level Risiko (Prediksi)</th>
                            <ThSortable sortKey="change" className="text-center">Perubahan</ThSortable>
                            <th scope="col" className="px-2 sm:px-6 py-3 rounded-r-lg text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item) => (
                            <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="px-2 sm:px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{item.region}</th>
                                <td className="px-2 sm:px-6 py-4">{item.domain}</td>
                                <td className="px-2 sm:px-6 py-4 text-center font-semibold text-slate-600">{item.currentRisk}</td>
                                <td className="px-2 sm:px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getRiskLevelStyles(item.currentRiskLevel)}`}>{item.currentRiskLevel}</span></td>
                                <td className="px-2 sm:px-6 py-4 text-center font-bold text-indigo-700">{item.predictedRisk}</td>
                                <td className="px-2 sm:px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getRiskLevelStyles(item.predictedRiskLevel)}`}>{item.predictedRiskLevel}</span></td>
                                <td className="px-2 sm:px-6 py-4">
                                    <div className={`flex items-center justify-center font-bold ${item.change >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {item.change >= 0 ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                                        <span>{item.change > 0 ? `+${item.change}` : item.change}</span>
                                    </div>
                                </td>
                                <td className="px-2 sm:px-6 py-4 text-center">
                                    <button 
                                        onClick={() => onCreatePlan(item)}
                                        className="text-indigo-600 hover:text-indigo-800 font-semibold" 
                                        title="Buat Rencana Intervensi Proaktif"
                                    >
                                        <DocumentPlusIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegionalRiskTable;