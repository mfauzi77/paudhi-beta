import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, Printer, FileSpreadsheet, FileText, RefreshCw, Filter, 
  AlertCircle, CheckCircle, XCircle, Clock, Activity
} from 'lucide-react';
import apiService from '../utils/apiService';

const RanPaudReport = () => {
  // State untuk menyimpan data dashboard
  const [dashboardData, setDashboardData] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedKL, setSelectedKL] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [klData, setKlData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [nationalStats, setNationalStats] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');

  // Colors untuk chart
  const colors = {
    tercapai: '#10B981',
    tidakTercapai: '#EF4444',
    belumLapor: '#9CA3AF',
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getRanPaudDashboard();
      setDashboardData(data);
      processChartData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary stats
  const fetchSummaryStats = async () => {
    try {
      const stats = await apiService.getRanPaudSummary();
      setSummaryStats(stats);
    } catch (err) {
      console.error('Error fetching summary stats:', err);
    }
  };

  // Process chart data
  const processChartData = (data) => {
    if (!data) return;

    // Process KL data for bar chart
    const klChartData = data.klData.map(kl => ({
      name: kl.klName,
      klId: kl.klId,
      tercapai: kl.tercapai || 0,
      tidakTercapai: kl.tidakTercapai || 0,
      belumLapor: kl.belumLapor || 0,
      totalRO: kl.totalRO || 0,
      achievement: kl.achievement || 0,
    }));
    setKlData(klChartData);

    // Process yearly data for line chart
    const yearlyChartData = data.yearlyData.map(year => ({
      tahun: year.tahun,
      tercapai: year.tercapaiPercentage || 0,
      tidakTercapai: year.tidakTercapaiPercentage || 0,
      belumLapor: year.belumLaporPercentage || 0,
    }));
    setYearlyData(yearlyChartData);

    // Process heatmap data
    setHeatmapData(data.heatmapData || []);

    // Set national stats
    setNationalStats(data.nationalStats || {});
  };

  // Function untuk mendapatkan warna heatmap berdasarkan nilai
  const getHeatmapColor = (value) => {
    if (value === 0) return '#9CA3AF'; // Gray for 0%
    if (value >= 80) return '#10B981'; // Green for 80-100%
    if (value >= 60) return '#34D399'; // Light green for 60-79%
    if (value >= 40) return '#FCD34D'; // Yellow for 40-59%
    if (value >= 20) return '#F87171'; // Light red for 20-39%
    return '#EF4444'; // Red for 1-19%
  };

  // Export report function
  const exportReport = async (format) => {
    try {
      setExportLoading(true);
      setExportFormat(format);
      
      const filters = {
        year: selectedYear,
        klId: selectedKL !== 'all' ? selectedKL : undefined
      };
      
      let result;
      if (format === 'excel') {
        result = await apiService.exportExcel(filters, 'dashboard', {
          includeCharts: true,
          includeSummary: true,
          includeDetail: true
        });
      } else if (format === 'pdf') {
        result = await apiService.exportPDF(filters, 'dashboard', {
          includeCharts: true,
          includeSummary: true,
          includeDetail: true
        });
      } else if (format === 'word') {
        result = await apiService.exportWord(filters, 'dashboard', {
          includeCharts: true,
          includeSummary: true,
          includeDetail: true
        });
      }
      
      // Handle download if result contains binary data
      if (result && result.data) {
        const blob = new Blob([result.data], {
          type: format === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : format === 'pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || `ran-paud-report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error(`Error exporting ${format}:`, err);
      setError(`Gagal mengekspor ${format}: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchSummaryStats();
  }, []);

  // Calculate total stats
  const totalStats = summaryStats ? {
    totalRO: summaryStats.totalRO || 0,
    totalKL: summaryStats.totalKL || 0,
    totalTercapai: summaryStats.totalTercapai || 0,
    totalTidakTercapai: summaryStats.totalTidakTercapai || 0,
    totalBelumLapor: summaryStats.totalBelumLapor || 0,
  } : {
    totalRO: 0,
    totalKL: 0,
    totalTercapai: 0,
    totalTidakTercapai: 0,
    totalBelumLapor: 0,
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600">Memuat data laporan...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-800 font-medium mb-2">Terjadi kesalahan</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Laporan RAN PAUDHI</h2>
          <p className="text-gray-500 text-sm">
            Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
              <option value={2021}>2021</option>
              <option value={2020}>2020</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ekspor Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => exportReport('excel')}
            disabled={exportLoading}
            className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${exportLoading && exportFormat === 'excel' ? 'bg-gray-100' : 'hover:bg-green-50 hover:border-green-200'} transition-colors`}
          >
            {exportLoading && exportFormat === 'excel' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
            ) : (
              <FileSpreadsheet className="w-6 h-6 text-green-500" />
            )}
            <div className="text-left">
              <div className="font-medium">Ekspor Excel</div>
              <div className="text-xs text-gray-500">Unduh laporan dalam format Excel</div>
            </div>
          </button>
          
          <button
            onClick={() => exportReport('pdf')}
            disabled={exportLoading}
            className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${exportLoading && exportFormat === 'pdf' ? 'bg-gray-100' : 'hover:bg-red-50 hover:border-red-200'} transition-colors`}
          >
            {exportLoading && exportFormat === 'pdf' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <FileText className="w-6 h-6 text-red-500" />
            )}
            <div className="text-left">
              <div className="font-medium">Ekspor PDF</div>
              <div className="text-xs text-gray-500">Unduh laporan dalam format PDF</div>
            </div>
          </button>
          
          <button
            onClick={() => exportReport('word')}
            disabled={exportLoading}
            className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${exportLoading && exportFormat === 'word' ? 'bg-gray-100' : 'hover:bg-blue-50 hover:border-blue-200'} transition-colors`}
          >
            {exportLoading && exportFormat === 'word' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            ) : (
              <FileText className="w-6 h-6 text-blue-500" />
            )}
            <div className="text-left">
              <div className="font-medium">Ekspor Word</div>
              <div className="text-xs text-gray-500">Unduh laporan dalam format Word</div>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total RO</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {totalStats.totalRO}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Dari {totalStats.totalKL} Kementerian/Lembaga
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tercapai</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {totalStats.totalTercapai}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalStats.totalRO > 0
              ? `${((totalStats.totalTercapai / totalStats.totalRO) * 100).toFixed(1)}% dari total RO`
              : "0% dari total RO"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tidak Tercapai</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                {totalStats.totalTidakTercapai}
              </h3>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalStats.totalRO > 0
              ? `${((totalStats.totalTidakTercapai / totalStats.totalRO) * 100).toFixed(1)}% dari total RO`
              : "0% dari total RO"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Belum Lapor</p>
              <h3 className="text-2xl font-bold text-gray-600 mt-1">
                {totalStats.totalBelumLapor}
              </h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalStats.totalRO > 0
              ? `${((totalStats.totalBelumLapor / totalStats.totalRO) * 100).toFixed(1)}% dari total RO`
              : "0% dari total RO"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Achievement by K/L Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Capaian per K/L
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={klData}
              margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `${value}`,
                  name === "tercapai"
                    ? "Tercapai"
                    : name === "tidakTercapai"
                    ? "Tidak Tercapai"
                    : "Belum Lapor",
                ]}
              />
              <Legend />
              <Bar dataKey="tercapai" fill={colors.tercapai} name="Tercapai" />
              <Bar
                dataKey="tidakTercapai"
                fill={colors.tidakTercapai}
                name="Tidak Tercapai"
              />
              <Bar
                dataKey="belumLapor"
                fill={colors.belumLapor}
                name="Belum Lapor"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Status RO Nasional
          </h3>
          <div className="flex justify-center">
            <PieChart width={450} height={350}>
              <Pie
                data={[
                  {
                    name: "Tercapai",
                    value: totalStats.totalTercapai,
                    color: colors.tercapai,
                  },
                  {
                    name: "Tidak Tercapai",
                    value: totalStats.totalTidakTercapai,
                    color: colors.tidakTercapai,
                  },
                  {
                    name: "Belum Lapor",
                    value: totalStats.totalBelumLapor,
                    color: colors.belumLapor,
                  },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, value, percent }) => {
                  // Custom label dengan teks yang lebih pendek untuk "Tidak Tercapai"
                  const displayName = name === "Tidak Tercapai" ? "Tidak Tercapai" : name;
                  return `${displayName}: ${value} (${(percent * 100).toFixed(1)}%)`;
                }}
                labelLine={{ stroke: '#666', strokeWidth: 1 }}
              >
                {[
                  {
                    name: "Tercapai",
                    value: totalStats.totalTercapai,
                    color: colors.tercapai,
                  },
                  {
                    name: "Tidak Tercapai",
                    value: totalStats.totalTidakTercapai,
                    color: colors.tidakTercapai,
                  },
                  {
                    name: "Belum Lapor",
                    value: totalStats.totalBelumLapor,
                    color: colors.belumLapor,
                  },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
          
          {/* Custom Legend */}
          <div className="mt-4 flex justify-center">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.tercapai }}></div>
                <span className="text-sm text-gray-700">Tercapai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.tidakTercapai }}></div>
                <span className="text-sm text-gray-700">Tidak Tercapai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.belumLapor }}></div>
                <span className="text-sm text-gray-700">Belum Lapor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Trend Line Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tren Capaian Nasional 2020-2024
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={yearlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tahun" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, ""]} />
            <Legend />
            <Line
              type="monotone"
              dataKey="tercapai"
              stroke={colors.tercapai}
              strokeWidth={3}
              name="Tercapai"
              dot={{ fill: colors.tercapai, r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="tidakTercapai"
              stroke={colors.tidakTercapai}
              strokeWidth={3}
              name="Tidak Tercapai"
              dot={{ fill: colors.tidakTercapai, r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="belumLapor"
              stroke={colors.belumLapor}
              strokeWidth={3}
              name="Belum Lapor"
              dot={{ fill: colors.belumLapor, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Heatmap Achievement Rate per K/L (2020-2024)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-3 border-b font-medium text-gray-700">
                  K/L
                </th>
                <th className="text-center p-3 border-b font-medium text-gray-700">
                  2020
                </th>
                <th className="text-center p-3 border-b font-medium text-gray-700">
                  2021
                </th>
                <th className="text-center p-3 border-b font-medium text-gray-700">
                  2022
                </th>
                <th className="text-center p-3 border-b font-medium text-gray-700">
                  2023
                </th>
                <th className="text-center p-3 border-b font-medium text-gray-700">
                  2024
                </th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3 border-b font-medium text-sm text-gray-900">
                    {row.kl}
                  </td>
                  {[2020, 2021, 2022, 2023, 2024].map((year) => (
                    <td key={year} className="p-3 border-b text-center">
                      <div
                        className="inline-flex items-center justify-center w-16 h-8 rounded text-white text-sm font-medium cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: getHeatmapColor(row[year] || 0),
                        }}
                        title={`${row.kl} - ${year}: ${(row[year] || 0).toFixed(
                          1
                        )}%`}
                      >
                        {(row[year] || 0).toFixed(1)}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
          <span className="text-gray-600">Achievement Rate:</span>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#9CA3AF" }}
            ></div>
            <span>0%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#EF4444" }}
            ></div>
            <span>1-39%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#FCD34D" }}
            ></div>
            <span>40-59%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#34D399" }}
            ></div>
            <span>60-79%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "#10B981" }}
            ></div>
            <span>80-100%</span>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Cetak Laporan
        </button>
      </div>
    </div>
  );
};

export default RanPaudReport;