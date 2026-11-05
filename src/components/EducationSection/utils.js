// src/components/EducationSection/utils.js

export const getTabColorClasses = (color, isActive = false) => {
  const colors = {
    blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50',
    red: isActive ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50',
    emerald: isActive ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50',
    amber: isActive ? 'bg-amber-600 text-white' : 'text-amber-600 hover:bg-amber-50',
    purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50'
  };
  return colors[color] || colors.blue;
};

export const getModalButtonColor = (activeTab) => {
  const colors = {
    panduan: 'bg-blue-600 hover:bg-blue-700',
    video: 'bg-red-600 hover:bg-red-700',
    tools: 'bg-emerald-600 hover:bg-emerald-700',
    kasus: 'bg-amber-600 hover:bg-amber-700',
    digital: 'bg-purple-600 hover:bg-purple-700'
  };
  return colors[activeTab] || colors.panduan;
};

export const getModalButtonText = (activeTab) => {
  const texts = {
    panduan: 'Buka PDF Penuh',
    video: 'Buka di YouTube',
    tools: 'Download Tool',
    kasus: 'Lihat Studi Kasus',
    digital: 'Akses Resource'
  };
  return texts[activeTab] || texts.panduan;
};

export const getModalButtonIcon = (activeTab) => {
  const icons = {
    panduan: 'fas fa-external-link-alt',
    video: 'fab fa-youtube',
    tools: 'fas fa-download',
    kasus: 'fas fa-external-link-alt',
    digital: 'fas fa-mobile-alt'
  };
  return icons[activeTab] || icons.panduan;
};