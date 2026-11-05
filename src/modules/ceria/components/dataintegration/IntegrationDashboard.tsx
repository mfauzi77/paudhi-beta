
import React, { useState } from 'react';
import { 
    ApiIntegration, 
    Dataset
} from '../../types';
import {
    ArrowPathIcon,
    PlusIcon,
    SignalIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ListBulletIcon,
    PencilSquareIcon,
    TableCellsIcon,
    MagnifyingGlassIcon,
    CommandLineIcon
} from '../icons/Icons';
import IntegrationForm from './IntegrationForm';
import DatasetRegistry from './DatasetRegistry';
import DatasetPreview from './DatasetPreview';
import PipelineMonitoring from './PipelineMonitoring';
import { useData } from '../../context/DataContext';

const mockApis: ApiIntegration[] = [
    {
        id: '1',
        name: 'Badan Pusat Statistik (BPS)',
        category: 'Statistik Nasional',
        endpoint: 'https://api.bps.go.id/v1/indicators',
        status: 'Aktif',
        lastSync: '10 Mar 2026 02:00',
        datasetCount: 12,
        authMethod: 'API Key',
        apiKey: '***',
        syncFrequency: 'Harian'
    },
    {
        id: '2',
        name: 'Kemenkes SatuSehat',
        category: 'Kesehatan',
        endpoint: 'https://api-satusehat.kemkes.go.id/v1',
        status: 'Belum diuji',
        lastSync: '-',
        datasetCount: 8,
        authMethod: 'Bearer Token',
        syncFrequency: 'Harian'
    },
    {
        id: '3',
        name: 'Dapodik Kemendikbud',
        category: 'Pendidikan',
        endpoint: 'https://dapodik.kemdikbud.go.id/api',
        status: 'Error koneksi',
        lastSync: '08 Mar 2026 14:20',
        datasetCount: 5,
        authMethod: 'OAuth',
        syncFrequency: 'Mingguan'
    }
];

const IntegrationDashboard: React.FC = () => {
    const { year, appData } = useData();
    const [apis, setApis] = useState<ApiIntegration[]>(year === 2025 ? [{ id: 'local-2025', name: 'Dataset CERIA 2025 (tabel pengguna)', category: 'Statistik Nasional', endpoint: '/data/2025/mapping.json', status: 'Belum diuji', lastSync: 'Sumber belum diverifikasi', datasetCount: appData?.analysisDatasets?.length || 0, authMethod: 'API Key', syncFrequency: 'Manual' }] : mockApis);
    const [activeView, setActiveView] = useState<'dashboard' | 'registry' | 'preview' | 'logs'>('dashboard');
    const [selectedApi, setSelectedApi] = useState<ApiIntegration | null>(null);
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingApi, setEditingApi] = useState<ApiIntegration | undefined>(undefined);

    const stats = {
        total: apis.length,
        active: apis.filter(a => a.status === 'Aktif').length,
        error: apis.filter(a => a.status === 'Error koneksi').length,
        syncedToday: year === 2025 ? 0 : 4
    };

    const handleBackToDashboard = () => {
        setActiveView('dashboard');
        setSelectedApi(null);
        setSelectedDataset(null);
    };

    if (activeView === 'registry' && selectedApi) {
        return (
            <DatasetRegistry 
                api={selectedApi} 
                onBack={handleBackToDashboard} 
                onPreview={(dataset: Dataset) => {
                    setSelectedDataset(dataset);
                    setActiveView('preview');
                }}
            />
        );
    }

    if (activeView === 'preview' && selectedDataset && selectedApi) {
        return (
            <DatasetPreview 
                api={selectedApi}
                dataset={selectedDataset} 
                onBack={() => setActiveView('registry')} 
            />
        );
    }

    return (
        <div className="animate-fadeIn p-6 min-h-screen bg-slate-50 text-slate-600">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Integrasi Data & API Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Pusat pengaturan integrasi data lintas sektoral CERIA.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingApi(undefined);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Tambah Integrasi
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total API Terdaftar', value: stats.total, icon: <ListBulletIcon />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'API Aktif', value: stats.active, icon: <CheckCircleIcon />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'API Error', value: stats.error, icon: <ExclamationTriangleIcon />, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Dataset Tersinkronisasi', value: stats.syncedToday, icon: <ArrowPathIcon />, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mr-4`}>
                            {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pipeline Monitoring Snippet */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <h2 className="text-sm font-bold text-slate-800 flex items-center">
                        <SignalIcon className="w-4 h-4 mr-2 text-indigo-500" />
                        Data Pipeline Monitoring
                    </h2>
                    <button 
                        onClick={() => setActiveView('logs')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                        Lihat Semua Log
                    </button>
                </div>
                {activeView === 'logs' ? (
                    <PipelineMonitoring apis={apis} />
                ) : (
                    <div className="p-4 space-y-2">
                        <div className="flex items-center text-[11px] font-mono text-slate-500">
                            <span className="w-32">11 Mar 2026 09:00</span>
                            <span className="mx-2 text-emerald-500 font-bold">[SUCCESS]</span>
                            <span>BPS data points normalization completed.</span>
                        </div>
                        <div className="flex items-center text-[11px] font-mono text-slate-500">
                            <span className="w-32">11 Mar 2026 08:45</span>
                            <span className="mx-2 text-indigo-500 font-bold">[INFO]</span>
                            <span>Fetching data from SatuSehat Kemenkes...</span>
                        </div>
                        <div className="flex items-center text-[11px] font-mono text-slate-500">
                            <span className="w-32">10 Mar 2026 23:30</span>
                            <span className="mx-2 text-rose-500 font-bold">[FAILED]</span>
                            <span>Connection timeout to Dapodik production endpoint.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* API Table */}
            {activeView === 'dashboard' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Sumber Data</th>
                                <th className="px-6 py-4">Endpoint API</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Sync</th>
                                <th className="px-6 py-4">Dataset</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {apis.map((api) => (
                                <tr key={api.id} className="hover:bg-slate-50/50 transition-colors group text-sm">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{api.name}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{api.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-indigo-600 font-mono">
                                            {api.endpoint.replace(/^https?:\/\//, '')}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                api.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                                api.status === 'Belum diuji' ? 'bg-amber-400' : 'bg-rose-500'
                                            }`}></div>
                                            <span className={`text-xs font-semibold ${
                                                api.status === 'Aktif' ? 'text-emerald-700' : 
                                                api.status === 'Belum diuji' ? 'text-amber-700' : 'text-rose-700'
                                            }`}>{api.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                        {api.lastSync}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-bold">
                                            {api.datasetCount} Items
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Test Connection"
                                            >
                                                <CommandLineIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                title="Sync Data"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingApi(api);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="Edit API"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedApi(api);
                                                    setActiveView('registry');
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Lihat Dataset"
                                            >
                                                <TableCellsIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Lihat Log"
                                            >
                                                <MagnifyingGlassIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isFormOpen && (
                <IntegrationForm 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    initialData={editingApi}
                    onSave={(data: any) => {
                        if (editingApi) {
                            setApis(apis.map(a => a.id === editingApi.id ? { ...a, ...data } : a));
                        } else {
                            setApis([...apis, { ...data, id: String(Date.now()), status: 'Belum diuji', lastSync: '-', datasetCount: 0 }]);
                        }
                        setIsFormOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default IntegrationDashboard;
