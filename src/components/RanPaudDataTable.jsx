// RanPaudDataTable.jsx - Komponen untuk menampilkan Data Program dan Indikator RAN PAUDHI
import React, { useState, useEffect } from 'react';
import { Eye, X, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';
import apiService from '../utils/apiService';

// Modal untuk menampilkan detail program
const ProgramDetailModal = ({ program, isOpen, onClose }) => {
  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detail Program PAUDHI</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Program Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi Program</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-blue-700">Kementerian/Lembaga:</span>
                <p className="font-medium text-blue-900">{program.klName}</p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Program:</span>
                <p className="font-medium text-blue-900">{program.program}</p>
              </div>
            </div>
          </div>

          {/* Indikators */}
          <div>
          {/* Dokumen Regulasi (Optional) */}
          {program.regulationDocName || program.regulationDocUrl ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📘 Dokumen Regulasi</h3>
              <div className="space-y-1">
                {program.regulationDocName && (
                  <p className="text-gray-800">{program.regulationDocName}</p>
                )}
                {program.regulationDocUrl && (
                  <a href={program.regulationDocUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    Buka Dokumen
                  </a>
                )}
              </div>
            </div>
          ) : null}
            <h3 className="font-semibold text-gray-900 mb-4">Indikator Program</h3>
            <div className="space-y-4">
              {program.indikators && program.indikators.length > 0 ? (
                program.indikators.map((indikator, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Indikator:</span>
                        <p className="font-medium text-gray-900">{indikator.indikator}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Target/Satuan:</span>
                        <p className="font-medium text-gray-900">{indikator.targetSatuan}</p>
                      </div>
                    </div>
                    
                    {/* Tahun Data */}
                    {indikator.tahunData && indikator.tahunData.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Data Tahunan:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-600 border-b">
                                <th className="py-2 pr-4">Tahun</th>
                                <th className="py-2 pr-4">Target</th>
                                <th className="py-2 pr-4">Realisasi</th>
                                <th className="py-2 pr-4">Persentase</th>
                                <th className="py-2 pr-4">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {indikator.tahunData.map((tahun, tIdx) => (
                                <tr key={tIdx} className="border-b last:border-b-0">
                                  <td className="py-2 pr-4">{tahun.tahun}</td>
                                  <td className="py-2 pr-4">{tahun.target ?? '-'}</td>
                                  <td className="py-2 pr-4">{tahun.realisasi ?? '-'}</td>
                                  <td className="py-2 pr-4">
                                    {typeof tahun.persentase === 'number' ? `${Math.round(tahun.persentase)}%` : '-'}
                                  </td>
                                  <td className="py-2 pr-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      tahun.kategori === 'TERCAPAI' ? 'bg-green-100 text-green-800' :
                                      tahun.kategori === 'TIDAK TERCAPAI' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {tahun.kategori || '-'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Tidak ada data indikator tersedia
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Informasi Tambahan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Dibuat:</span>
                <p className="text-gray-900">
                  {program.createdAt ? new Date(program.createdAt).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Terakhir Update:</span>
                <p className="text-gray-900">
                  {program.updatedAt ? new Date(program.updatedAt).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RanPaudDataTable = ({ title = "Data Program dan Indikator RAN PAUDHI", className = "" }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    klId: '',
    status: ''
  });
  const [selectedYear, setSelectedYear] = useState(2025);

  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  useEffect(() => {
    fetchPrograms();
  }, [selectedYear, filters]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getRanPaudData({
        year: selectedYear,
        limit: 100,
        ...filters
      });
      
      if (response.success) {
        setPrograms(response.data || []);
      } else {
        setError(response.message || 'Gagal mengambil data');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      klId: '',
      status: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TERCAPAI':
        return 'bg-green-100 text-green-800';
      case 'TIDAK TERCAPAI':
        return 'bg-red-100 text-red-800';
      case 'BELUM LAPORAN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tahun:</label>
            <select
              className="border rounded-lg px-3 py-2 bg-white text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari program atau indikator..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.klId}
            onChange={(e) => handleFilterChange('klId', e.target.value)}
          >
            <option value="">Semua K/L</option>
                            <option value="KEMENKO_PMK">Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan</option>
                <option value="KEMENDIKDASMEN">Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</option>
                <option value="KEMENAG">Kementerian Agama</option>
                <option value="KEMENDES_PDT">Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi</option>
                <option value="KEMENKES">Kementerian Kesehatan</option>
                <option value="KEMENDUKBANGGA">Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional</option>
                <option value="KEMENSOS">Kementerian Sosial</option>
                <option value="KPPPA">Kementerian Pemberdayaan Perempuan dan Perlindungan Anak</option>
                <option value="KEMENDAGRI">Kementerian Dalam Negeri</option>
                <option value="BAPPENAS">Badan Perencanaan Pembangunan Nasional</option>
                <option value="BPS">Badan Pusat Statistik</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="TERCAPAI">Tercapai</option>
            <option value="TIDAK TERCAPAI">Tidak Tercapai</option>
            <option value="BELUM LAPORAN">Belum Laporan</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Klik pada baris untuk melihat detail lengkap program dan indikator
          </p>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b bg-gray-50">
              <th className="py-3 px-4">K/L</th>
              <th className="py-3 px-4">Program</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Realisasi</th>
              <th className="py-3 px-4">Persentase</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Tidak ada data untuk ditampilkan
                </td>
              </tr>
            ) : (
              programs.map((program, idx) => {
                // Find tahun data for selected year
                const tahunData = program.indikators?.[0]?.tahunData?.find(d => d.tahun === selectedYear) ||
                                 program.tahunData?.find(d => d.tahun === selectedYear);

                return (
                  <tr 
                    key={idx} 
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleProgramClick(program)}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">{program.klName}</td>
                    <td className="py-3 px-4">{program.program}</td>
                    <td className="py-3 px-4">{tahunData?.target ?? '-'}</td>
                    <td className="py-3 px-4">{tahunData?.realisasi ?? '-'}</td>
                    <td className="py-3 px-4">
                      {typeof tahunData?.persentase === 'number' ? `${Math.round(tahunData.persentase)}%` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tahunData?.kategori)}`}>
                        {tahunData?.kategori || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProgramClick(program);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Program */}
      <ProgramDetailModal
        program={selectedProgram}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default RanPaudDataTable;
