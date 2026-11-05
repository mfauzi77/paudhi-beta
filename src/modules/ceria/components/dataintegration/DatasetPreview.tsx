
import React, { useState } from 'react';
import { Dataset } from '../../types';
import { 
    ArrowLeftIcon, 
    FunnelIcon,
    BarsArrowDownIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    CodeBracketIcon,
    TableCellsIcon,
    CircleStackIcon,
    XCircleIcon, // Added XCircleIcon as it's used for error display
    ArrowPathIcon // Added ArrowPathIcon as it's used for loading spinner
} from '../icons/Icons';
import { datasetAdapterService, StandardCeriaData } from '../../services/DatasetAdapterService';
import { ApiIntegration } from '../../types';

interface DatasetPreviewProps {
    dataset: Dataset;
    onBack: () => void;
}


const DatasetPreview: React.FC<DatasetPreviewProps & { api: ApiIntegration }> = ({ dataset, onBack, api }) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'raw' | 'normalized'>('normalized');
    const [normalizedData, setNormalizedData] = useState<StandardCeriaData[]>([]);
    const [rawData, setRawData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const result = await datasetAdapterService.fetchAndNormalize(dataset, api.endpoint);
            setRawData(result.raw);
            setNormalizedData(result.normalized);
            setError(result.error || null);
            setIsLoading(false);
        };
        loadData();
    }, [dataset, api.endpoint]);

    const handleSync = () => {
        alert('Syncing to Database...');
    };

    const handleExport = () => {
        alert('Exporting to CSV...');
    };

    const filteredData = normalizedData.filter(item => 
        item.wilayah.toLowerCase().includes(search.toLowerCase()) ||
        String(item.tahun).includes(search)
    );

    return (
        <div className="animate-fadeIn p-6 min-h-screen bg-slate-50 text-slate-600 flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={onBack}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dataset Preview</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Dataset: <span className="text-indigo-600 font-bold">{dataset.name}</span>
                        </p>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{dataset.name}</h1>
                        <p className="text-slate-500 font-medium">Previewing data from <span className="text-indigo-600 font-bold">{api.name}</span></p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mr-4 text-xs font-bold">
                        <button
                            onClick={() => setActiveTab('normalized')}
                            className={`flex items-center px-4 py-2 rounded-xl transition-all ${activeTab === 'normalized' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <TableCellsIcon className="w-3.5 h-3.5 mr-2" />
                            Normalized
                        </button>
                        <button
                            onClick={() => setActiveTab('raw')}
                            className={`flex items-center px-4 py-2 rounded-xl transition-all ${activeTab === 'raw' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <CodeBracketIcon className="w-3.5 h-3.5 mr-2" />
                            Raw JSON
                        </button>
                    </div>

                    <button
                        onClick={handleSync}
                        className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-95 border-none"
                    >
                        <CircleStackIcon className="w-4 h-4 mr-2" />
                        Sync to Database
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2 text-emerald-500" />
                        Export
                    </button>
                </div>
            </div>

            {/* Toolbar Area */}
            {activeTab === 'normalized' && (
                <div className="flex items-center space-x-3 mb-6 animate-slideIn">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari wilayah atau tahun..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all w-80 font-medium text-slate-700 shadow-sm"
                        />
                    </div>
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                        <FunnelIcon className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
                        <BarsArrowDownIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Table Area */}
            <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
                {error && (
                    <div className="bg-rose-50 border-b border-rose-100 px-8 py-4 flex items-center text-rose-700 text-sm font-bold animate-fadeIn">
                        <XCircleIcon className="w-5 h-5 mr-3" />
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
                        <ArrowPathIcon className="w-12 h-12 mb-6 animate-spin text-indigo-400" />
                        <p className="font-bold text-lg">Fetching & Normalizing Data...</p>
                        <p className="text-sm mt-2 opacity-60">Sedang menghubungi endpoint API dan menerapkan mapping...</p>
                    </div>
                ) : activeTab === 'raw' ? (
                    <div className="flex-1 overflow-auto p-10 bg-slate-900 font-mono text-sm text-emerald-400 leading-relaxed custom-scrollbar">
                        <pre>{JSON.stringify(rawData, null, 2)}</pre>
                    </div>
                ) : (
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wilayah</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tahun</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Indikator</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.map((row, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/40 transition-colors group">
                                        <td className="px-8 py-6 font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{row.wilayah}</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] font-black">
                                                {row.tahun}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium italic">{row.indikator}</td>
                                        <td className="px-8 py-6 text-right font-black text-xl text-slate-800 tracking-tighter">
                                            {row.nilai}
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                                    <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-400 font-bold">Data tidak ditemukan atau mapping salah.</p>
                                                <p className="text-xs text-slate-300 mt-1 max-w-xs">Pastikan Konfigurasi Mapping pada Dataset Registry sudah benar.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer / Pagination Placeholder */}
                <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                            Dataset Adapter Active • <span className="text-slate-600 ml-1">v1.2 Standardizer</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-bold text-slate-400">
                        <span className="mr-4">Showing {filteredData.length} records</span>
                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">Previous</button>
                        <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">1</button>
                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatasetPreview;
