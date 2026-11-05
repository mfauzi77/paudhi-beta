import React, { useState, useCallback } from 'react';
import { SparklesIcon, ArrowPathIcon, CircleStackIcon } from './icons/Icons';
import { analyzeCsvDataWithPrompt } from '../services/geminiService';
import DataTable from './shared/DataTable';
import InsightContainer from './shared/InsightContainer';

type DataRow = Record<string, string>;

const UploadData: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [csvString, setCsvString] = useState<string>('');
    const [tableData, setTableData] = useState<{ headers: string[]; rows: DataRow[] } | null>(null);
    const [userPrompt, setUserPrompt] = useState('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const abortControllerRef = React.useRef<AbortController | null>(null);


    const parseCSV = (csvText: string) => {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            setError('File CSV harus memiliki setidaknya satu baris header dan satu baris data.');
            return;
        }
        const headerLine = lines[0].split(',').map(h => h.trim());
        setTableData({
            headers: headerLine,
            rows: lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const row: DataRow = {};
                headerLine.forEach((header, index) => {
                    row[header] = values[index];
                });
                return row;
            })
        });
    };

    const handleFile = useCallback((selectedFile: File) => {
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setAnalysisResult(null);
            setError(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setCsvString(text);
                parseCSV(text);
            };
            reader.onerror = () => {
                setError('Gagal membaca file.');
            };
            reader.readAsText(selectedFile);
        } else {
            setError('Tipe file tidak valid. Harap unggah file .csv.');
        }
    }, []);

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

    const handleAnalyze = async () => {
        // SOP 1: Audit Component Lifecycle
        if (!csvString || !userPrompt.trim() || isLoading || cooldown) {
            if (!csvString || !userPrompt.trim()) {
                setError("Silakan unggah file CSV dan masukkan prompt analisis.");
            }
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeCsvDataWithPrompt(csvString, userPrompt, abortControllerRef.current.signal);
            setAnalysisResult(result);
            
            // SOP: 2s cooldown
            setCooldown(true);
            setTimeout(() => setCooldown(false), 2000);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message || 'Terjadi kesalahan saat menganalisis data.');
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };


    const handleClear = () => {
        setFile(null);
        setCsvString('');
        setTableData(null);
        setUserPrompt('');
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-3 text-indigo-500" />
                    Analisis Data Kustom dengan AI
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Unggah file CSV Anda, berikan instruksi, dan biarkan AI menganalisis data untuk Anda.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg">1. Unggah & Pratinjau Data</h3>
                            {file && <button onClick={handleClear} className="text-sm font-semibold text-red-600 hover:text-red-800">Mulai Ulang</button>}
                        </div>

                        {!file ? (
                             <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                                className={`mt-4 border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'}`}>
                                <CircleStackIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-2 text-sm font-semibold text-slate-900">Drag & drop file CSV di sini</h3>
                                <p className="mt-1 text-xs text-slate-500">atau</p>
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                                    <span>pilih dari perangkat Anda</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={e => e.target.files && handleFile(e.target.files[0])} />
                                </label>
                            </div>
                        ) : (
                            tableData && (
                                <div className="mt-4">
                                    <div className="p-3 bg-slate-100 rounded-lg border">
                                        <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                                        <p className="text-xs text-slate-500">{tableData.rows.length} baris data terdeteksi.</p>
                                    </div>
                                    <div className="mt-2 max-h-60 overflow-auto border rounded-lg">
                                        <DataTable headers={tableData.headers} data={tableData.rows.slice(0, 50)} />
                                    </div>
                                </div>
                            )
                        )}
                        {error && !analysisResult && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </div>

                    {file && tableData && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">2. Masukkan Prompt Analisis</h3>
                            <textarea
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                rows={4}
                                className="w-full p-2 text-sm text-slate-800 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                placeholder="Contoh: Berdasarkan data ini, provinsi mana yang memiliki tingkat stunting tertinggi? Buat ringkasan faktor-faktor yang mungkin berkorelasi."
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || cooldown || !userPrompt.trim()}
                                className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300"
                            >
                                {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : cooldown ? <ArrowPathIcon className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                                {isLoading ? 'Menganalisis...' : cooldown ? 'Wait...' : 'Analisis dengan AI'}
                            </button>
                        </div>

                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm lg:sticky lg:top-6">
                    <InsightContainer
                        title="Hasil Analisis AI"
                        icon={<SparklesIcon className="w-6 h-6 mr-2 text-indigo-500" />}
                        isLoading={isLoading}
                        error={error}
                        content={analysisResult}
                        onRegenerate={handleAnalyze}
                        loadingText="AI sedang menganalisis data Anda..."
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadData;
