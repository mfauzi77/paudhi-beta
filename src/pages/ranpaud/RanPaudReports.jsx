import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Building,
  Filter,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  Printer,
  Mail,
  Share2,
  Settings,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Edit,
} from "lucide-react";
import apiService from "../../utils/apiService";

const RanPaudReports = ({ setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    klId: "",
    year: new Date().getFullYear().toString(),
    statusPelaporan: "",
    kategori: "",
    includeCharts: true,
    includeSummary: true,
    includeDetail: true,
    reportType: "comprehensive",
  });

  const [klList, setKlList] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportPreview, setReportPreview] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null); // { filename, recordCount }

  const reportTypes = [
    {
      id: "comprehensive",
      name: "Laporan Komprehensif",
      description: "Laporan lengkap dengan semua data, chart, dan analisis",
      icon: FileText,
      color: "blue",
      estimatedTime: "2-3 menit",
    },
    {
      id: "summary",
      name: "Ringkasan Eksekutif",
      description: "Ringkasan singkat dengan highlights dan key metrics",
      icon: BarChart3,
      color: "green",
      estimatedTime: "30 detik",
    },
    {
      id: "progress",
      name: "Laporan Progress",
      description: "Fokus pada pencapaian dan trend perkembangan",
      icon: TrendingUp,
      color: "purple",
      estimatedTime: "1-2 menit",
    },
    {
      id: "kl_specific",
      name: "Laporan per K/L",
      description: "Detail data dan progress untuk K/L tertentu",
      icon: Building,
      color: "orange",
      estimatedTime: "1 menit",
    },
  ];

  const exportFormats = [
    {
      id: "excel",
      name: "Excel",
      icon: Download,
      description: "Spreadsheet dengan data mentah",
    },
  ];

  useEffect(() => {
    fetchInitialData();
    loadReportHistory();
  }, []);

  const fetchInitialData = async (activeFilters = filters) => {
    try {
      setLoading(true);
      // Construct query params for summary if needed, but for now we fetch KL list always
      const [klResponse, summaryResponse] = await Promise.all([
        apiService.getRanPaudKLList(),
        apiService.getRanPaudDashboard(activeFilters.year || "all"),
      ]);

      setKlList(klResponse.data || []);
      setSummaryStats(summaryResponse.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch summary when years change
  useEffect(() => {
    fetchInitialData();
  }, [filters.year]);

  const loadReportHistory = () => {
    const history = JSON.parse(
      localStorage.getItem("ranpaud_report_history") || "[]"
    );
    setReportHistory(history);
  };

  const saveReportHistory = (reportInfo) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: filters.reportType,
      klId: filters.klId,
      klName: filters.klId
        ? klList.find((kl) => kl.id === filters.klId)?.name
        : "Semua K/L",
      period: filters.year,
      format: reportInfo.format,
      status: "completed",
      fileSize: reportInfo.fileSize || "Unknown",
    };

    const history = JSON.parse(
      localStorage.getItem("ranpaud_report_history") || "[]"
    );
    history.unshift(newEntry);
    history.splice(20); // Keep only last 20 reports
    localStorage.setItem("ranpaud_report_history", JSON.stringify(history));
    setReportHistory(history);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateReport = async (format = "excel") => {

    try {
      setGeneratingReport(true);

      // Validate filters
      if (filters.klId === "select") {
        alert("Silakan pilih K/L terlebih dahulu");
        return;
      }

      // Prepare export parameters
      const exportParams = {
        klId: filters.klId && filters.klId !== "select" ? filters.klId : undefined,
        statusPelaporan: filters.statusPelaporan && filters.statusPelaporan !== "" ? filters.statusPelaporan : undefined,
        search: filters.search || undefined,
        year: filters.year,
      };

      // Call the actual export API
      const response = await apiService.exportRanPaudData(format, exportParams);

      if (format === "preview") {
        setReportPreview(response.data);
        return;
      }

      // Create download link for the file
      const blob = response.data; // response.data is already a Blob from apiService
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.filename ||
        `ran-paud-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Save to history
      saveReportHistory({
        format: format,
        fileSize: "2.5 MB",
      });

      const filename = response.filename || `ran-paud-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      setExportSuccess({
        filename,
        klName: filters.klId ? klList.find(kl => kl.id === filters.klId)?.name || 'Semua K/L' : 'Semua K/L',
        year: filters.year === 'all' ? 'Semua Tahun' : filters.year,
        capaian: filters.statusPelaporan || 'Semua',
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Gagal export: " + error.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const simulateReportGeneration = async (params, format) => {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Report generated with params:", params);
        console.log("Format:", format);
        resolve();
      }, 2000);
    });
  };

  const previewReport = async () => {
    try {
      setLoading(true);

      const exportParams = {
        klId: filters.klId && filters.klId !== "select" ? filters.klId : undefined,
        statusPelaporan: filters.statusPelaporan && filters.statusPelaporan !== "" ? filters.statusPelaporan : undefined,
        year: filters.year,
      };

      // Fetch sample data for preview
      const response = await apiService.exportRanPaudData("preview", exportParams);

      setReportPreview(response.data);
    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getReportTypeColor = (type) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
    };
    return colors[type] || colors.blue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "generating":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen p-4 md:px-6">

      {/* Export Success Popup */}
      {exportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.4)'}}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[fadeInScale_0.25s_ease-out]">
            {/* Icon */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Export Berhasil!</h3>
              <p className="text-[14px] text-gray-500">File Excel telah berhasil diunduh</p>
            </div>

            {/* File info */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-5 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">File</span>
                <span className="font-semibold text-gray-800 truncate ml-4 max-w-[200px]">{exportSuccess.filename}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">K/L</span>
                <span className="font-semibold text-gray-800">{exportSuccess.klName}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Tahun</span>
                <span className="font-semibold text-gray-800">{exportSuccess.year}</span>
              </div>
              {exportSuccess.capaian && exportSuccess.capaian !== 'Semua' && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Capaian</span>
                  <span className="font-semibold text-gray-800">{exportSuccess.capaian}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setExportSuccess(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-[14px] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Laporan SISMONEV
              </h2>
              <p className="text-[14px] text-gray-500 mt-0.5">
                Export data dan analytics ke berbagai format untuk reporting dan presentasi
              </p>
            </div>
          </div>


        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5">
            <h3 className="text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              Filter Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Kementerian/Lembaga
                </label>
                <select
                  value={filters.klId}
                  onChange={(e) => handleFilterChange("klId", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 h-9 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="">Semua K/L</option>
                  {klList.map((kl) => (
                    <option key={kl.id} value={kl.id}>
                      {kl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Capaian
                </label>
                <select
                  value={filters.statusPelaporan}
                  onChange={(e) =>
                    handleFilterChange("statusPelaporan", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 h-9 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="">Semua Status</option>
                  <option value="TERCAPAI">Tercapai</option>
                  <option value="TIDAK TERCAPAI">Tidak Tercapai</option>
                  <option value="BELUM MELAPORKAN">Belum Melaporkan</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Tahun Laporan
                </label>
                <select
                  value={filters.year}
                  onChange={(e) =>
                    handleFilterChange("year", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 h-9 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="all">Semua Tahun</option>
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Jenis Laporan
                </label>
                <select
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange("reportType", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 h-9 text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={previewReport}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 h-10 text-[14px] rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-gray-500" />
                    Preview Data
                  </>
                )}
              </button>
              
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => generateReport(format.id)}
                  disabled={generatingReport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10 text-[14px] rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center sm:ml-auto"
                >
                  {generatingReport ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <format.icon className="w-4 h-4" />
                  )}
                  {generatingReport ? "Generating..." : `Export ${format.name}`}
                </button>
              ))}
            </div>
          </div>

          {/* Report Preview */}
          {reportPreview && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Preview Data Laporan
                </h3>
              </div>

              <div className="space-y-3 text-[13px] mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Program:</span>
                    <span className="font-bold text-gray-900">{reportPreview.records?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tahun:</span>
                    <span className="font-bold text-gray-900">
                      {filters.year === 'all' ? 'Semua' : filters.year}
                    </span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600">K/L:</span>
                    <span className="font-bold text-gray-900 truncate ml-2">
                      {filters.klId
                        ? klList.find((kl) => kl.id === filters.klId)?.name
                        : "Semua"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#f8f9fa]">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-tight">K/L</th>
                      <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-tight">Program</th>
                      <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-tight">Status Laporan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {reportPreview.records?.slice(0, 10).map((item, index) => {
                      const selectedYear = filters.year !== 'all' ? parseInt(filters.year) : null;
                      const inds = item.indikators || [];
                      const relevantData = inds.flatMap(ind =>
                        (ind.tahunData || []).filter(td => !selectedYear || parseInt(td.tahun) === selectedYear)
                      );
                      let achievementStatus = 'BELUM MELAPORKAN';
                      if (relevantData.some(td => td.kategori === 'TERCAPAI')) achievementStatus = 'TERCAPAI';
                      else if (relevantData.some(td => td.kategori === 'TIDAK TERCAPAI')) achievementStatus = 'TIDAK TERCAPAI';

                      const statusStyle = achievementStatus === 'TERCAPAI'
                        ? 'bg-green-100 text-green-800'
                        : achievementStatus === 'TIDAK TERCAPAI'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500';

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-[12px] font-medium text-gray-900 whitespace-nowrap">{item.klName}</td>
                          <td className="px-3 py-2 text-[12px] text-gray-700 whitespace-nowrap truncate max-w-[150px]">{item.program}</td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusStyle}`}>
                              {achievementStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {reportPreview.records?.length > 10 && (
                <p className="text-[11px] text-gray-500 mt-2 italic">
                  * Menampilkan 10 dari {reportPreview.records.length} program.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">


          {/* Report History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5">
            <h3 className="text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Riwayat Laporan
            </h3>

            {reportHistory.length === 0 ? (
              <div className="text-center py-4">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] text-gray-500">Belum ada laporan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reportHistory.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-gray-900 leading-tight">
                        {reportTypes.find((t) => t.id === report.type)?.name}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {report.klName} • {report.period}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(report.timestamp).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.format.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {report.fileSize}
                      </div>
                    </div>
                  </div>
                ))}


              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default RanPaudReports;
