// src/components/EducationSection/DigitalResources.jsx
import React from 'react';

const DigitalResources = () => {
  return (
    <div className="flex justify-center">
      <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden p-8 text-center max-w-md">
        <div className="text-6xl text-gray-300 mb-4" aria-hidden="true">📱</div>
        <h3 className="text-xl font-bold text-gray-500 mb-2">Segera Hadir</h3>
        <p className="text-gray-400">Aplikasi mobile dan platform digital untuk PAUDHI</p>
        
        {/* Preview features yang akan datang */}
        <div className="mt-6 space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-mobile-alt text-purple-400"></i>
            <span>Aplikasi mobile PAUDHI</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-laptop text-purple-400"></i>
            <span>Portal e-learning interaktif</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-chart-line text-purple-400"></i>
            <span>Dashboard monitoring perkembangan anak</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-users text-purple-400"></i>
            <span>Platform kolaborasi orang tua dan guru</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalResources;