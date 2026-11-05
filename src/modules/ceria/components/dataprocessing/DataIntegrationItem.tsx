import React, { useState } from 'react';
import { SparklesIcon, DocumentArrowDownIcon, ArrowPathIcon, ExclamationTriangleIcon, CircleStackIcon, XCircleIcon, ShieldCheckIcon, DocumentPlusIcon } from '../icons/Icons';
import { extractDataFromFile } from '../../services/geminiService';
import DataTable from '../shared/DataTable';

interface DataIntegrationItemProps {
    kementerian: string;
    platform: string;
    dataName: string;
}

type DataRow = Record<string, any>;

export const DataIntegrationItem: React.FC<DataIntegrationItemProps> = ({ kementerian, platform, dataName }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [tableData, setTableData] = useState<{ headers: string[], rows: DataRow[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const abortControllerRef = React.useRef<AbortController | null>(null);


    const handleFile = (selectedFile: File) => {
        const allowedTypes = [
            'text/csv', 
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setTableData(null);
            setError(null);
            setIsSaved(false);
        } else {
            setError('Tipe file tidak didukung. Harap unggah file CSV, Excel, atau PDF.');
        }
    };

    const handleProcessAI = async () => {
        // SOP 1: Audit Component Lifecycle
        if (!file || isLoading || cooldown) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        try {
            const result = await extractDataFromFile(file, abortControllerRef.current.signal);
            if (result.rows.length === 0) {
                setError('AI tidak dapat mengekstrak data tabel dari file ini. Pastikan file berisi data tabular yang jelas.');
            } else {
                setTableData(result);
                
                // SOP: 2s cooldown
                setCooldown(true);
                setTimeout(() => setCooldown(false), 2000);
            }
        } catch (e: any) {
            if (e.name === 'AbortError') return;
            console.error(e);
            setError(e.message || 'Terjadi kesalahan saat pemrosesan AI. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };


    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    
    const handleSave = () => {
        if (!tableData) return;
        // In a real app, this would send data to a backend.
        console.log("Saving data for:", dataName, tableData);
        setIsSaved(true);
    };

    const handleClear = () => {
        setIsExpanded(false);
        setFile(null);
        setTableData(null);
        setError(null);
        setIsSaved(false);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-slate-800">{dataName}</h4>
                    <p className="text-xs text-slate-500">{kementerian} • {platform}</p>
                </div>
                {!isExpanded ? (
                     <button onClick={() => setIsExpanded(true)} className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors">
                        Tambah Data
                    </button>
                ) : (
                    <button onClick={handleClear} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                        <XCircleIcon className="w-6 h-6"/>
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    {!tableData ? (
                        <div>
                             {!file ? (
                                <div
                                    onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'}`}
                                >
                                    <DocumentArrowDownIcon className="mx-auto h-10 w-10 text-slate-400" />
                                    <p className="mt-2 text-sm font-semibold text-slate-900">Drag & drop file Excel atau PDF</p>
                                    <p className="mt-1 text-xs text-slate-500">atau</p>
                                    <label htmlFor={`file-${dataName}`} className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                                        <span>pilih dari perangkat Anda</span>
                                        <input id={`file-${dataName}`} name={`file-${dataName}`} type="file" className="sr-only" accept=".csv,.xlsx,.xls,.pdf" onChange={e => e.target.files && handleFile(e.target.files[0])} />
                                    </label>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-100 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-semibold text-slate-800">{file.name}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button onClick={() => setFile(null)} className="flex-1 sm:flex-none text-xs font-semibold text-slate-600 hover:text-slate-800">Ganti</button>
                                        <button onClick={handleProcessAI} disabled={isLoading || cooldown} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300">
                                            {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : cooldown ? <ArrowPathIcon className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                                            {isLoading ? 'Memproses...' : cooldown ? 'Wait...' : 'Baca dengan AI'}
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                             <h5 className="text-sm font-bold text-slate-800 mb-2 flex items-center">
                                <CircleStackIcon className="w-5 h-5 mr-2 text-emerald-500"/>
                                Data Berhasil Diekstrak
                            </h5>
                             <div className="max-h-64 overflow-auto border border-slate-200 rounded-lg">
                                <DataTable headers={tableData.headers} data={tableData.rows} />
                            </div>
                            <div className="mt-4">
                                {isSaved ? (
                                    <div className="p-3 text-center bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold flex items-center justify-center">
                                        <ShieldCheckIcon className="w-5 h-5 mr-2"/>
                                        Data berhasil disimpan!
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleSave} 
                                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700">
                                        <DocumentPlusIcon className="w-5 h-5 mr-2"/>
                                        Simpan Data
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
