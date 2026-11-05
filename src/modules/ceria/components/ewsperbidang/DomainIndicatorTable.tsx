
import React from 'react';
import { DomainIndicatorData } from '../../types';
import { TrophyIcon, ExclamationTriangleIcon } from '../icons/Icons';

interface DomainIndicatorTableProps {
    indicators: DomainIndicatorData[];
}

const DomainIndicatorTable: React.FC<DomainIndicatorTableProps> = ({ indicators }) => {
    if (!indicators || indicators.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-slate-500 text-center">Data indikator tidak tersedia untuk bidang ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Perbandingan Kinerja Indikator</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-2 sm:px-6 py-3 rounded-l-lg">Indikator</th>
                            <th scope="col" className="px-2 sm:px-6 py-3 text-center">Rata-rata Nasional</th>
                            <th scope="col" className="px-2 sm:px-6 py-3">Performa Terbaik</th>
                            <th scope="col" className="px-2 sm:px-6 py-3 rounded-r-lg">Performa Terendah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {indicators.map((indicator) => (
                            <tr key={indicator.indicatorName} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="px-2 sm:px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                    {indicator.indicatorName}
                                </th>
                                <td className="px-2 sm:px-6 py-4 text-center font-semibold text-slate-700">
                                    {indicator.nationalAverage}
                                </td>
                                <td className="px-2 sm:px-6 py-4">
                                    <div className="flex items-center">
                                        <TrophyIcon className="w-5 h-5 mr-2 text-amber-500 flex-shrink-0" />
                                        <div>
                                            <span className="font-bold text-emerald-600">{indicator.bestPerformer.value}</span>
                                            <span className="text-xs text-slate-500 ml-1">({indicator.bestPerformer.name})</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 sm:px-6 py-4">
                                     <div className="flex items-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" />
                                         <div>
                                            <span className="font-bold text-red-600">{indicator.worstPerformer.value}</span>
                                            <span className="text-xs text-slate-500 ml-1">({indicator.worstPerformer.name})</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DomainIndicatorTable;