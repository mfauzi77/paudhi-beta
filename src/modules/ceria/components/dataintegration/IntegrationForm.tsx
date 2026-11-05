
import React, { useState, useEffect } from 'react';
import { ApiIntegration } from '../../types';
import { 
    XCircleIcon, 
    CommandLineIcon, 
    ArrowPathIcon,
    ShieldCheckIcon,
    LinkIcon,
    Bars3CenterLeftIcon
} from '../icons/Icons';

interface IntegrationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: ApiIntegration;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Statistik Nasional',
        endpoint: '',
        authMethod: 'API Key',
        apiKey: '',
        syncFrequency: 'Manual',
        selectedDatasets: [] as string[]
    });

    const categories = ['Statistik Nasional', 'Kesehatan', 'Pendidikan', 'Kependudukan', 'Lingkungan'];
    const authMethods = ['API Key', 'Bearer Token', 'OAuth'];
    const frequencies = ['Manual', 'Harian', 'Mingguan'];
    const availableDatasets = ['Data Stunting', 'Capaian Imunisasi', 'Partisipasi PAUD', 'Akta Kelahiran', 'Indeks Kerawanan Bencana'];

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                endpoint: initialData.endpoint,
                authMethod: initialData.authMethod,
                apiKey: initialData.apiKey || '',
                syncFrequency: initialData.syncFrequency,
                selectedDatasets: [] // Reset for demo
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mr-4 shadow-lg shadow-indigo-200">
                            <PlusIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {initialData ? 'Edit Integrasi API' : 'Tambah Integrasi API'}
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Konfigurasi Endpoint & Autentikasi</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-300 hover:text-rose-500 transition-colors bg-slate-100 hover:bg-rose-50 p-2 rounded-xl"
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <Bars3CenterLeftIcon className="w-3 h-3 mr-1.5 text-indigo-500" />
                                Nama Sumber Data
                            </label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Contoh: BPS Nasional"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <LinkIcon className="w-3 h-3 mr-1.5 text-indigo-500" />
                                Kategori Sumber Data
                            </label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 focus:bg-white transition-all font-medium text-slate-700"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* API Details Section */}
                    <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <CommandLineIcon className="w-3 h-3 mr-1.5 text-indigo-500" />
                                Endpoint API
                            </label>
                            <input 
                                type="text"
                                value={formData.endpoint}
                                onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                                placeholder="https://api.sumberdata.id/v1"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <ShieldCheckIcon className="w-3 h-3 mr-1.5 text-indigo-500" />
                                    Metode Autentikasi
                                </label>
                                <select 
                                    value={formData.authMethod}
                                    onChange={(e) => setFormData({...formData, authMethod: e.target.value as any})}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium text-slate-700"
                                >
                                    {authMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    API Key / Token
                                </label>
                                <input 
                                    type="password"
                                    value={formData.apiKey}
                                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                    placeholder="••••••••••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sync Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <ArrowPathIcon className="w-3 h-3 mr-1.5 text-indigo-500" />
                                Frekuensi Sinkronisasi
                            </label>
                            <div className="flex p-1 bg-slate-100 rounded-2xl overflow-hidden">
                                {frequencies.map(f => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setFormData({...formData, syncFrequency: f as any})}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                            formData.syncFrequency === f 
                                            ? 'bg-white text-indigo-600 shadow-sm' 
                                            : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Dataset Pilihan
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableDatasets.map(ds => (
                                    <label key={ds} className="flex items-center group cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={formData.selectedDatasets.includes(ds)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({...formData, selectedDatasets: [...formData.selectedDatasets, ds]});
                                                } else {
                                                    setFormData({...formData, selectedDatasets: formData.selectedDatasets.filter(x => x !== ds)});
                                                }
                                            }}
                                        />
                                        <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                                            formData.selectedDatasets.includes(ds)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                                        }`}>
                                            {ds}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Operations */}
                <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <button 
                        type="button"
                        className="flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-2xl font-bold text-sm transition-all active:scale-95"
                    >
                        <CommandLineIcon className="w-4 h-4 mr-2" />
                        Test Connection
                    </button>
                    <div className="flex space-x-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="button"
                            onClick={() => onSave(formData)}
                            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-95"
                        >
                            Simpan Integrasi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon proxy for missing icons in parent
const PlusIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export default IntegrationForm;
