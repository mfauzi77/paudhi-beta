import React,{ useState } from 'react';
import { validateUploadedData } from '../../services/geminiService';
import { DataValidationResult } from '../../types';
import { ArrowPathIcon,CircleStackIcon,DocumentArrowDownIcon,ExclamationTriangleIcon,ShieldCheckIcon,SparklesIcon } from '../icons/Icons';

type DataRow = Record<string, string>;

const DataUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<DataRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    
    const [validationResult, setValidationResult] = useState<DataValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const parseCSV = (csvText: string) => {
        const lines = csvText.trim().split('\n');
        const headerLine = lines[0].split(',').map(h => h.trim());
        setHeaders(headerLine);
        
        const rows: DataRow[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: DataRow = {};
            headerLine.forEach((header, index) => {
                row[header] = values[index];
            });
            rows.push(row);
        }
        setData(rows);
    };

    const handleFile = (selectedFile: File) => {
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setValidationResult(null);
            setIsSubmitted(false);

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                parseCSV(text);
            };
            reader.readAsText(selectedFile);
        } else {
            alert('Please upload a valid CSV file.');
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    
    const handleValidate = async () => {
        if (!file) return;
        setIsLoading(true);
        setValidationResult(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const result = await validateUploadedData(text);
            setValidationResult(result);
            setIsLoading(false);
        };
        reader.readAsText(file);
    };
    
    const handleSubmit = () => {
        // In a real app, this would send `data` to the backend
        console.log("Submitting data:", data);
        setIsSubmitted(true);
        setTimeout(() => {
            // Reset state after a delay
            setFile(null);
            setData([]);
            setHeaders([]);
            setValidationResult(null);
            setIsSubmitted(false);
        }, 3000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <DocumentArrowDownIcon className="w-6 h-6 mr-2 text-indigo-500" />
                Upload Data Indikator (CSV)
            </h3>

            {!file ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'}`}
                >
                    <CircleStackIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">Drag and drop file CSV</h3>
                    <p className="mt-1 text-xs text-slate-500">atau</p>
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                        <span>pilih dari perangkat Anda</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={e => e.target.files && handleFile(e.target.files[0])} />
                    </label>
                    <p className="text-xs text-slate-500 mt-2">Format: province, cityName, period, stuntingRate, apm, etc.</p>
                </div>
            ) : (
                <div>
                    <div className="p-4 bg-slate-100 rounded-lg border">
                        <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{data.length} baris data terdeteksi.</p>
                        <div className="max-h-48 overflow-y-auto mt-2">
                             <table className="w-full text-xs text-left">
                                <thead className="text-slate-600 bg-slate-200">
                                    <tr>
                                        {headers.map(h => <th key={h} className="p-2">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {data.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="border-b">
                                            {headers.map(h => <td key={h} className="p-2 truncate max-w-[100px]">{row[h]}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                         <button onClick={handleValidate} disabled={isLoading} className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                            {isLoading ? 'Memvalidasi...' : 'Validasi dengan AI'}
                        </button>
                         <button onClick={() => setFile(null)} className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">
                            Ganti File
                        </button>
                    </div>

                    {validationResult && (
                        <div className="mt-4 p-4 border rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                                {validationResult.status === 'success' ? 
                                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-emerald-500"/> : 
                                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-500"/>
                                }
                                Hasil Validasi AI
                            </h4>
                            <p className={`text-sm ${validationResult.status === 'success' ? 'text-emerald-700' : 'text-amber-700'}`}>{validationResult.summary}</p>
                            {validationResult.issues.length > 0 && (
                                <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                                    {validationResult.issues.map((issue, i) => (
                                        <li key={i} className="text-slate-600"><span className="font-semibold">Baris {issue.row}:</span> {issue.description} (Kolom: '{issue.column}', Nilai: '{issue.value}')</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    
                    {(validationResult || isSubmitted) &&
                        <div className="mt-4">
                           {isSubmitted ? (
                                <div className="p-4 text-center bg-emerald-50 text-emerald-700 rounded-lg">
                                    <ShieldCheckIcon className="w-6 h-6 mx-auto mb-2"/>
                                    <p className="font-semibold">Data berhasil disubmit dan akan diproses.</p>
                                </div>
                           ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!validationResult || validationResult.status !== 'success'}
                                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                                >
                                    Submit Data
                                </button>
                           )}
                        </div>
                    }
                </div>
            )}
        </div>
    );
};

export default DataUploader;
