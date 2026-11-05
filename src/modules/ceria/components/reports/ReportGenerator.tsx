import React, { useState, useMemo } from 'react';
import { ReportParams, ReportType } from '../../types';
import { DocumentChartBarIcon, ArrowPathIcon } from '../icons/Icons';
import { useData } from '../../context/DataContext';

interface ReportGeneratorProps {
    onGenerate: (params: ReportParams) => void;
    isLoading: boolean;
}

const reportTypes: { id: ReportType, label: string }[] = [
    { id: 'regional-deep-dive', label: 'Analisis Mendalam Wilayah' },
    { id: 'monthly-performance', label: 'Laporan Kinerja Bulanan' },
    { id: 'domain-comparison', label: 'Perbandingan Antar Domain' },
];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerate, isLoading }) => {
    const { appData, year } = useData();
    const getAvailableRegions = appData?.getAvailableRegions || (() => []);
    
    const availableRegions = useMemo(() => getAvailableRegions(), [getAvailableRegions]);

    const [params, setParams] = useState<ReportParams>({
        type: 'regional-deep-dive',
        regionId: availableRegions[0]?.id || '',
        month: `${year}-01`,
        year,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(params.type === 'regional-deep-dive' && !params.regionId) {
            alert('Silakan pilih wilayah.');
            return;
        }
        onGenerate(params);
    };
    
    const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setParams(prev => {
            const newParams = { ...prev, [name]: value };
            if (name === 'type') {
                newParams.regionId = availableRegions[0]?.id || '';
                newParams.month = `${year}-01`;
                newParams.year = year;
            }
            return newParams;
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <DocumentChartBarIcon className="w-6 h-6 mr-2" />
                    Buat Laporan
                </h2>
                <p className="text-sm text-slate-500 mt-1">Pilih parameter untuk menghasilkan laporan khusus.</p>
            </div>
            
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700">Template Laporan</label>
                <select
                    id="type"
                    name="type"
                    value={params.type}
                    onChange={handleParamChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                >
                    {reportTypes.filter(rt => rt.id !== 'monthly-performance').map(rt => (
                        <option key={rt.id} value={rt.id}>
                            {rt.label}
                        </option>
                    ))}
                </select>
            </div>

            {params.type === 'regional-deep-dive' && (
                 <div>
                    <label htmlFor="regionId" className="block text-sm font-medium text-slate-700">Pilih Wilayah</label>
                    <select
                        id="regionId"
                        name="regionId"
                        value={params.regionId}
                        onChange={handleParamChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                    >
                        {availableRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            )}

            {params.type === 'monthly-performance' && (
                <div>
                    <label htmlFor="month" className="block text-sm font-medium text-slate-700">Pilih Bulan & Tahun</label>
                    <input
                        type="month"
                        min={`${year}-01`}
                        max={`${year}-12`}
                        id="month"
                        name="month"
                        value={params.month}
                        onChange={handleParamChange}
                        className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                    />
                </div>
            )}

            {params.type === 'domain-comparison' && (
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-slate-700">Pilih Tahun</label>
                    <input
                        type="number"
                        readOnly
                        id="year"
                        name="year"
                        value={params.year}
                        onChange={handleParamChange}
                        className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-slate-900"
                        min="2023"
                        max={new Date().getFullYear()}
                    />
                </div>
            )}
            
             <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                            <span>Membuat Laporan...</span>
                        </>
                    ) : (
                       <span>Hasilkan Laporan</span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ReportGenerator;
