// src/components/Feedback/FeedbackAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Loader2,
  Inbox,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Bug,
  Brain,
  Lightbulb,
  HelpCircle,
  Database,
  Cpu,
  MoreHorizontal,
  Clock,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

// ─── Category config ───
const CATEGORY_MAP = {
  bug: { label: 'Bug / Error', icon: Bug, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  ai_assistant: { label: 'AI Assistant', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  tampilan: { label: 'Tampilan Website', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  kesulitan: { label: 'Kesulitan Penggunaan', icon: HelpCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  data: { label: 'Data Tidak Sesuai', icon: Database, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  fitur: { label: 'Usulan Fitur', icon: Lightbulb, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  performa: { label: 'Performa Sistem', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  lainnya: { label: 'Lainnya', icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

// ─── Category Badge ───
const CategoryBadge = ({ category }) => {
  const cat = CATEGORY_MAP[category] || CATEGORY_MAP.lainnya;
  const Icon = cat.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.bg} ${cat.color} ${cat.border} border`}>
      <Icon className="w-3 h-3" />
      {cat.label}
    </span>
  );
};

// ─── Format date ───
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Skeleton Row ───
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
    <td className="px-4 py-4"><div className="h-5 bg-gray-200 rounded-full w-28" /></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded w-16" /></td>
  </tr>
);

// ─── Detail Modal ───
const DetailModal = ({ feedback, onClose }) => {
  if (!feedback) return null;
  const DeviceIcon = DEVICE_ICONS[feedback.device_type] || Monitor;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detail Feedback</h3>
                <p className="text-xs text-gray-400">ID: #{feedback.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Category + Date */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CategoryBadge category={feedback.category} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(feedback.created_at)}
              </span>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Judul</label>
              <p className="text-base font-semibold text-gray-900 mt-1">{feedback.title}</p>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pesan</label>
              <div className="mt-1 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {feedback.message}
              </div>
            </div>

            {/* Screenshot */}
            {feedback.screenshot_url && (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Screenshot
                </label>
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={feedback.screenshot_url}
                    alt="Feedback screenshot"
                    className="w-full max-h-64 object-contain bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* System Info */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Info Sistem</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {feedback.page_url && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{feedback.page_url}</span>
                  </div>
                )}
                {feedback.browser && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {feedback.browser}
                  </div>
                )}
                {feedback.device_type && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    <DeviceIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {feedback.device_type.charAt(0).toUpperCase() + feedback.device_type.slice(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Delete Confirmation Modal ───
const DeleteModal = ({ feedback, onClose, onConfirm, isDeleting }) => {
  if (!feedback) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Feedback?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Feedback "<span className="font-medium">{feedback.title}</span>" akan dihapus permanen.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════
// ─── Main FeedbackAdmin Component ───
// ═══════════════════════════════════════════════
const FeedbackAdmin = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Build API URL ───
  const getApiUrl = () => {
    let url = API_BASE_URL;
    if (!url.endsWith('/api')) url += '/api';
    return url;
  };

  // ─── Fetch feedback ───
  const fetchFeedback = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${getApiUrl()}/feedback?${params}`);
      const data = await res.json();

      if (data.success) {
        setFeedbackList(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Fetch feedback error:', err);
      showToast('error', 'Gagal memuat data feedback.');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchQuery]);

  useEffect(() => {
    fetchFeedback(1);
  }, [fetchFeedback]);

  // ─── Delete handler ───
  const handleDelete = async () => {
    if (!deleteFeedback) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${getApiUrl()}/feedback/${deleteFeedback.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast('success', 'Feedback berhasil dihapus.');
        setDeleteFeedback(null);
        fetchFeedback(pagination.page);
      } else {
        showToast('error', 'Gagal menghapus feedback.');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Search debounce ───
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen p-4 md:px-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[60] max-w-sm px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Umpan Balik Pengguna
              </h2>
              <p className="text-[14px] text-gray-500 mt-0.5">
                Kelola dan monitoring feedback dari pengguna
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Feedback', value: pagination.total, color: 'text-gray-900', bg: 'bg-gray-100', icon: Inbox },
          { label: 'Bug Report', value: feedbackList.filter(f => f.category === 'bug').length, color: 'text-red-600', bg: 'bg-red-50', icon: Bug },
          { label: 'Usulan Fitur', value: feedbackList.filter(f => f.category === 'fitur').length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Lightbulb },
          { label: 'AI Assistant', value: feedbackList.filter(f => f.category === 'ai_assistant').length, color: 'text-purple-600', bg: 'bg-purple-50', icon: Brain },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-500 font-medium">{stat.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 md:max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul atau pesan..."
              className="w-full pl-9 pr-3 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-9 pr-8 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer min-w-[180px] text-gray-700 bg-white"
            >
              <option value="all">Semua Kategori</option>
              {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-gray-200">
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight w-12">#</th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">Kategori</th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">Judul</th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight hidden md:table-cell">Device</th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight hidden lg:table-cell">Browser</th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">Tanggal</th>
                <th className="px-4 py-2 text-center text-[12px] font-bold text-gray-500 uppercase tracking-tight w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <Inbox className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-gray-700">Belum ada feedback</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          {searchQuery || filterCategory !== 'all' ? 'Coba ubah filter pencarian' : 'Feedback pengguna akan muncul di sini'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbackList.map((fb, idx) => {
                  const DeviceIcon = DEVICE_ICONS[fb.device_type] || Monitor;
                  return (
                    <motion.tr
                      key={fb.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-2.5 align-top pt-3 text-gray-400 text-[11px] font-mono">{fb.id}</td>
                      <td className="px-4 py-2.5 align-top pt-3"><CategoryBadge category={fb.category} /></td>
                      <td className="px-4 py-2.5 align-top pt-3">
                        <p className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-1 max-w-[250px]">{fb.title}</p>
                        <p className="text-[12px] text-gray-500 line-clamp-1 max-w-[250px] mt-0.5">{fb.message}</p>
                      </td>
                      <td className="px-4 py-2.5 align-top pt-3 hidden md:table-cell">
                        <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
                          <DeviceIcon className="w-3.5 h-3.5" />
                          {fb.device_type ? fb.device_type.charAt(0).toUpperCase() + fb.device_type.slice(1) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 align-top pt-3 hidden lg:table-cell text-[12px] text-gray-600">{fb.browser || '-'}</td>
                      <td className="px-4 py-2.5 align-top pt-3 text-[12px] text-gray-600 whitespace-nowrap">{formatDate(fb.created_at)}</td>
                      <td className="px-4 py-2.5 align-top pt-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedFeedback(fb)}
                            className="p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded transition-colors"
                            title="Lihat detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteFeedback(fb)}
                            className="p-1 text-red-600 hover:bg-red-50 hover:text-red-800 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Menampilkan {feedbackList.length} dari {pagination.total} feedback
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchFeedback(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchFeedback(pageNum)}
                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => fetchFeedback(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <DetailModal feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteFeedback && (
          <DeleteModal
            feedback={deleteFeedback}
            onClose={() => setDeleteFeedback(null)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackAdmin;
