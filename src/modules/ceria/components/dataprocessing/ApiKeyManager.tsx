
import React, { useState } from 'react';
import { DataSource } from '../../types';
import { KeyIcon } from '../icons/Icons';
// FIX: Remove direct import and use DataContext instead.
import { useData } from '../../context/DataContext';

const ApiKeyManager: React.FC = () => {
    // FIX: Get data from the useData context hook.
    const { appData } = useData();
    const dataSources = appData?.dataSources || [];
    
    // In a real app, keys would be fetched from a secure store, not kept in local state.
    // This state simulates which key is being edited.
    const [editingId, setEditingId] = useState<string | null>(null);
    // This state simulates the stored keys. We'll just store placeholder text.
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({
        'kemen-pppa': '', // Start with one empty to show the "Not Set" state
    });
    const [tempKey, setTempKey] = useState('');

    const handleEdit = (source: DataSource) => {
        setEditingId(source.id);
        setTempKey(apiKeys[source.id] || '');
    };

    const handleCancel = () => {
        setEditingId(null);
        setTempKey('');
    };

    const handleSave = (sourceId: string) => {
        setApiKeys(prev => ({ ...prev, [sourceId]: tempKey }));
        setEditingId(null);
        setTempKey('');
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <KeyIcon className="w-6 h-6 mr-2 text-indigo-500" />
                Konfigurasi Konektor Data
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                Masukkan API Key dari kementerian/instansi terkait untuk mengaktifkan sinkronisasi data. Kunci API disimpan secara aman.
            </p>
            <ul className="space-y-3">
                {dataSources.map(source => {
                    const isEditing = editingId === source.id;
                    const hasKey = apiKeys[source.id] || (!apiKeys.hasOwnProperty(source.id) && source.id !== 'kemen-pppa');
                    
                    return (
                        <li key={source.id} className="p-3 bg-slate-50 rounded-md">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <p className="font-semibold text-slate-800 text-sm mb-2 sm:mb-0">{source.name}</p>
                                {!isEditing && (
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-mono px-2 py-1 rounded ${hasKey ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-700 font-semibold'}`}>
                                            {hasKey ? '••••••••••••••••' : 'Not Set'}
                                        </span>
                                        <button onClick={() => handleEdit(source)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Edit</button>
                                    </div>
                                )}
                            </div>
                             {isEditing && (
                                <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <input
                                        type="password"
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        placeholder="Masukkan API Key..."
                                        className="flex-grow text-sm border-slate-300 rounded-md bg-white text-slate-900"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <button onClick={() => handleSave(source.id)} className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Simpan</button>
                                        <button onClick={handleCancel} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Batal</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ApiKeyManager;
