// components/NewsManagement.jsx - Updated for SISMONEV PAUDHI
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../../utils/apiService';
import NewsFormModal from './NewsFormModal';
import { useToast } from '../../components/ToastContext';
import { useAuth } from '../../pages/contexts/AuthContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const NewsManagement = () => {
  const { user, hasRole } = useAuth();
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const { success, error, loading } = useToast();

  // Form state sederhana
  const [newsForm, setNewsForm] = useState({
    title: '',
    excerpt: '',
    content: '', // Use content instead of fullContent
    image: null
  });

  // Test connection dan fetch news
  useEffect(() => {
    testConnectionAndFetchNews();
  }, []);

  const testConnectionAndFetchNews = async () => {
    try {
      console.log('Testing connection...');
      const connectionTest = await apiService.testConnection();
      
      if (connectionTest.success) {
        setConnectionStatus('connected');
        await fetchNews();
      } else {
        setConnectionStatus('disconnected');
        error('Tidak dapat terhubung ke server: ' + connectionTest.message);
      }
    } catch (err) {
      console.error('Connection test error:', err);
      setConnectionStatus('disconnected');
      error('Tidak dapat terhubung ke server.');
    }
  };

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      console.log("🔄 Fetching news...");
      console.log("👤 Current user:", user);
      console.log("🔑 User role:", user?.role);
      console.log("🔐 Auth token exists:", !!apiService.token);
      
      const response = await apiService.getNews({ status: 'all' });
      console.log("📡 API Response:", response);
      
      // Handle berbagai struktur response
      if (Array.isArray(response)) {
        console.log("✅ Response is array, length:", response.length);
        setNews(response);
      } else if (response?.news && Array.isArray(response.news)) {
        console.log("✅ Response has news array, length:", response.news.length);
        setNews(response.news);
      } else if (response?.data && Array.isArray(response.data)) {
        console.log("✅ Response has data array, length:", response.data.length);
        setNews(response.data);
      } else {
        console.log("❌ No valid news data found in response");
        setNews([]);
      }
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setNews([]);
      if (err.message.includes('Koneksi ke server gagal')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setNewsLoading(false);
    }
  };

  // Filter news
  const filteredNews = news.filter(item => {
    if (!item) return false;
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setNewsForm({
      title: '',
      excerpt: '',
      content: '', // Use content instead of fullContent
      image: null
    });
    setEditingNews(null);
    setShowCreateForm(false);
  };

  // Handle image upload menggunakan apiService yang ada
  const handleImageUpload = async (imageData, newsTitle) => {
    if (!imageData?.file) return imageData;
    
    try {
      loading('Mengupload gambar...');
      console.log('Uploading image:', imageData.file.name);
      
      // Upload ke server menggunakan method yang sudah ada di apiService
      const uploadResult = await apiService.uploadImage(imageData.file, {
        alt: imageData.alt || newsTitle,
        caption: imageData.caption || '',
        category: 'news'
      });

      success('Gambar berhasil diupload!');

      return {
        url: uploadResult.url || uploadResult.imageUrl,
        alt: imageData.alt || newsTitle,
        caption: imageData.caption || ''
      };
    } catch (err) {
      console.error('Upload error:', err);
      error('Gagal mengupload gambar: ' + err.message);
      throw new Error('Gagal mengupload gambar: ' + err.message);
    }
  };

  // Create news
  const handleCreateNews = async (newsData) => {
    try {
      setFormLoading(true);
      console.log("📝 Creating news with data:", newsData);
      console.log("🖼️ Image data details:", {
        image: newsData.image,
        imageType: typeof newsData.image,
        isFile: newsData.image instanceof File,
        isObject: typeof newsData.image === 'object',
        hasFile: newsData.image?.file instanceof File,
        hasUrl: newsData.image?.url,
        urlType: typeof newsData.image?.url
      });
      
      // Handle image upload if there's a file
      let imageUrl = null;
      if (newsData.image?.file instanceof File) {
        // Upload image first
        console.log('📤 Uploading image before creating news...');
        const imageData = await handleImageUpload(newsData.image, newsData.title);
        console.log('✅ Image uploaded, URL:', imageData?.url);
        // Extract URL from imageData object
        imageUrl = imageData?.url || imageData?.imageUrl || null;
      } else if (newsData.image?.url) {
        // Already has URL (from previous upload or existing)
        imageUrl = newsData.image.url;
        console.log('✅ Using existing image URL:', imageUrl);
      } else if (typeof newsData.image === 'string' && newsData.image) {
        // Image is already a URL string
        imageUrl = newsData.image;
        console.log('✅ Using image URL string:', imageUrl);
      }
      
      // Prepare data for API - use standardized content field
      const apiData = {
        title: newsData.title?.trim() || '',
        excerpt: newsData.excerpt?.trim() || '',
        content: newsData.content?.trim() || '', // Use content field directly
        status: 'draft', // Always draft for new news
        image: imageUrl // Use URL string (or null)
      };
      
      console.log("📋 API data after mapping:", apiData);
      console.log("🖼️ Final image data:", {
        image: apiData.image,
        imageType: typeof apiData.image,
        isFile: apiData.image instanceof File,
        isObject: typeof apiData.image === 'object',
        hasFile: apiData.image?.file instanceof File,
        hasUrl: apiData.image?.url,
        urlType: typeof apiData.image?.url
      });
      
      // Ensure content is not empty
      if (!apiData.content.trim()) {
        throw new Error('Konten berita tidak boleh kosong. Pastikan field "Konten Lengkap" diisi.');
      }
      
      console.log("📤 Sending to API:", apiData);
      
      const response = await apiService.createNews(apiData);
      
      if (response.success) {
        console.log("✅ News created successfully:", response.data);
        success('Berita berhasil dibuat!');
        resetForm();
        fetchNews(); // Refresh the news list
      } else {
        console.error("❌ News creation failed:", response.message);
        error(response.message || "Gagal membuat berita");
      }
    } catch (err) {
      console.error("❌ Create news error:", err);
      const errorMessage = err?.message || "Gagal membuat berita";
      error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Update news
  const handleUpdateNews = async (formData) => {
    try {
      setFormLoading(true);

      if (!editingNews?._id) {
        throw new Error('ID berita tidak valid');
      }

      // Handle image data for updates
      let imageData = null;
      
      if (formData.image?.file) {
        // New image uploaded
        console.log('New image uploaded, processing...');
        imageData = await handleImageUpload(formData.image, formData.title);
      } else if (formData.image && !formData.image.file) {
        // Existing image kept (no new file, but image data exists)
        console.log('Keeping existing image:', formData.image);
        imageData = formData.image;
      } else if (formData.image === null) {
        // Image removed
        console.log('Image removed');
        imageData = null;
      }
      // If formData.image is undefined, keep the existing image (don't change it)

      // Prepare data for API
      const newsData = {
        title: formData.title?.trim() || '',
        excerpt: formData.excerpt?.trim() || '',
        content: formData.content?.trim() || '', // Use content field directly
        // keep existing status unless explicitly changed via publish/draft endpoints
        image: imageData
      };
      
      // Ensure content is not empty
      if (!newsData.content.trim()) {
        throw new Error('Konten berita tidak boleh kosong');
      }

      console.log('Updating news:', editingNews._id, newsData);
      const response = await apiService.updateNews(editingNews._id, newsData);

      if (response.success) {
        await fetchNews(); // Refresh list
        resetForm();
        success('Berita berhasil diupdate!');
      } else {
        error(response.message || 'Gagal mengupdate berita');
      }

    } catch (err) {
      console.error('Update news error:', err);
      error('Gagal mengupdate berita: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Publish news (superadmin only)
  const handlePublishNews = async (newsId) => {
    try {
      const response = await apiService.request(`/news/${newsId}/publish`, {
        method: 'POST'
      });
      
      if (response.success) {
        setNews(prevNews => prevNews.map(item => 
          item._id === newsId 
            ? { ...item, status: 'publish' }
            : item
        ));
        success('Berita berhasil dipublish!');
        // Refresh from server to ensure consistency (includes publishedAt)
        await fetchNews();
      } else {
        error(response.message || 'Gagal mempublish berita');
      }
    } catch (err) {
      console.error('Publish news error:', err);
      error('Gagal mempublish berita: ' + err.message);
    }
  };

  // Return to draft (superadmin only)
  const handleReturnToDraft = async (newsId) => {
    try {
      const response = await apiService.request(`/news/${newsId}/return-draft`, {
        method: 'POST'
      });
      
      if (response.success) {
        setNews(prevNews => prevNews.map(item => 
          item._id === newsId 
            ? { ...item, status: 'draft' }
            : item
        ));
        success('Berita berhasil dikembalikan ke draft!');
        // Refresh from server to ensure consistency
        await fetchNews();
      } else {
        error(response.message || 'Gagal mengembalikan berita ke draft');
      }
    } catch (err) {
      console.error('Return to draft error:', err);
      error('Gagal mengembalikan berita ke draft: ' + err.message);
    }
  };

  // Delete news
  const handleDeleteNews = async (id) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) {
      return;
    }
    
    try {
      await apiService.deleteNews(id);
      setNews(prevNews => prevNews.filter(item => item._id !== id));
      success('Berita berhasil dihapus!');
    } catch (err) {
      console.error('Delete news error:', err);
      error('Gagal menghapus berita: ' + err.message);
    }
  };

  // Open forms
  const openCreateForm = () => {
    resetForm();
    setShowCreateForm(true);
  };

  const openEditForm = (newsItem) => {
    setNewsForm({
      title: newsItem.title || '',
      excerpt: newsItem.excerpt || '',
      content: newsItem.content || '', // Use content instead of fullContent
      image: newsItem.image || null
    });
    setEditingNews(newsItem);
    setShowCreateForm(true);
  };

  // Handle save
  const handleSave = (formData) => {
    if (editingNews) {
      handleUpdateNews(formData);
    } else {
      handleCreateNews(formData);
    }
  };

  // Get source display
  const getSourceDisplay = (newsItem) => {
    if (newsItem.source) {
      return newsItem.source;
    } else if (newsItem.author?.klName) {
      return newsItem.author.klName;
    }
    return null;
  };

  // Connection Status Component
  const ConnectionStatus = () => {
    if (connectionStatus === 'checking') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
            <span className="text-yellow-800">Memeriksa koneksi...</span>
          </div>
        </div>
      );
    }
    
    if (connectionStatus === 'disconnected') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-800">Tidak dapat terhubung ke server</span>
            </div>
            <button 
              onClick={testConnectionAndFetchNews}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-800">Terhubung ke server</span>
        </div>
      </div>
    );
  };

  if (newsLoading && connectionStatus === 'checking') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Berita</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Memuat berita...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm p-6 w-fit">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Manajemen Berita ({news.length})
        </h2>
        <button 
          onClick={openCreateForm}
          disabled={connectionStatus !== 'connected'}
          className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Berita
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-start">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="publish">Publish</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Gambar</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Judul</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Sumber</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Tanggal</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Views</th>
              <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredNews.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative group">
                    <ImageWithFallback
                      src={item.image?.url || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      fallbackClassName="w-full h-full"
                      fallbackText=""
                      fallbackIcon={true}
                      hoverEffect={true}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-gray-900 max-w-xl lg:max-w-2xl truncate">{item.title}</div>
                  <div className="text-[10px] text-gray-500 max-w-xl lg:max-w-2xl truncate">{item.excerpt}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                    item.status === 'publish' ? 'bg-green-100 text-green-800' :
                    item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {getSourceDisplay(item) || '-'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {item.publishedAt || item.createdAt ? 
                    new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID') : 
                    '-'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{item.views || 0}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditForm(item)}
                      className="text-green-600 hover:text-green-800" 
                      title="Edit"
                      disabled={connectionStatus !== 'connected'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Publish/Draft Toggle - Only for Superadmin */}
                    {hasRole(["super_admin"]) && (
                      <button 
                        onClick={() => item.status === 'publish' 
                          ? handleReturnToDraft(item._id) 
                          : handlePublishNews(item._id)
                        }
                        className={`${
                          item.status === 'publish' 
                            ? 'text-yellow-600 hover:text-yellow-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={item.status === 'publish' ? 'Kembalikan ke Draft' : 'Publish'}
                        disabled={connectionStatus !== 'connected'}
                      >
                        {item.status === 'publish' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteNews(item._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus"
                      disabled={connectionStatus !== 'connected'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredNews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tidak ada berita yang sesuai filter' 
                : 'Belum ada berita. Klik "Tambah Berita" untuk mulai.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreateForm && (
        <NewsFormModal
          editingNews={editingNews}
          newsForm={newsForm}
          formLoading={formLoading}
          connectionStatus={connectionStatus}
          onSave={handleSave}
          onCancel={resetForm}
        />
      )}
    </div>
  );
};

export default NewsManagement;