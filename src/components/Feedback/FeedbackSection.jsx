// src/components/Feedback/FeedbackSection.jsx
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Upload,
  X,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquarePlus,
  Bug,
  Lightbulb,
  Monitor,
  HelpCircle,
  Database,
  Cpu,
  MoreHorizontal,
  Brain,
  FileImage,
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

// ─── Category options ───
const CATEGORIES = [
  { value: '', label: 'Pilih kategori...', icon: null },
  { value: 'bug', label: 'Bug / Error', icon: Bug },
  { value: 'ai_assistant', label: 'AI Assistant', icon: Brain },
  { value: 'tampilan', label: 'Tampilan Website', icon: Monitor },
  { value: 'kesulitan', label: 'Kesulitan Penggunaan', icon: HelpCircle },
  { value: 'data', label: 'Data Tidak Sesuai', icon: Database },
  { value: 'fitur', label: 'Usulan Fitur', icon: Lightbulb },
  { value: 'performa', label: 'Performa Sistem', icon: Cpu },
  { value: 'lainnya', label: 'Lainnya', icon: MoreHorizontal },
];

// ─── Toast Component ───
const FeedbackToast = ({ show, type, message, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-6 right-6 z-[9999] max-w-sm w-full"
      >
        <div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
            type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
              : 'bg-red-50/95 border-red-200 text-red-800'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <p className="text-sm font-medium flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Detect device info ───
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  return { browser, deviceType, userAgent: ua };
};

// ─── Main FeedbackSection Component ───
const FeedbackSection = () => {
  // Form state
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // ─── Toast helpers ───
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 5000);
  };

  // ─── File handling ───
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setScreenshot(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setScreenshotPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null); // PDF — no preview
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Form reset ───
  const resetForm = () => {
    setCategory('');
    setTitle('');
    setMessage('');
    removeScreenshot();
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!category) {
      showToast('error', 'Silakan pilih kategori feedback.');
      return;
    }
    if (!title.trim()) {
      showToast('error', 'Judul masalah wajib diisi.');
      return;
    }
    if (!message.trim()) {
      showToast('error', 'Pesan feedback wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceInfo = getDeviceInfo();

      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title.trim());
      formData.append('message', message.trim());
      formData.append('page_url', window.location.href);
      formData.append('browser', deviceInfo.browser);
      formData.append('device_type', deviceInfo.deviceType);
      formData.append('user_agent', deviceInfo.userAgent);

      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      // Build URL — handle both "/api" base and full URL
      let apiUrl = API_BASE_URL;
      if (!apiUrl.endsWith('/api')) {
        apiUrl = apiUrl + '/api';
      }

      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('success', 'Terima kasih! Feedback Anda berhasil dikirim. 🎉');
        resetForm();
      } else {
        showToast('error', data.message || 'Gagal mengirim feedback. Coba lagi nanti.');
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      showToast('error', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Get selected category icon ───
  const SelectedIcon = CATEGORIES.find((c) => c.value === category)?.icon;

  return (
    <>
      {/* Toast */}
      <FeedbackToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, type: '', message: '' })}
      />

      <section
        id="feedback-section"
        className="relative py-20 px-4 sm:px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f5f0ff 100%)',
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-200/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm border border-blue-200/50">
              <MessageSquarePlus className="w-4 h-4" />
              Bantu Kami Lebih Baik
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Beri{' '}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Masukan
              </span>{' '}
              Anda
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Pendapat Anda sangat berharga untuk membantu kami meningkatkan kualitas layanan SISMONEV PAUDHI.
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white/60 p-6 sm:p-10 space-y-6"
            >
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  {SelectedIcon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
                      <SelectedIcon className="w-4 h-4" />
                    </div>
                  )}
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full ${
                      SelectedIcon ? 'pl-10' : 'pl-4'
                    } pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-gray-300`}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul Masalah <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tombol simpan tidak berfungsi"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all hover:border-gray-300"
                />
                <p className="text-xs text-gray-400 mt-1.5 text-right">{title.length}/200</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pesan / Deskripsi <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Jelaskan kendala, saran, atau pengalaman Anda secara detail..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none hover:border-gray-300 leading-relaxed"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-gray-400" />
                    Upload Screenshot
                    <span className="text-xs font-normal text-gray-400">(opsional, maks 5MB)</span>
                  </span>
                </label>

                {!screenshot ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50/60 scale-[1.01]'
                        : 'border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      className="hidden"
                    />
                    <motion.div
                      animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100/80 flex items-center justify-center mb-1">
                        <Upload className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {dragActive ? 'Lepaskan file di sini' : 'Drag & drop atau klik untuk upload'}
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP, PDF — Maksimal 5MB</p>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50"
                  >
                    {screenshotPreview ? (
                      <div className="p-3">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          className="w-full max-h-48 object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="p-6 flex items-center justify-center gap-3">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">{screenshot.name}</p>
                          <p className="text-xs text-gray-400">
                            {(screenshot.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="px-3 pb-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                        {screenshot.name} ({(screenshot.size / 1024).toFixed(1)} KB)
                      </p>
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.01 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-blue-500/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim feedback...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Feedback
                  </>
                )}
              </motion.button>

              {/* Privacy note */}
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Dengan mengirim feedback, Anda membantu kami meningkatkan kualitas layanan.
                <br />
                Informasi browser dan halaman dikumpulkan secara otomatis untuk keperluan debugging.
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default FeedbackSection;
