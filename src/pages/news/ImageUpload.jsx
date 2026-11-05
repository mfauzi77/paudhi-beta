// components/ImageUpload.jsx - Komponen upload gambar terpisah (compatible dengan apiService lengkap)
import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import apiService from '../../utils/apiService'; // Pastikan apiService sudah diimport
import { useToast } from '../../components/ToastContext';

const ImageUpload = ({ 
  value = null, 
  onChange = () => {}, 
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(value?.url || null);
  const { success, error, loading } = useToast();

  // Gunakan validasi dari apiService
  const validateFile = (file) => {
    const validation = apiService.validateImageFile(file);
    return {
      valid: validation.isValid,
      error: validation.errors.join(', ')
    };
  };

  // Proses file dengan cara yang ringan
  const processFile = useCallback(async (file) => {
    if (processing || disabled) return;
    
    const validation = validateFile(file);
    if (!validation.valid) {
      error(validation.error);
      return;
    }

    setProcessing(true);
    loading('Memproses gambar...');

    try {
      // Buat preview secara async
      const previewUrl = await apiService.convertToBase64(file);

      setPreview(previewUrl);
      
      // Update parent component - HANYA kirim file, jangan kirim base64 URL
      onChange({
        file: file,
        alt: '',
        caption: ''
      });

      success('Gambar berhasil diproses!');

    } catch (err) {
      console.error('Error processing file:', err);
      error('Gagal memproses file: ' + err.message);
    } finally {
      setProcessing(false);
    }
  }, [processing, disabled, onChange, success, error, loading]);

  // Event handlers
  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    e.target.value = '';
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    if (processing || disabled) return;
    e.preventDefault();
    setDragOver(true);
  }, [processing, disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    if (processing || disabled) return;
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer?.files;
    if (files?.length > 0) {
      processFile(files[0]);
    }
  }, [processing, disabled, processFile]);

  const handleRemove = useCallback(() => {
    if (processing) return;
    
    // Cleanup preview URL if it's a blob
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    setPreview(null);
    onChange(null);
  }, [processing, preview, onChange]);

  const handleClick = useCallback(() => {
    if (processing || disabled || preview) return;
    document.getElementById('image-upload-input')?.click();
  }, [processing, disabled, preview]);

  return (
    <div className="w-full">
      <input
        id="image-upload-input"
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || processing}
      />
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-all duration-200
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${(processing || disabled) 
            ? 'opacity-50 cursor-not-allowed' 
            : preview 
              ? 'cursor-default' 
              : 'cursor-pointer hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          // Preview Mode
          <div className="space-y-3">
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                disabled={processing}
                title="Hapus gambar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {value?.file && (
              <div className="bg-gray-50 rounded p-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 truncate">
                    {value.file.name}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {apiService.formatFileSize(value.file.size)}
                  </span>
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('image-upload-input')?.click();
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded transition text-sm"
              disabled={processing}
            >
              Ganti Gambar
            </button>
          </div>
        ) : (
          // Upload Mode
          <div className="text-center py-6">
            {processing ? (
              <div>
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">Memproses gambar...</p>
              </div>
            ) : dragOver ? (
              <div className="text-blue-600">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Lepaskan file di sini</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm mb-2">Drag & drop gambar atau klik untuk pilih</p>
                <p className="text-xs text-gray-400">
                  Maks {apiService.formatFileSize(maxSize)} • JPEG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;