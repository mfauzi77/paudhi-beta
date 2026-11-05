// components/Admin/ManageNews.jsx - Updated for SISMONEV PAUDHI

import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, User, Tag, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../pages/contexts/AuthContext";
import apiService from "../../utils/apiService";
import NewsForm from "./NewsForm";
import ImageWithFallback from "../common/ImageWithFallback";

const ManageNews = () => {
  const { user, hasRole } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formMode, setFormMode] = useState("add");

  // Fetch news data
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching news from backend...");
      
      const response = await apiService.request("/news/admin");
      console.log("📡 Backend response:", response);
      
      if (response && response.success) {
        console.log("✅ News fetched successfully:", response.data);
        setNews(response.data || []);
      } else {
        console.error("❌ Backend response not successful:", response);
        setNews([]);
      }
    } catch (error) {
      console.error("❌ Error fetching news:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Don't use dummy data, show empty state instead
      setNews([]);
      alert("Gagal mengambil data berita dari server. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = () => {
    setFormMode("add");
    setEditingNews(null);
    setShowNewsForm(true);
  };

  const handleEditNews = (newsItem) => {
    setFormMode("edit");
    setEditingNews(newsItem);
    setShowNewsForm(true);
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      try {
        await apiService.request(`/news/${id}`, { method: 'DELETE' });
        setNews(news.filter((item) => (item._id || item.id) !== id));
        alert("Berita berhasil dihapus.");
      } catch (error) {
        console.error("Error deleting news:", error);
        alert("Gagal menghapus berita.");
      }
    }
  };

  const handlePublishNews = async (newsId) => {
    try {
      const response = await apiService.request(`/news/${newsId}/publish`, {
        method: 'POST'
      });
      
      if (response.success) {
        setNews(news.map(item => 
          (item._id || item.id) === newsId 
            ? { ...item, status: 'publish' }
            : item
        ));
        alert("Berita berhasil dipublish!");
      }
    } catch (error) {
      console.error("Error publishing news:", error);
      alert("Gagal mempublish berita.");
    }
  };

  const handleReturnToDraft = async (newsId) => {
    try {
      const response = await apiService.request(`/news/${newsId}/return-draft`, {
        method: 'POST'
      });
      
      if (response.success) {
        setNews(news.map(item => 
          (item._id || item.id) === newsId 
            ? { ...item, status: 'draft' }
            : item
        ));
        alert("Berita berhasil dikembalikan ke draft!");
      }
    } catch (error) {
      console.error("Error returning news to draft:", error);
      alert("Gagal mengembalikan berita ke draft.");
    }
  };

  const handleNewsSave = (savedNews) => {
    console.log("💾 Handling news save:", savedNews);
    console.log("📝 Current news array:", news);
    
    if (formMode === "edit") {
      // Update existing news
      const updatedNews = news.map(item => 
        (item._id || item.id) === (savedNews._id || savedNews.id) ? savedNews : item
      );
      console.log("🔄 Updated news array:", updatedNews);
      setNews(updatedNews);
    } else {
      // Add new news - ensure proper structure
      const newNewsItem = {
        _id: savedNews._id || savedNews.id,
        title: savedNews.title,
        content: savedNews.content,
        excerpt: savedNews.excerpt,
        status: savedNews.status || 'draft',
        image: savedNews.image,
        author: savedNews.author || { fullName: 'Current User', role: 'admin' },
        createdAt: savedNews.createdAt || new Date(),
        isActive: true
      };
      
      console.log("➕ Adding new news item:", newNewsItem);
      setNews([newNewsItem, ...news]);
    }
    
    setShowNewsForm(false);
    setEditingNews(null);
    
    // Refresh the news list to ensure consistency
    setTimeout(() => {
      fetchNews();
    }, 1000);
  };

  const handleNewsCancel = () => {
    setShowNewsForm(false);
    setEditingNews(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-yellow-100 text-yellow-800", label: "Draft" },
      publish: { color: "bg-green-100 text-green-800", label: "Publish" }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAuthorDisplay = (author) => {
    if (!author) return 'Unknown';
    
    if (author.role === 'super_admin') {
      return 'Super Admin';
    } else if (author.role === 'admin_kl' && author.klName) {
      return `${author.klName} Admin`;
    } else if (author.role === 'admin') {
      return 'Admin';
    } else {
      return author.fullName || 'User';
    }
  };

  const getSourceDisplay = (newsItem) => {
    // Show source (K/L identity) if available
    if (newsItem.source) {
      return newsItem.source;
    } else if (newsItem.author?.klName) {
      return newsItem.author.klName;
    }
    return null;
  };

  return (
    <DashboardLayout pageTitle="Manajemen Berita">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-700">Total Berita: {news.length}</h3>
          <button
            onClick={fetchNews}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            title="Refresh data berita"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {hasRole(["super_admin", "admin_kl"]) && (
          <button
            onClick={handleAddNews}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Tambah Berita Baru
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat berita...</span>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada berita</h3>
            <p className="text-gray-500 mb-4">Mulai dengan membuat berita pertama Anda</p>
            <button
              onClick={handleAddNews}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Buat Berita Pertama
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <div key={item._id || item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <ImageWithFallback
                  src={item.image && typeof item.image === 'object' ? item.image.url : item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  fallbackClassName="h-full"
                  fallbackText="Tidak ada gambar"
                  hoverEffect={false}
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {item.excerpt || (item.content ? item.content.substring(0, 120) + "..." : "Tidak ada konten")}
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-2" />
                    {getAuthorDisplay(item.author)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(item.createdAt || item.date).toLocaleDateString('id-ID')}
                  </div>
                  
                  {/* K/L Source Display */}
                  {getSourceDisplay(item) && (
                    <div className="text-sm text-blue-600 font-medium">
                      Sumber: {getSourceDisplay(item)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {hasRole(["super_admin", "admin_kl"]) && (
                      <button
                        onClick={() => handleEditNews(item)}
                        className="text-indigo-600 hover:text-indigo-900 transition p-2"
                        title="Edit Berita"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Publish/Draft Toggle - Only for Superadmin */}
                    {hasRole(["super_admin"]) && (
                      <button
                        onClick={() => item.status === 'publish' 
                          ? handleReturnToDraft(item._id || item.id) 
                          : handlePublishNews(item._id || item.id)
                        }
                        className={`p-2 transition ${
                          item.status === 'publish' 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={item.status === 'publish' ? 'Kembalikan ke Draft' : 'Publish Berita'}
                      >
                        {item.status === 'publish' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {hasRole(["super_admin", "admin_kl"]) && (
                    <button
                      onClick={() => handleDeleteNews(item._id || item.id)}
                      className="text-red-600 hover:text-red-900 transition p-2"
                      title="Hapus Berita"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Form Modal */}
      {showNewsForm && (
        <NewsForm
          news={editingNews}
          mode={formMode}
          onSave={handleNewsSave}
          onCancel={handleNewsCancel}
        />
      )}
    </DashboardLayout>
  );
};

export default ManageNews;
