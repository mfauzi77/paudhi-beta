import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, Download, X, CheckCircle, AlertTriangle, 
  Eye, RefreshCw, ArrowRight, FileText, Target, Calendar, Building,
  Check, AlertCircle as AlertIcon, Info, MoreHorizontal, Trash2
} from 'lucide-react';
import apiService from '../../utils/apiService';

// Excel/CSV parsing helper (using a simple CSV parser for demo)
const parseCSV = (text) => {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return { headers, data };
};

// Template data untuk download
const templateData = [
  {
    'K/L ID': 'KEMENKO_PMK',
            'K/L Name': 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    'Program': 'Pelaksanaan koordinasi kementrian/lembaga terkait RAN-PAUDHI',
    'Indikator': 'Terlaksananya koordinasi kementerian/lembaga terkait RAN PAUDHI (K/L)',
    'Target/Satuan': 'Lembaga',
    'Jumlah RO': '1',
    'Target 2020': '1',
    'Realisasi 2020': '0',
    'Anggaran 2020': '[ISI DISINI]',
    'Target 2021': '1',
    'Realisasi 2021': '1',
    'Anggaran 2021': '[ISI DISINI]',
    'Target 2022': '1',
    'Realisasi 2022': '1',
    'Anggaran 2022': '[ISI DISINI]',
    'Target 2023': '1',
    'Realisasi 2023': '1',
    'Anggaran 2023': '[ISI DISINI]',
    'Target 2024': '1',
    'Realisasi 2024': '1',
    'Anggaran 2024': '[ISI DISINI]',
    'Notes': 'Catatan tambahan'
  }
];

const RanPaudImport = ({ setActiveTab }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Import, 4: Results
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [importData, setImportData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [importHistory, setImportHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const klOptions = [
    { id: 'KEMENKO_PMK', name: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan' },
    { id: 'KEMENDIKDASMEN', name: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi' },
    { id: 'KEMENAG', name: 'Kementerian Agama' },
    { id: 'KEMENDES_PDT', name: 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi' },
    { id: 'KEMENKES', name: 'Kementerian Kesehatan' },
    { id: 'KEMENDUKBANGGA', name: 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional' },
    { id: 'KEMENSOS', name: 'Kementerian Sosial' },
    { id: 'KPPPA', name: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak' },
    { id: 'KEMENDAGRI', name: 'Kementerian Dalam Negeri' },
    { id: 'BAPPENAS', name: 'Badan Perencanaan Pembangunan Nasional' },
    { id: 'BPS', name: 'Badan Pusat Statistik' }
  ];

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = () => {
    // Load from localStorage for demo
    const history = JSON.parse(localStorage.getItem('ranpaud_import_history') || '[]');
    setImportHistory(history);
  };

  const saveImportHistory = (result) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      filename: file?.name,
      totalRows: result.success + result.failed,
      successCount: result.success,
      errorCount: result.failed,
      status: result.failed === 0 ? 'success' : 'partial'
    };
    
    const history = JSON.parse(localStorage.getItem('ranpaud_import_history') || '[]');
    history.unshift(newEntry);
    history.splice(10); // Keep only last 10 imports
    localStorage.setItem('ranpaud_import_history', JSON.stringify(history));
    setImportHistory(history);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type.includes('spreadsheet') || 
      file.type.includes('excel') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );
    
    if (excelFile) {
      handleFileSelect(excelFile);
    } else {
      alert('Please drop an Excel or CSV file.');
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setLoading(true);
    
    try {
      const validation = apiService.validateExcelFile(selectedFile);
      if (!validation.isValid) {
        alert('Error: ' + validation.errors.join(', '));
        setLoading(false);
        return;
      }

      // Parse file based on type
      if (selectedFile.name.endsWith('.csv')) {
        const text = await selectedFile.text();
        const parsed = parseCSV(text);
        setParsedData(parsed);
        processData(parsed.data);
      } else {
        // For Excel files, you would use a library like SheetJS
        // For now, we'll simulate Excel parsing
        alert('Excel parsing akan diimplementasi dengan library SheetJS. Gunakan CSV untuk demo.');
        setLoading(false);
        return;
      }
      
      setStep(2);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    const processed = [];
    const errors = [];
    
    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      const rowErrors = [];
      
      // Validate required fields
      if (!row['K/L ID']) rowErrors.push('K/L ID wajib diisi');
      if (!row['K/L Name']) rowErrors.push('K/L Name wajib diisi');
      if (!row['Program']) rowErrors.push('Program wajib diisi');
      if (!row['Indikator']) rowErrors.push('Indikator wajib diisi');
      if (!row['Target/Satuan']) rowErrors.push('Target/Satuan wajib diisi');
      
      // Validate K/L ID
      if (row['K/L ID'] && !klOptions.find(kl => kl.id === row['K/L ID'])) {
        rowErrors.push('K/L ID tidak valid');
      }
      
      // Validate numeric fields
      const jumlahRO = parseInt(row['Jumlah RO']);
      if (isNaN(jumlahRO) || jumlahRO < 1) {
        rowErrors.push('Jumlah RO harus berupa angka positif');
      }
      
      // Build tahun data
      const tahunData = [];
      for (let tahun = 2020; tahun <= 2024; tahun++) {
        const target = row[`Target ${tahun}`] ? parseFloat(row[`Target ${tahun}`]) : null;
        const realisasi = row[`Realisasi ${tahun}`] ? parseFloat(row[`Realisasi ${tahun}`]) : null;
        const anggaran = row[`Anggaran ${tahun}`] || '[ISI DISINI]';
        
        let persentase = 0;
        let kategori = 'BELUM LAPORAN';
        
        if (target && realisasi) {
          persentase = Math.round((realisasi / target) * 100 * 100) / 100;
          if (persentase >= 100) {
            kategori = 'TERCAPAI';
          } else if (persentase > 0) {
            kategori = 'TIDAK TERCAPAI';
          }
        }
        
        tahunData.push({
          tahun,
          target,
          realisasi,
          anggaran,
          persentase,
          kategori
        });
      }
      
      const processedRow = {
        rowNumber,
        isValid: rowErrors.length === 0,
        errors: rowErrors,
        data: {
          klId: row['K/L ID'],
          klName: row['K/L Name'],
          program: row['Program'],
          indikator: row['Indikator'],
          targetSatuan: row['Target/Satuan'],
          jumlahRO: jumlahRO || 1,
          tahunData,
          notes: row['Notes'] || ''
        }
      };
      
      processed.push(processedRow);
      
      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: rowErrors
        });
      }
    });
    
    setImportData(processed);
    setValidationErrors(errors);
    
    // Select all valid rows by default
    const validRowIndices = processed
      .filter(row => row.isValid)
      .map((_, index) => index);
    setSelectedRows(new Set(validRowIndices));
  };

  const handleImport = async () => {
    const selectedData = importData
      .filter((_, index) => selectedRows.has(index) && importData[index].isValid)
      .map(row => row.data);
    
    if (selectedData.length === 0) {
      alert('Tidak ada data valid yang dipilih untuk diimport.');
      return;
    }
    
    setStep(3);
    setImportProgress(0);
    
    try {
      const response = await apiService.importRanPaudData(selectedData, overwriteExisting);
      setImportResults(response.results);
      saveImportHistory(response.results);
      setStep(4);
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        success: 0,
        failed: selectedData.length,
        errors: [error.message]
      });
      setStep(4);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setParsedData(null);
    setImportData([]);
    setValidationErrors([]);
    setImportProgress(0);
    setImportResults(null);
    setSelectedRows(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    const validIndices = importData
      .map((row, index) => row.isValid ? index : null)
      .filter(index => index !== null);
    
    if (selectedRows.size === validIndices.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(validIndices));
    }
  };

  const downloadTemplate = () => {
    const csv = [
      Object.keys(templateData[0]).join(','),
      ...templateData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RAN_PAUD_HI_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStepColor = (stepNumber) => {
    if (stepNumber < step) return 'bg-green-500 text-white';
    if (stepNumber === step) return 'bg-purple-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-purple-100 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Import Data Excel
              </h2>
              <p className="text-gray-600">
                Upload dan import data RAN PAUDHI dari file Excel atau CSV
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={downloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            
            <button
              onClick={() => setActiveTab('ran-paud-data')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Kelola Data
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[
            { number: 1, title: 'Upload File', icon: Upload },
            { number: 2, title: 'Preview Data', icon: Eye },
            { number: 3, title: 'Import Process', icon: RefreshCw },
            { number: 4, title: 'Results', icon: CheckCircle }
          ].map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${getStepColor(stepItem.number)}`}>
                  {stepItem.number < step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <stepItem.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-sm font-medium text-gray-700 mt-2">{stepItem.title}</div>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > stepItem.number ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: File Upload */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="max-w-2xl mx-auto">
            
            {/* Upload Area */}
            <div 
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${dragOver ? 'text-orange-500' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop file Excel atau CSV di sini
              </h3>
              <p className="text-gray-600 mb-4">
                Atau klik tombol di bawah untuk memilih file
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Pilih File
                  </>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: Excel (.xlsx, .xls), CSV (.csv)
                <br />
                Maximum file size: 10MB
              </p>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Petunjuk Import
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Download template Excel untuk format yang benar</li>
                <li>• Pastikan kolom K/L ID menggunakan kode yang valid (KEMENKO_PMK, KEMENKES, etc.)</li>
                <li>• Data tahun 2020-2024 harus dalam format angka untuk target dan realisasi</li>
                <li>• Kolom yang wajib diisi: K/L ID, K/L Name, Program, Indikator, Target/Satuan</li>
                <li>• Sistem akan otomatis menghitung persentase dan kategori achievement</li>
                <li>• Data yang sudah ada bisa ditimpa dengan mengaktifkan opsi "Overwrite"</li>
              </ul>
            </div>

            {/* Import History */}
            {importHistory.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Import</h4>
                <div className="space-y-2">
                  {importHistory.slice(0, 3).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.filename}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.successCount}/{entry.totalRows}
                        </div>
                        <div className="text-xs text-gray-500">berhasil</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Preview Data */}
      {step === 2 && parsedData && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Preview Data Import</h3>
              <p className="text-gray-600">
                File: {file?.name} • {importData.length} baris data
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Overwrite data yang sudah ada</span>
              </label>
              
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Validation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Valid</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {importData.filter(row => row.isValid).length}
              </div>
              <div className="text-sm text-green-700">rows ready to import</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Errors</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {validationErrors.length}
              </div>
              <div className="text-sm text-red-700">rows with validation errors</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Selected</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedRows.size}
              </div>
              <div className="text-sm text-blue-700">rows selected for import</div>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === importData.filter(row => row.isValid).length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Row</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">K/L</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Program</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">RO</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {importData.map((row, index) => (
                    <tr key={index} className={`${row.isValid ? 'hover:bg-gray-50' : 'bg-red-50'}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          disabled={!row.isValid}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.rowNumber}</td>
                      <td className="px-4 py-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.data.klName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={row.data.program}>
                        {row.data.program}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.data.jumlahRO}</td>
                      <td className="px-4 py-3">
                        {row.errors.length > 0 && (
                          <div className="space-y-1">
                            {row.errors.map((error, errorIndex) => (
                              <div key={errorIndex} className="text-xs text-red-600">
                                • {error}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            
            <button
              onClick={handleImport}
              disabled={selectedRows.size === 0}
              className="bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Import {selectedRows.size} Data
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Import Progress */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Mengimport Data...
            </h3>
            <p className="text-gray-600 mb-6">
              Mohon tunggu, sedang memproses {selectedRows.size} data
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-orange-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-500">
              {importProgress}% completed
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Import Results */}
      {step === 4 && importResults && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="max-w-2xl mx-auto text-center">
            
            {/* Success/Error Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              importResults.failed === 0 
                ? 'bg-green-100' 
                : importResults.success === 0 
                  ? 'bg-red-100' 
                  : 'bg-yellow-100'
            }`}>
              {importResults.failed === 0 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : importResults.success === 0 ? (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              ) : (
                <AlertIcon className="w-8 h-8 text-yellow-600" />
              )}
            </div>

            {/* Results Summary */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Import {importResults.failed === 0 ? 'Berhasil' : 'Selesai'}
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {importResults.success}
                </div>
                <div className="text-sm text-green-700">Data berhasil diimport</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600">
                  {importResults.failed}
                </div>
                <div className="text-sm text-red-700">Data gagal diimport</div>
              </div>
            </div>

            {/* Error Details */}
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Lagi
              </button>
              
              <button
                onClick={() => setActiveTab('ran-paud-data')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Lihat Data
              </button>
              
              <button
                onClick={() => setActiveTab('ran-paud-dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Lihat Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RanPaudImport;