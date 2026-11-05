import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Download,
  Play,
  FileText,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Calendar,
  User,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
} from "lucide-react";
import apiService from "../../utils/apiService";
import { useAuth } from "../contexts/AuthContext";

// ===== FORM PEMBELAJARAN COMPONENT =====
const PembelajaranForm = ({ item, activeTab, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    author: "",
    ageGroup: "",
    aspect: "",
    tags: "",
    stakeholder: "",
    thumbnail: "",
    publishDate: new Date().toISOString().split("T")[0],
    isActive: true,
    // Panduan specific
    pages: "",
    pdfUrl: "",
    // Video specific
    youtubeId: "",
    duration: "",
    // Tools specific
    format: "",
    features: "",
    usage: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
        features: Array.isArray(item.features)
          ? item.features.join(", ")
          : item.features || "",
        publishDate: item.publishDate
          ? item.publishDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
      });

      if (item.thumbnail) {
        setThumbnailPreview(item.thumbnail);
      }
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const validation = apiService.validateImageFile(file);
      if (!validation.isValid) {
        alert("Error: " + validation.errors.join(", "));
        return;
      }

      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Judul wajib diisi";
    if (formData.title.length < 5) newErrors.title = "Judul minimal 5 karakter";

    if (!formData.description.trim())
      newErrors.description = "Deskripsi wajib diisi";
    if (formData.description.length < 10)
      newErrors.description = "Deskripsi minimal 10 karakter";

    if (!formData.category.trim()) newErrors.category = "Kategori wajib diisi";
    if (!formData.author.trim()) newErrors.author = "Author wajib diisi";

    // Type specific validation
    if (activeTab === "panduan") {
      if (!formData.pdfUrl.trim()) {
        newErrors.pdfUrl = "URL PDF wajib diisi";
      } else if (!apiService.isValidUrl(formData.pdfUrl)) {
        newErrors.pdfUrl = "URL PDF tidak valid";
      }

      if (formData.pages && (isNaN(formData.pages) || formData.pages < 1)) {
        newErrors.pages = "Jumlah halaman harus berupa angka positif";
      }
    }

    if (activeTab === "video") {
      if (!formData.youtubeId.trim()) {
        newErrors.youtubeId = "YouTube ID wajib diisi";
      } else if (!apiService.isValidYouTubeId(formData.youtubeId)) {
        newErrors.youtubeId = "YouTube ID tidak valid (contoh: dQw4w9WgXcQ)";
      }

      if (formData.duration && !apiService.isValidDuration(formData.duration)) {
        newErrors.duration = "Format durasi tidak valid (contoh: 25:32)";
      }
    }

    if (activeTab === "tools") {
      if (!formData.format.trim()) {
        newErrors.format = "Format wajib diisi";
      }
    }

    // Optional validations
    if (
      formData.thumbnail &&
      typeof formData.thumbnail === "string" &&
      !apiService.isValidUrl(formData.thumbnail)
    ) {
      newErrors.thumbnail = "URL thumbnail tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const processedData = {
        ...formData,
        type: activeTab,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        features: formData.features
          .split(",")
          .map((feature) => feature.trim())
          .filter((feature) => feature),
        pages:
          activeTab === "panduan" && formData.pages
            ? parseInt(formData.pages)
            : undefined,
      };

      // Auto-set YouTube thumbnail for video items
      if (activeTab === "video" && formData.youtubeId) {
        processedData.thumbnail = `https://img.youtube.com/vi/${formData.youtubeId}/mqdefault.jpg`;
      }

      // Handle thumbnail upload
      if (thumbnailFile) {
        try {
          const uploadResult = await apiService.uploadImage(thumbnailFile, {
            alt: formData.title,
            category: "pembelajaran",
          });
          processedData.thumbnail = uploadResult.url || uploadResult.imageUrl;
        } catch (uploadError) {
          console.warn("Thumbnail upload failed:", uploadError);
          // Continue without thumbnail rather than failing
        }
      }

      await onSave(processedData);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTabInfo = () => {
    const tabInfo = {
      panduan: { title: "Panduan Holistik", color: "blue", icon: FileText },
      video: { title: "Video Integratif", color: "red", icon: Play },
      tools: { title: "Tools & Assessment", color: "emerald", icon: Download },
    };
    return tabInfo[activeTab] || tabInfo.panduan;
  };

  const tabInfo = getTabInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100 my-8 text-sm">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-${tabInfo.color}-50 to-${tabInfo.color}-100`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r from-${tabInfo.color}-500 to-${tabInfo.color}-600 rounded-xl flex items-center justify-center`}
            >
              <tabInfo.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {item ? "Edit" : "Tambah"} {tabInfo.title}
              </h2>
              <p className="text-xs text-gray-600">
                Kelola konten pembelajaran PAUD Holistik Integratif
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(95vh-160px)]">
          <div className="space-y-4">
            {/* Informasi Dasar */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Informasi Dasar
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Judul *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-${
                      tabInfo.color
                    }-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan judul pembelajaran"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-${
                      tabInfo.color
                    }-500 ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Contoh: Buku Guru PAUD"
                  />
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Deskripsi *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-${
                    tabInfo.color
                  }-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Deskripsi detail tentang pembelajaran ini"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-${
                      tabInfo.color
                    }-500 ${
                      errors.author ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nama author/penulis"
                  />
                  {errors.author && (
                    <p className="text-red-500 text-sm mt-1">{errors.author}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Tanggal Publikasi
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleChange}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-${tabInfo.color}-500`}
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Upload - Only for non-video items */}
            {activeTab !== "video" && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Thumbnail
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Gambar Thumbnail
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maksimal 5MB. Format: JPEG, PNG, GIF, WebP
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Atau URL Thumbnail
                    </label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-${
                        tabInfo.color
                      }-500 ${errors.thumbnail ? "border-red-500" : ""}`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.thumbnail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.thumbnail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Type Specific Fields */}
            {activeTab === "panduan" && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Konten Panduan
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL PDF *
                    </label>
                    <input
                      type="url"
                      name="pdfUrl"
                      value={formData.pdfUrl}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.pdfUrl ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="https://example.com/file.pdf"
                    />
                    {errors.pdfUrl && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pdfUrl}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Halaman
                    </label>
                    <input
                      type="number"
                      name="pages"
                      value={formData.pages}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.pages ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="156"
                      min="1"
                    />
                    {errors.pages && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pages}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "video" && (
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-600" />
                  Konten Video
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube ID *
                    </label>
                    <input
                      type="text"
                      name="youtubeId"
                      value={formData.youtubeId}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.youtubeId ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="dQw4w9WgXcQ"
                    />
                    {errors.youtubeId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.youtubeId}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      ID dari URL YouTube: https://youtube.com/watch?v=
                      <strong>ID_DISINI</strong>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durasi
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.duration ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="25:32"
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.duration}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Format: MM:SS atau HH:MM:SS
                    </p>
                  </div>
                </div>

                {/* YouTube Preview */}
                {formData.youtubeId &&
                  apiService.isValidYouTubeId(formData.youtubeId) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview Video
                      </label>
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden max-w-md">
                        <img
                          src={`https://img.youtube.com/vi/${formData.youtubeId}/mqdefault.jpg`}
                          alt="Video preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
              </div>
            )}

            {activeTab === "tools" && (
              <div className="bg-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  Konten Tools
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format *
                    </label>
                    <input
                      type="text"
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.format ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="PDF Interaktif + Excel"
                    />
                    {errors.format && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.format}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Penggunaan
                    </label>
                    <input
                      type="text"
                      name="usage"
                      value={formData.usage}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Evaluasi bulanan perkembangan anak"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitur (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Milestone per aspek, Grafik perkembangan, Rekomendasi stimulasi"
                  />
                </div>
              </div>
            )}

            {/* Klasifikasi */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Klasifikasi
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Kelompok Usia
                  </label>
                  <select
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih kelompok usia</option>
                    <option value="0-2">0-2 tahun</option>
                    <option value="2-4">2-4 tahun</option>
                    <option value="4-6">4-6 tahun</option>
                    <option value="0-6">0-6 tahun</option>
                    <option value="all">Semua usia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspek Perkembangan
                  </label>
                  <select
                    name="aspect"
                    value={formData.aspect}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih aspek</option>
                    <option value="kognitif">Kognitif</option>
                    <option value="fisik">Fisik</option>
                    <option value="sosial-emosional">Sosial Emosional</option>
                    <option value="bahasa">Bahasa</option>
                    <option value="seni">Seni</option>
                    <option value="moral-agama">Moral Agama</option>
                    <option value="multi-aspek">Multi Aspek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stakeholder
                  </label>
                  <input
                    type="text"
                    name="stakeholder"
                    value={formData.stakeholder}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Guru & Orang Tua"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PAUD, Holistik, Bermain, Belajar"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Status
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  <span className="font-medium">Aktif</span> - pembelajaran akan
                  ditampilkan di website publik
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:border-gray-400 hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 bg-${tabInfo.color}-600 hover:bg-${tabInfo.color}-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {item ? "Update" : "Simpan"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN PEMBELAJARAN MANAGEMENT COMPONENT =====
const PembelajaranManagement = ({ activeTab, setActiveTab }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAspect, setFilterAspect] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedItems, setSelectedItems] = useState(new Set());

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchPembelajaran();
  }, [
    activeTab,
    pagination.page,
    searchTerm,
    filterCategory,
    filterAspect,
    sortBy,
    sortOrder,
  ]);

  const fetchPembelajaran = async () => {
    try {
      setLoading(true);
      const params = {
        type: activeTab,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      if (filterAspect) params.aspect = filterAspect;

      const response = await apiService.getPembelajaran(params);
      setData(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching pembelajaran:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        await apiService.updatePembelajaran(editingItem._id, itemData);
        alert("Pembelajaran berhasil diupdate!");
      } else {
        await apiService.createPembelajaran(itemData);
        alert("Pembelajaran berhasil dibuat!");
      }

      setShowForm(false);
      setEditingItem(null);
      fetchPembelajaran();
    } catch (error) {
      console.error("Error saving pembelajaran:", error);
      alert("Error: " + (error.message || "Gagal menyimpan pembelajaran"));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${item.title}"?`)) {
      try {
        await apiService.deletePembelajaran(item._id);
        alert("Pembelajaran berhasil dihapus!");
        fetchPembelajaran();
      } catch (error) {
        console.error("Error deleting pembelajaran:", error);
        alert("Error: " + (error.message || "Gagal menghapus pembelajaran"));
      }
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await apiService.togglePembelajaranStatus(item._id);
      alert(
        `Pembelajaran berhasil ${
          item.isActive ? "dinonaktifkan" : "diaktifkan"
        }!`
      );
      fetchPembelajaran();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Error: " + (error.message || "Gagal mengubah status"));
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
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
      window.confirm(`Hapus ${selectedItems.size} pembelajaran yang dipilih?`)
    ) {
      try {
        await apiService.bulkPembelajaranOperation({
          type: "delete",
          ids: Array.from(selectedItems),
        });
        alert("Pembelajaran berhasil dihapus!");
        setSelectedItems(new Set());
        fetchPembelajaran();
      } catch (error) {
        console.error("Error bulk delete:", error);
        alert("Error: " + (error.message || "Gagal menghapus pembelajaran"));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getTabInfo = () => {
    const tabInfo = {
      panduan: { title: "Panduan Holistik", icon: FileText, color: "blue" },
      video: { title: "Video Integratif", icon: Play, color: "red" },
      tools: { title: "Tools & Assessment", icon: Download, color: "emerald" },
    };
    return tabInfo[activeTab] || tabInfo.panduan;
  };

  const tabInfo = getTabInfo();
  const categories = [
    ...new Set(data.map((item) => item.category).filter(Boolean)),
  ];
  const aspects = [...new Set(data.map((item) => item.aspect).filter(Boolean))];

  const renderActionButtons = (item) => {
    switch (activeTab) {
      case "video":
        return null;
      case "panduan":
        return item.pdfUrl ? (
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
            title="Buka PDF"
          >
            <Eye className="w-3 h-3" />
            Lihat PDF
          </a>
        ) : null;
      case "tools":
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Kelola {tabInfo.title}
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm p-6 w-fit min-w-[1100px]">
      {/* Header */}
      <div
        className={`bg-gradient-to-r from-${tabInfo.color}-50 to-${tabInfo.color}-100 rounded-2xl p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 bg-${tabInfo.color}-500 rounded-xl flex items-center justify-center`}
            >
              <tabInfo.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Kelola {tabInfo.title}
              </h2>
              <p className="text-gray-600">
                Total: {pagination.total} pembelajaran • Halaman{" "}
                {pagination.page} dari {pagination.totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedItems.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus ({selectedItems.size})
              </button>
            )}

            <button
              onClick={() => setShowForm(true)}
              className={`bg-${tabInfo.color}-600 hover:bg-${tabInfo.color}-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-300 flex items-center gap-2`}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baru
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Search className="w-4 h-4" />
              Cari Pembelajaran
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari berdasarkan judul atau deskripsi..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Filter Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Aspek
            </label>
            <select
              value={filterAspect}
              onChange={(e) => setFilterAspect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Aspek</option>
              {aspects.map((aspect) => (
                <option key={aspect} value={aspect}>
                  {aspect}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urutkan
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Terbaru</option>
              <option value="createdAt-asc">Terlama</option>
              <option value="title-asc">Judul A-Z</option>
              <option value="title-desc">Judul Z-A</option>
              <option value="rating-desc">Rating Tertinggi</option>
              <option value="downloads-desc">Paling Populer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <tabInfo.icon className="w-16 h-16 text-gray-300" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterCategory || filterAspect
                    ? "Tidak ada data yang sesuai dengan filter"
                    : `Belum ada ${tabInfo.title.toLowerCase()}`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterCategory || filterAspect
                    ? "Coba ubah atau hapus filter pencarian"
                    : `Mulai dengan membuat ${tabInfo.title.toLowerCase()} pertama`}
                </p>
                {!searchTerm && !filterCategory && !filterAspect && (
                  <button
                    onClick={() => setShowForm(true)}
                    className={`bg-${tabInfo.color}-600 hover:bg-${tabInfo.color}-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto`}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah {tabInfo.title}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.size === data.length && data.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-900 uppercase whitespace-nowrap">
                      Pembelajaran
                    </th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-900 uppercase whitespace-nowrap">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-900 uppercase whitespace-nowrap">
                      Author
                    </th>
                    {activeTab === "panduan" && (
                      <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-900 uppercase whitespace-nowrap">
                        Stats
                      </th>
                    )}
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-900 uppercase whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-center px-4 py-2 text-[10px] font-semibold text-gray-900 uppercase whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.thumbnail ||
                              `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg` ||
                              `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/60/60`
                            }
                            alt=""
                            className="w-12 h-9 rounded-lg object-cover bg-gray-100"
                            loading="lazy"
                          />
                          <div className="min-w-0 max-w-xl lg:max-w-2xl">
                            <h3 className="font-semibold text-xs text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <p className="text-[10px] text-gray-600 truncate">
                              {item.description}
                            </p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 2 && (
                                  <span className="text-[10px] text-gray-500">
                                    +{item.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-${tabInfo.color}-100 text-${tabInfo.color}-700`}
                        >
                          {item.category}
                        </span>
                        {item.aspect && (
                          <div className="text-[10px] text-gray-500 mt-1">
                            {item.aspect}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-900">
                              {item.author}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {apiService.formatDate(item.publishDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      {activeTab === "panduan" && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <Download className="w-2.5 h-2.5 text-emerald-500" />
                              <span>
                                {apiService.formatNumber(item.downloads || 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 text-amber-500" />
                              <span>{item.rating || "4.5"}</span>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors ${
                              item.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {item.isActive ? (
                              <CheckCircle className="w-2.5 h-2.5" />
                            ) : (
                              <AlertTriangle className="w-2.5 h-2.5" />
                            )}
                            {item.isActive ? "Aktif" : "Nonaktif"}
                          </button>
                          <div>{renderActionButtons(item)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors duration-300"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  dari {pagination.total} pembelajaran
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(
                            pagination.totalPages - 4,
                            pagination.page - 2
                          )
                        ) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm border rounded ${
                            pageNum === pagination.page
                              ? `bg-${tabInfo.color}-600 text-white border-${tabInfo.color}-600`
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <PembelajaranForm
          item={editingItem}
          activeTab={activeTab}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default PembelajaranManagement;
