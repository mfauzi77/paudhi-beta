
import React from 'react';
import { datasetAdapterService } from '../../services/DatasetAdapterService';
import { ApiIntegration,Dataset } from '../../types';
import { useData } from '../../context/DataContext';
import {
ArrowDownTrayIcon,
ArrowLeftIcon,
ArrowPathIcon,
CalendarIcon,
InformationCircleIcon,
MapPinIcon,
PencilSquareIcon,
TableCellsIcon,
XCircleIcon
} from '../icons/Icons';

interface DatasetRegistryProps {
    api: ApiIntegration;
    onBack: () => void;
    onPreview: (dataset: Dataset) => void;
}

const mockDatasets: Dataset[] = [
    {
        id: 'ds-1',
        apiId: '1',
        name: 'Prevalensi Stunting Balita',
        description: 'Persentase balita dengan tinggi badan menurut umur di bawah -2 standar deviasi.',
        indicator: 'Stunting',
        coverage: 'Provinsi & Kabupaten/Kota',
        year: '2024',
        syncStatus: 'Success',
        dataPath: 'data',
        mapping: { wilayah: 'label', nilai: 'value' },
        defaultValues: { tahun: 2024, indikator: 'Stunting' }
    },
    {
        id: 'ds-2',
        apiId: '1',
        name: 'Cakupan Imunisasi Dasar Lengkap',
        description: 'Persentase anak usia 12-23 bulan yang mendapatkan imunisasi sesuai standar.',
        indicator: 'Imunisasi IDL',
        coverage: 'Provinsi',
        year: '2024',
        syncStatus: 'Success'
    },
    {
        id: 'ds-3',
        apiId: '1',
        name: 'Angka Partisipasi Kasar PAUD',
        description: 'Rasio jumlah anak yang bersekolah di jenjang PAUD terhadap total anak usia 3-6 tahun.',
        indicator: 'APK PAUD',
        coverage: 'Provinsi & Kabupaten/Kota',
        year: '2023',
        syncStatus: 'Failed'
    }
];

const DatasetRegistry: React.FC<DatasetRegistryProps> = ({ api, onBack, onPreview }) => {
    const { year, appData } = useData();
    const datasets: Dataset[] = year === 2025 ? (appData?.analysisDatasets || []).map(({ entry, data }) => ({ id: entry.id, apiId: api.id, name: data.title, description: entry.notes, indicator: entry.requirement, coverage: '38 provinsi', year: '2025', syncStatus: 'Pending', localUrl: entry.datasetUrl, fieldPaths: entry.fieldPaths })) : mockDatasets;
    const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
    const [editingDataset, setEditingDataset] = React.useState<Dataset | null>(null);

    const handleOpenConfig = (dataset: Dataset) => {
        setEditingDataset({ ...dataset });
        setIsConfigModalOpen(true);
    };

    const handleSaveConfig = () => {
        // In real app, save to backend
        alert('Konfigurasi mapping berhasil disimpan!');
        setIsConfigModalOpen(false);
    };

    const handleTestFetch = async (dataset: Dataset) => {
        const result = await datasetAdapterService.fetchAndNormalize(dataset, api.endpoint);
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            onPreview(dataset); // Navigate to preview with fetched data
        }
    };

    return (
        <div className="animate-fadeIn p-6 min-h-screen bg-slate-50 text-slate-600">
            {/* Header / Navigation */}
            <div className="flex items-center space-x-4 mb-8">
                <button 
                    onClick={onBack}
                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dataset Registry</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Sumber: <span className="text-indigo-600 font-bold">{api.name}</span>
                    </p>
                </div>
            </div>

            {/* Registry Info Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 mb-8 text-white flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                    <h2 className="text-2xl font-bold mb-2">Kelola Dataset API</h2>
                    <p className="text-indigo-100/80 text-sm max-w-md">
                        Lihat rinician dataset yang tersedia dari {api.name}. Lakukan sinkronisasi, preview data, atau download ke format CSV.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-sm font-bold transition-all active:scale-95">
                        Sync Semua Dataset
                    </button>
                    <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-800/10 transition-all active:scale-95">
                        Export List Registry
                    </button>
                </div>
            </div>

            {/* Dataset Table */}
            <div className="grid grid-cols-1 gap-6">
                {datasets.map((ds) => (
                    <div key={ds.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 group">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-bold text-slate-800">{ds.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    ds.syncStatus === 'Success' ? 'bg-emerald-100 text-emerald-700' : 
                                    ds.syncStatus === 'Failed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {ds.syncStatus}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4 max-w-2xl line-clamp-2">{ds.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
                                <span className="flex items-center px-3 py-1.5 bg-slate-50 rounded-xl">
                                    <InformationCircleIcon className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                                    Indikator: <span className="text-slate-700 ml-1">{ds.indicator}</span>
                                </span>
                                <span className="flex items-center px-3 py-1.5 bg-slate-50 rounded-xl">
                                    <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                    Cakupan: <span className="text-slate-700 ml-1">{ds.coverage}</span>
                                </span>
                                <span className="flex items-center px-3 py-1.5 bg-slate-50 rounded-xl">
                                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                                    Tahun: <span className="text-slate-700 ml-1">{ds.year}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 pl-0 md:pl-8">
                            <button 
                                onClick={() => onPreview(ds)}
                                className="flex items-center px-5 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-2xl font-bold text-xs transition-all active:scale-95 group/btn"
                            >
                                <TableCellsIcon className="w-4 h-4 mr-2" />
                                Preview
                            </button>
                             <button 
                                onClick={() => handleTestFetch(ds)}
                                className="flex items-center px-4 py-3 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-2xl font-bold text-xs transition-all active:scale-95 group/btn"
                                title="Test Fetch & Preview"
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                Test Fetch
                            </button>
                            <button 
                                onClick={() => handleOpenConfig(ds)}
                                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-200 transition-all active:scale-95 focus:ring-2 focus:ring-indigo-500"
                                title="Configure Mapping"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl border border-slate-200 transition-all active:scale-95" title="Download CSV">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Configuration Modal */}
            {isConfigModalOpen && editingDataset && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 relative">
                        <button 
                            onClick={() => setIsConfigModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Konfigurasi Dataset</h2>
                        <p className="text-slate-500 mb-6">
                            Sesuaikan mapping data dan path untuk dataset: <span className="font-semibold text-indigo-600">{editingDataset.name}</span>
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="dataPath" className="block text-sm font-medium text-slate-700 mb-1">Data Path (JSON Pointer)</label>
                                <input
                                    type="text"
                                    id="dataPath"
                                    value={editingDataset.dataPath || ''}
                                    onChange={(e) => setEditingDataset({ ...editingDataset, dataPath: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="e.g., data.results"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Tentukan jalur dalam respons API untuk menemukan array data utama.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-slate-700 mb-2">Mapping Kolom</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Field Wilayah</label>
                                            <input
                                                type="text"
                                                value={editingDataset.mapping?.wilayah || ''}
                                                onChange={(e) => setEditingDataset({ 
                                                    ...editingDataset, 
                                                    mapping: { ...(editingDataset.mapping || { wilayah: '', nilai: '' }), wilayah: e.target.value } 
                                                })}
                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                                placeholder="e.g., label"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Field Nilai</label>
                                            <input
                                                type="text"
                                                value={editingDataset.mapping?.nilai || ''}
                                                onChange={(e) => setEditingDataset({ 
                                                    ...editingDataset, 
                                                    mapping: { ...(editingDataset.mapping || { wilayah: '', nilai: '' }), nilai: e.target.value } 
                                                })}
                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                                placeholder="e.g., value"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Field Tahun (Optional)</label>
                                            <input
                                                type="text"
                                                value={editingDataset.mapping?.tahun || ''}
                                                onChange={(e) => setEditingDataset({ 
                                                    ...editingDataset, 
                                                    mapping: { ...(editingDataset.mapping || { wilayah: '', nilai: '' }), tahun: e.target.value } 
                                                })}
                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                                placeholder="e.g., year_id"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Field Indikator (Optional)</label>
                                            <input
                                                type="text"
                                                value={editingDataset.mapping?.indikator || ''}
                                                onChange={(e) => setEditingDataset({ 
                                                    ...editingDataset, 
                                                    mapping: { ...(editingDataset.mapping || { wilayah: '', nilai: '' }), indikator: e.target.value } 
                                                })}
                                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                                placeholder="e.g., variable_name"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-slate-700 mb-2">Default Values (Fallbacks)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Default Tahun</label>
                                        <input
                                            type="text"
                                            value={editingDataset.defaultValues?.tahun || ''}
                                            onChange={(e) => setEditingDataset({ 
                                                ...editingDataset, 
                                                defaultValues: { ...(editingDataset.defaultValues || {}), tahun: e.target.value }
                                            })}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Default Indikator</label>
                                        <input
                                            type="text"
                                            value={editingDataset.defaultValues?.indikator || ''}
                                            onChange={(e) => setEditingDataset({ 
                                                ...editingDataset, 
                                                defaultValues: { ...(editingDataset.defaultValues || {}), indikator: e.target.value }
                                            })}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button 
                                onClick={() => setIsConfigModalOpen(false)}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all active:scale-95"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSaveConfig}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                Simpan Konfigurasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatasetRegistry;
