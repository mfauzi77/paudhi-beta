// RAN PAUD Management - Status fields HIDDEN (Auto calculated based on achievement percentage)
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Building,
  FileText,
  Download,
  Upload,
  MoreHorizontal,
  Award,
  BarChart3,
  Activity,
  CheckSquare,
  Square,
  Settings,
} from "lucide-react";
import apiService from "../../utils/apiService";
import debugAPI from "../../utils/debugHelper";
import RanPaudForm from "../../components/RanPaudForm";
import { useAuth } from "../contexts/AuthContext";

// ===== RAN PAUD MANAGEMENT COMPONENT =====
const RanPaudManagement = ({ activeTab, setActiveTab }) => {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKL, setFilterKL] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [klList, setKlList] = useState([]); // Initialize as empty array
  const [summaryStats, setSummaryStats] = useState({});

  // Status management
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("submitted");

  // Debug mode
  const [debugMode, setDebugMode] = useState(false);

  const runDebugTests = async () => {
    console.log("🔧 Running debug tests...");
    try {
      // Test API connection
      const healthCheck = await apiService.healthCheck();
      console.log("✅ Health check:", healthCheck);

      // Test data fetching
      const testData = await apiService.getRanPaudData({ limit: 5 });
      console.log("✅ Test data fetch:", testData);

      // Test KL list
      const klList = await apiService.getRanPaudKLList();
      console.log("✅ KL list:", klList);

      console.log("🎉 All debug tests passed!");
    } catch (error) {
      console.error("❌ Debug test failed:", error);
    }
  };

  useEffect(() => {
    if (debugMode) {
      runDebugTests();
    }
  }, [debugMode]);

  // Handle auto-open form from sidebar
  useEffect(() => {
    if (activeTab === 'ran-paud-data-add') {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Paged mode only (remove custom range)
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        klId: filterKL,
        status: filterStatus,
      };

      const response = await apiService.getRanPaudData(params);
      console.log("📊 Fetched RAN PAUD data:", response);

      const rows = response?.data || [];
      const pagination = response?.pagination || {};
      const total = typeof pagination.total === 'number' ? pagination.total : (response.totalItems || response.total || response.count || rows.length);
      const pages = typeof pagination.totalPages === 'number' ? pagination.totalPages : (total && itemsPerPage ? Math.ceil(total / itemsPerPage) : 1);

      setData(rows);
      setTotalItems(total);
      setTotalPages(pages);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchKLList = async () => {
    try {
      const response = await apiService.getRanPaudKLList();
      console.log("📋 KL list response:", response);
      
      // Handle response structure from backend
      let klData = [];
      if (response.success && response.data) {
        klData = response.data;
      } else if (Array.isArray(response)) {
        klData = response;
      } else if (response.data) {
        klData = response.data;
      }
      
      console.log("📋 Fetched KL list:", klData);
      setKlList(klData);
    } catch (error) {
      console.error("❌ Error fetching KL list:", error);
      // Set default KL list if API fails
      setKlList([
        { id: "KEMENKO_PMK", name: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan" },
        { id: "KEMENDIKDASMEN", name: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi" },
        { id: "KEMENAG", name: "Kementerian Agama" },
        { id: "KEMENDES_PDT", name: "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi" },
        { id: "KEMENKES", name: "Kementerian Kesehatan" },
        { id: "KEMENDUKBANGGA", name: "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional" },
        { id: "KEMENSOS", name: "Kementerian Sosial" },
        { id: "KPPPA", name: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak" },
        { id: "KEMENDAGRI", name: "Kementerian Dalam Negeri" },
        { id: "BAPPENAS", name: "Badan Perencanaan Pembangunan Nasional" },
        { id: "BPS", name: "Badan Pusat Statistik" },
      ]);
    }
  };

  // ===== Numeric helpers to prevent NaN in UI =====
  const safeNum = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getTotalRO = (item) => {
    if (!item) return 0;
    const hasIndikators = Array.isArray(item.indikators) && item.indikators.length > 0;
    if (hasIndikators) {
      const hasAnySubRO = item.indikators.some(
        (ind) => ind && ind.jumlahRO !== undefined && ind.jumlahRO !== null && ind.jumlahRO !== ""
      );
      if (hasAnySubRO) {
        const subtotal = item.indikators.reduce((sum, ind) => sum + safeNum(ind?.jumlahRO), 0);
        if (subtotal > 0) return subtotal;
      }
    }
    return safeNum(item.jumlahRO);
  };

  // ✅ Fixed: Calculate stats from local data as fallback
  const calculateLocalStats = (data) => {
    let tercapai = 0;
    let progress = 0;
    let belumLapor = 0;
    let totalRO = 0;
    let totalProgram = data.length;

    data.forEach((item) => {
      totalRO += getTotalRO(item);

      // Count by status
      if (item.status === "approved") {
        tercapai++;
      } else if (item.status === "submitted") {
        progress++;
      } else {
        belumLapor++;
      }
    });

    return {
      totalData: totalProgram,
      tercapai,
      progress,
      belumLapor,
      totalRO,
      totalProgram,
      totalDone: tercapai,
      totalProgress: progress,
      totalBelum: belumLapor,
    };
  };

  const fetchSummaryStats = async () => {
    try {
      const response = await apiService.getRanPaudSummary();
      console.log("📊 Summary response:", response);

      // Handle response structure from backend
      let stats = {};
      if (response.success && response.data) {
        stats = response.data;
      } else if (response.data) {
        stats = response.data;
      } else {
        stats = response;
      }

      // Map backend field names to frontend field names
      const mappedStats = {
        totalData: stats.totalProgram || 0,
        tercapai: stats.totalDone || 0,
        progress: stats.totalProgress || 0,
        belumLapor: stats.totalBelum || 0,
        totalRO: stats.totalRO || 0,
        totalProgram: stats.totalProgram || 0,
        totalDone: stats.totalDone || 0,
        totalProgress: stats.totalProgress || 0,
        totalBelum: stats.totalBelum || 0,
      };

      console.log("📊 Mapped stats:", mappedStats);
      setSummaryStats(mappedStats);
    } catch (error) {
      console.error("❌ Error fetching summary stats:", error);
      // ✅ Fixed: Calculate stats from local data as fallback
      const localStats = calculateLocalStats(data);
      console.log("📊 Using local stats:", localStats);
      setSummaryStats(localStats);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKLList();
    fetchSummaryStats();
  }, [currentPage, searchTerm, filterKL, filterStatus]);

  // Reset ke halaman 1 jika filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKL, itemsPerPage]);

  // ✅ Fixed: Update stats when data changes
  useEffect(() => {
    if (data.length > 0) {
      const localStats = calculateLocalStats(data);
      console.log("📊 Updated local stats from data:", localStats);
      setSummaryStats(localStats);
    }
  }, [data]);

  const handleSave = async (itemData) => {
    try {
      setLoading(true);
      let response;

      if (editingItem) {
        response = await apiService.updateRanPaud(editingItem._id, itemData);
        console.log("✅ Updated RAN PAUD:", response);
      } else {
        response = await apiService.createRanPaud(itemData);
        console.log("✅ Created RAN PAUD:", response);
      }

      setShowForm(false);
      setEditingItem(null);
      setActiveTab('ran-paud-data');
      fetchData();
      fetchSummaryStats();
    } catch (error) {
      console.error("❌ Error saving data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      setLoading(true);
      await apiService.deleteRanPaud(item._id);
      console.log("✅ Deleted RAN PAUD:", item._id);
      fetchData();
      fetchSummaryStats();
    } catch (error) {
      console.error("❌ Error deleting data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map((item) => item._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedItems.size} data yang dipilih?`
      )
    )
      return;

    try {
      setLoading(true);
      await apiService.bulkRanPaudOperation({
        action: "delete",
        itemIds: Array.from(selectedItems),
      });

      setSelectedItems(new Set());
      fetchData();
      fetchSummaryStats();
    } catch (error) {
      console.error("❌ Error bulk delete:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    if (activeTab === 'ran-paud-data-add') {
      setActiveTab('ran-paud-data');
    }
  };

  // Status management functions
  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await apiService.updateRanPaudStatus(itemId, newStatus);
      
      // Update local data
      setData(prevData => 
        prevData.map(item => 
          item._id === itemId 
            ? { ...item, status: newStatus }
            : item
        )
      );
      
      console.log("✅ Status updated successfully");
    } catch (error) {
      console.error("❌ Error updating status:", error);
      setError(error.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedItems.size === 0) {
      setError("Pilih data yang akan diubah statusnya");
      return;
    }

    try {
      setStatusUpdateLoading(true);
      const ids = Array.from(selectedItems);
      await apiService.bulkUpdateRanPaudStatus(ids, selectedStatus);
      
      // Update local data
      setData(prevData => 
        prevData.map(item => 
          selectedItems.has(item._id)
            ? { ...item, status: selectedStatus }
            : item
        )
      );
      
      // Clear selection
      setSelectedItems(new Set());
      setShowStatusModal(false);
      
      console.log("✅ Bulk status update completed");
    } catch (error) {
      console.error("❌ Error updating bulk status:", error);
      setError(error.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "text-gray-600 bg-gray-100 border-gray-200";
      case "submitted":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "approved":
        return "text-green-600 bg-green-100 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getKategoriColor = (kategori) => {
    switch (kategori) {
      case "TERCAPAI":
        return "text-green-600 bg-green-100 border-green-200";
      case "TIDAK TERCAPAI":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const calculateAverageAchievement = (tahunData) => {
    if (!Array.isArray(tahunData) || tahunData.length === 0) return 0;

    let total = 0;
    let count = 0;

    for (const entry of tahunData) {
      if (entry && entry.persentase !== null && entry.persentase !== undefined) {
        const val = safeNum(entry.persentase);
        if (Number.isFinite(val)) {
          total += val;
          count += 1;
        }
      }
    }

    if (count === 0) return 0;
    return Math.round(total / count);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    return typeof num === "number" ? num.toLocaleString() : num;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getYearDisplay = (item, type) => {
    if (type === 'target') return item.indikators?.[0]?.targetSatuan || item.targetSatuan || "-";
    if (type === 'ro') return getTotalRO(item);
    return "-";
  };

  if (showForm) {
    return (
      <RanPaudForm
        item={editingItem}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen p-4 md:px-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Manajemen Data RAN PAUDHI
              </h2>
              <p className="text-[14px] text-gray-500 mt-0.5">
                Kelola data RAN PAUD Holistik Integratif
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Debug button hidden in production */}
            {/* Status Management Buttons - Super Admin Only - HIDDEN */}
            {/* {hasRole("super_admin") && (
              <>
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-200 shadow-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Ubah Status ({selectedItems.size})
                  </button>
                )}
              </>
            )} */}
            
            {/* Tombol Tambah Data dipindahkan ke Sidebar */}
          </div>
        </div>
      </div>

      {/* Summary Stats HIDDEN */}
      {/* (disembunyikan sesuai permintaan) */}

      {/* Filters and Search */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-80 lg:w-96">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari K/L atau Program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {/* Items per page selector removed per request (fixed 25 per halaman) */}
            <select
              value={filterKL}
              onChange={(e) => setFilterKL(e.target.value)}
              className="px-3 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[200px] text-gray-700"
            >
              <option value="">Semua K/L</option>
              {/* ✅ Fixed: Ensure klList is always an array before mapping */}
              {Array.isArray(klList) && klList.length > 0 ? (
                klList.map((kl) => (
                  <option key={kl.id} value={kl.id}>
                    {kl.name}
                  </option>
                ))
              ) : (
                // Fallback options if klList is empty or not an array
                <>
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
                </>
              )}
            </select>

            {/* Status filter HIDDEN */}
            {/* <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select> */}

            {selectedItems.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 h-9 text-[14px] bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1.5 transition-all duration-200 shadow-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Hapus ({selectedItems.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Tidak ada data ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f9fa] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 w-12 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === data.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-4 py-2 w-48 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    K/L
                  </th>
                  <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    Program
                  </th>
                  <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    Indikator
                  </th>
                  <th className="px-4 py-2 w-32 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    Target/Satuan
                  </th>
                  <th className="px-4 py-2 w-20 text-center text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    RO
                  </th>
                  {/* Achievement column HIDDEN */}
                  {false && (
                    <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                      Achievement
                    </th>
                  )}
                  {/* Status column HIDDEN */}
                  {/* <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    Status
                  </th> */}
                  <th className="px-4 py-2 w-24 text-center text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-4 py-2 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="flex flex-col gap-1.5 mt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 flex-shrink-0 bg-blue-500 rounded flex items-center justify-center shadow-sm">
                            <Building className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[14px] font-medium text-gray-800 leading-tight line-clamp-2">
                            {item.klName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top pt-2.5">
                      <p className="text-[14px] text-gray-900 font-medium leading-tight">
                        {item.program}
                      </p>
                    </td>
                    <td className="px-4 py-2 align-top pt-2.5">
                      <p className="text-[14px] text-gray-700 leading-tight">
                        {item.indikators && item.indikators.length > 0
                          ? item.indikators[0].indikator
                          : item.indikator || "N/A"}
                      </p>
                      {item.indikators && item.indikators.length > 1 && (
                        <p className="text-[12px] text-blue-600 font-bold mt-1">
                          +{item.indikators.length - 1} indikator lainnya
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top pt-2.5">
                      <p className="text-[14px] text-gray-800 font-medium">
                        {getYearDisplay(item, 'target')}
                      </p>
                    </td>
                    <td className="px-4 py-2 align-top pt-2 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-blue-100 text-blue-800">
                        {getYearDisplay(item, 'ro')}
                      </span>
                    </td>
                    {/* Achievement cell HIDDEN */}
                    {false && (
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{
                                width: `${calculateAverageAchievement(
                                  item.indikators && item.indikators.length > 0
                                    ? item.indikators[0].tahunData
                                    : item.tahunData
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {calculateAverageAchievement(
                              item.indikators && item.indikators.length > 0
                                ? item.indikators[0].tahunData
                                : item.tahunData
                            )}
                            %
                          </span>
                        </div>
                      </td>
                    )}
                    {/* Status column HIDDEN */}
                    {/* <td className="px-4 py-2">
                      {hasRole("super_admin") ? (
                        <div className="relative">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                            disabled={statusUpdateLoading}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border border-gray-300 cursor-pointer ${getStatusColor(
                              item.status
                            )} ${statusUpdateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border border-gray-300 ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      )}
                    </td> */}
                    <td className="px-4 py-2 align-top pt-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[14px] text-gray-600 font-medium whitespace-nowrap">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
              <span className="ml-2 text-gray-400 font-normal">(Halaman {currentPage} dari {totalPages})</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[14px] border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium text-gray-700"
              >
                Sebelumnya
              </button>
              {/* Page numbers (max 7 buttons) */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 4), Math.max(0, currentPage - 4) + 7)
                  .map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 text-[14px] rounded-md transition-all duration-200 ${currentPage === pageNum ? 'bg-blue-600 text-white border border-blue-600 shadow-sm' : 'border border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                <span className="px-2 text-[14px] text-gray-400">/ {totalPages}</span>
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[14px] border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-medium text-gray-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Management Modal - HIDDEN */}
      {/* {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Ubah Status Data
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Status Baru
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{selectedItems.size} data</strong> akan diubah statusnya menjadi{" "}
                  <strong className="capitalize">{selectedStatus}</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={statusUpdateLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                >
                  {statusUpdateLoading ? "Mengubah..." : "Ubah Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default RanPaudManagement;
