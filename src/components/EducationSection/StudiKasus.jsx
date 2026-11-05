// src/components/EducationSection/StudiKasus.jsx
import React from 'react';

const StudiKasus = () => {
  return (
    <div className="flex justify-center">
      <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden p-8 text-center max-w-md">
        <div className="text-6xl text-gray-300 mb-4" aria-hidden="true">🚧</div>
        <h3 className="text-xl font-bold text-gray-500 mb-2">Segera Hadir</h3>
        <p className="text-gray-400">Studi kasus holistik integratif sedang dalam pengembangan</p>
        
        {/* Preview features yang akan datang */}
        <div className="mt-6 space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-check-circle text-amber-400"></i>
            <span>Kasus implementasi PAUDHI di berbagai daerah</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-check-circle text-amber-400"></i>
            <span>Best practices dari lembaga PAUD terbaik</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <i className="fas fa-check-circle text-amber-400"></i>
            <span>Analisis tantangan dan solusi nyata</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudiKasus;