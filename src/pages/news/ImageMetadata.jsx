// components/ImageMetadata.jsx - Komponen metadata gambar terpisah
import React from 'react';

const ImageMetadata = ({ 
  value = { alt: '', caption: '' }, 
  onChange = () => {}, 
  disabled = false 
}) => {
  const handleChange = (field, newValue) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Alt Text
          <span className="text-gray-400 text-xs ml-1">(untuk aksesibilitas)</span>
        </label>
        <input
          type="text"
          value={value.alt || ''}
          onChange={(e) => handleChange('alt', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Deskripsi gambar untuk screen reader..."
          disabled={disabled}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Caption
          <span className="text-gray-400 text-xs ml-1">(opsional)</span>
        </label>
        <input
          type="text"
          value={value.caption || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Caption yang akan ditampilkan di bawah gambar..."
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ImageMetadata;