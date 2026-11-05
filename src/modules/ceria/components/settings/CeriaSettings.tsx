import React, { useState, useEffect } from 'react';
import { 
    XCircleIcon,
    TableCellsIcon,
    ArrowPathIcon
} from '../icons/Icons';

interface IntegrationSetting {
    id: number;
    name: string;
    category: string;
    platform: string;
    variable_id: string;
    api_key: string;
    base_url: string; 
    frequency: string;
    last_status: string;
    updated_at: string;
}

const CeriaSettings: React.FC = () => {
    const [settings, setSettings] = useState<IntegrationSetting[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<IntegrationSetting | null>(null);
    const [viewingData, setViewingData] = useState<any[]>([]);

    // Default year for sync
    const DEFAULT_YEAR = '125'; // 2025

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage({ type: 'error', text: 'Anda harus login sebagai Admin untuk melihat dan mengubah API Key.' });
                setSettings([]);
                setIsLoading(false);
                return;
            }
            const res = await fetch('/api/ceria-settings/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setSettings(result.data);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal mengambil data. Pastikan Anda memiliki akses.' });
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setMessage({ type: 'error', text: 'Gagal terhubung ke server.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRow = async (row: IntegrationSetting) => {
        setProcessingId(row.id);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ceria-settings/settings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: row.id,
                    api_key: row.api_key,
                    base_url: row.base_url,
                    variable_id: row.variable_id,
                    name: row.name
                })
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: `Berhasil disimpan.` });
                await fetchSettings();
                return true;
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal.' });
                return false;
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error jaringan.' });
            return false;
        } finally {
            setProcessingId(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleSyncRow = async (row: IntegrationSetting) => {
        setProcessingId(row.id);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/ceria-settings/sync-bps', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: row.id, year_id: DEFAULT_YEAR })
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                fetchSettings();
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error sinkronisasi.' });
        } finally {
            setProcessingId(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleViewDataTable = async (row: IntegrationSetting) => {
        setProcessingId(row.id);
        setViewingData([]);
        setIsViewModalOpen(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/ceria-settings/bps-data?var_id=${row.variable_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setViewingData(result.data);
            } else {
                setMessage({ type: 'error', text: result.message || 'Gagal mengambil data.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Gagal mengambil data.' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleResetApiKey = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus konfigurasi DAN data untuk indikator ini?')) {
            return;
        }

        setProcessingId(id);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/ceria-settings/reset/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Data & Konfigurasi berhasil dihapus secara permanen.' });
                await fetchSettings(); 
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Gagal melakukan reset.' });
            console.error(err);
        } finally {
            setProcessingId(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const maskApiKey = (key: string) => {
        if (!key) return '-';
        return '•'.repeat(12);
    };

    const getStatusLabel = (status: string, key: string) => {
        if (status === 'Success') return { label: 'Aktif', color: 'bg-emerald-500' };
        if (key && key.length > 0) return { label: 'Belum diuji', color: 'bg-amber-500' };
        return { label: 'Tidak aktif', color: 'bg-rose-500' };
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const openEdit = (row: IntegrationSetting) => {
        setEditingRow({ ...row });
        setIsEditModalOpen(true);
    };

    const saveEdit = async () => {
        if (editingRow) {
            const success = await handleUpdateRow(editingRow);
            if (success) setIsEditModalOpen(false);
        }
    };

    return (
        <div className="animate-fadeIn p-6 min-h-screen bg-slate-50 text-slate-600">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan API Key</h1>
                    <p className="text-slate-500 text-sm mt-1">Konfigurasi integrasi data eksternal CERIA.</p>
                </div>
                {message && (
                    <div className={`px-4 py-2 rounded-lg shadow-sm border text-xs font-bold animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            <th className="px-6 py-4">Sumber Data</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">API Key</th>
                            <th className="px-6 py-4">Endpoint</th>
                            <th className="px-6 py-4">Last Sync</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse font-medium">
                                    Memuat konfigurasi...
                                </td>
                            </tr>
                        ) : settings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                    Tidak ada data integrasi ditemukan.
                                </td>
                            </tr>
                        ) : (
                            settings.map((row) => {
                                const status = getStatusLabel(row.last_status, row.api_key);
                                return (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-semibold text-sm">{row.platform || row.name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{row.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                                                <span className="text-xs font-medium text-slate-600">{status.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span className="font-mono text-xs text-slate-400 tracking-widest">{maskApiKey(row.api_key)}</span>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span className="text-xs text-slate-500 truncate max-w-[200px] inline-block font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title={row.base_url}>
                                                {row.base_url?.replace(/^https?:\/\//, '') || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <span className="text-xs text-slate-500">{formatDate(row.updated_at)}</span>
                                        </td>
                                        <td className="px-6 py-4 align-middle">
                                            <div className="flex items-center justify-center space-x-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleViewDataTable(row)}
                                                    disabled={processingId === row.id}
                                                    className="text-slate-400 hover:text-indigo-600 text-xs font-bold transition-colors flex items-center"
                                                    title="Lihat Data"
                                                >
                                                    <TableCellsIcon className="w-3.5 h-3.5 mr-1" />
                                                    Lihat
                                                </button>
                                                <span className="text-slate-200">•</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSyncRow(row)}
                                                    disabled={processingId === row.id}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors disabled:opacity-30 flex items-center"
                                                >
                                                    <ArrowPathIcon className={`w-3.5 h-3.5 mr-1 ${processingId === row.id ? 'animate-spin' : ''}`} />
                                                    Sync
                                                </button>
                                                <span className="text-slate-200">•</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => openEdit(row)}
                                                    className="text-slate-600 hover:text-amber-600 text-xs font-bold transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <span className="text-slate-200">•</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleResetApiKey(row.id)}
                                                    disabled={processingId === row.id}
                                                    className="text-slate-400 hover:text-red-500 text-xs font-bold transition-colors"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Legend Area */}
            <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Keterangan status:</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-600">
                           <strong className="text-slate-800">Aktif</strong> <span className="opacity-70 font-medium">→ API berhasil diakses dan data tersinkronisasi</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-600">
                           <strong className="text-slate-800">Belum diuji</strong> <span className="opacity-70 font-medium">→ API key sudah ditambahkan namun belum dicoba sinkronisasi</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-xs text-slate-600">
                           <strong className="text-slate-800">Tidak aktif</strong> <span className="opacity-70 font-medium">→ Gagal terhubung ke endpoint atau API key tidak valid</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                        <div className="px-6 py-4 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Edit Konfigurasi</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Sumber Data / Judul</label>
                                <input 
                                    type="text" 
                                    value={editingRow?.name || ''}
                                    onChange={(e) => setEditingRow(prev => prev ? {...prev, name: e.target.value} : null)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Endpoint API / Base URL</label>
                                <textarea 
                                    rows={3}
                                    value={editingRow?.base_url || ''}
                                    onChange={(e) => setEditingRow(prev => prev ? {...prev, base_url: e.target.value} : null)}
                                    placeholder="https://..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-indigo-600 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none"
                                />
                            </div>
                             <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">ID Variabel (BPS/Specific)</label>
                                <input 
                                    type="text" 
                                    value={editingRow?.variable_id || ''}
                                    onChange={(e) => setEditingRow(prev => prev ? {...prev, variable_id: e.target.value} : null)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                    placeholder="Contoh: 123 (Kosongkan jika ingin auto-extract)"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">API Key (Sensitive)</label>
                                <input 
                                    type="password" 
                                    value={editingRow?.api_key || ''}
                                    onChange={(e) => setEditingRow(prev => prev ? {...prev, api_key: e.target.value} : null)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                    placeholder="Masukkan API Key..."
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 flex justify-end space-x-3 bg-slate-50">
                            <button 
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="button"
                                onClick={saveEdit}
                                disabled={processingId !== null}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {processingId ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Data Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Preview Data Tersimpan</h2>
                                <p className="text-xs text-slate-500">Melihat data terakhir hasil sinkronisasi API.</p>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-xl">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-0 overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-4">Wilayah</th>
                                        <th className="px-6 py-4">Tahun</th>
                                        <th className="px-6 py-4">Indikator</th>
                                        <th className="px-6 py-4 text-right">Nilai</th>
                                    </tr>
                                </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {processingId !== null && viewingData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-slate-400 animate-pulse font-medium">
                                                Mengambil data dari database...
                                            </td>
                                        </tr>
                                    ) : viewingData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">
                                                Tidak ada data ditemukan untuk indikator ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        viewingData.map((d, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{d.region_name || d.wilayah}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-400">{d.period_year || d.tahun}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500 italic">{d.label || d.indikator}</td>
                                                <td className="px-6 py-4 text-right font-black text-slate-900">{d.value !== undefined ? d.value : d.nilai}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 flex justify-end border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md active:scale-95"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CeriaSettings;
