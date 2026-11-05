// components/Admin/NewsForm.jsx - Updated for SISMONEV PAUDHI

import React, { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Save, Plus } from "lucide-react";
import { useAuth } from "../../pages/contexts/AuthContext";
import apiService from "../../utils/apiService";

const NewsForm = ({ news = null, onSave, onCancel, mode = "add" }) => {
  const { user, hasRole } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: null,
    imagePreview: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (news && mode === "edit") {
      setFormData({
        title: news.title || "",
        content: news.content || "",
        excerpt: news.excerpt || "",
        image: null,
        imagePreview: news.image || ""
      });
    }
  }, [news, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Ukuran gambar maksimal 5MB" }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "File harus berupa gambar" }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageChange({ target: { files: [file] } });
      } else {
        setErrors(prev => ({ ...prev, image: "File harus berupa gambar" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Frontend validation should match backend validation
    if (!formData.title || typeof formData.title !== 'string' || !formData.title.trim()) {
      newErrors.title = "Judul berita tidak boleh kosong";
    }

    if (!formData.content || typeof formData.content !== 'string' || !formData.content.trim()) {
      newErrors.content = "Konten berita tidak boleh kosong";
    }

    if (!formData.excerpt || typeof formData.excerpt !== 'string' || !formData.excerpt.trim()) {
      newErrors.excerpt = "Ringkasan berita tidak boleh kosong";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('excerpt', formData.excerpt.trim());
      
      // Always set status to draft for new news
      formDataToSend.append('status', 'draft');
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (mode === "edit") {
        response = await apiService.request(`/news/${news.id}`, {
          method: 'PUT',
          body: formDataToSend,
          headers: {} // Let browser set content-type for FormData
        });
      } else {
        response = await apiService.request('/news', {
          method: 'POST',
          body: formDataToSend,
          headers: {} // Let browser set content-type for FormData
        });
      }

      if (response.success) {
        console.log("✅ News saved successfully:", response.data);
        onSave(response.data);
        alert(mode === "edit" ? "Berita berhasil diupdate!" : "Berita berhasil ditambahkan!");
      } else {
        console.error("❌ News save failed:", response);
        throw new Error(response.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error saving news:", error);
      alert(`Gagal ${mode === "edit" ? "mengupdate" : "menambahkan"} berita: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ""
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "edit" ? "Edit Berita" : "Tambah Berita Baru"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Berita <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan judul berita"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ringkasan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.excerpt ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan ringkasan berita (akan ditampilkan di preview)"
            />
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten Berita <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={8}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan konten lengkap berita"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <p className="text-sm text-blue-800">
                Berita yang Anda buat akan otomatis berstatus <strong>Draft</strong>. 
                Hanya Superadmin yang dapat mengubah status menjadi <strong>Publish</strong>.
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Berita
            </label>
            
            {/* Image Preview */}
            {formData.imagePreview && (
              <div className="mb-4 relative">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-lg"
                  title="Hapus gambar"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Preview
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                formData.imagePreview 
                  ? 'border-green-300 bg-green-50 hover:border-green-400' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  {formData.imagePreview ? (
                    <ImageIcon className="w-12 h-12 text-green-500 mb-2" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  )}
                  <p className={`text-sm font-medium ${
                    formData.imagePreview ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {formData.imagePreview 
                      ? "Klik untuk ganti gambar" 
                      : "Klik untuk upload gambar atau drag & drop"
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF maksimal 5MB
                  </p>
                  {formData.imagePreview && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Gambar siap diupload
                    </p>
                  )}
                </div>
              </label>
            </div>
            
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : mode === "edit" ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {loading ? "Menyimpan..." : mode === "edit" ? "Update Berita" : "Tambah Berita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;
