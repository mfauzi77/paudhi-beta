// src/components/EducationSection/data.js - UPDATED

// ===== TABS CONFIG - MASIH DIBUTUHKAN =====
export const tabsConfig = [
  { id: 'panduan', label: 'Panduan Holistik', icon: 'fas fa-book-open', color: 'blue' },
  { id: 'video', label: 'Video Integratif', icon: 'fas fa-play-circle', color: 'red' },
  { id: 'tools', label: 'Perangkat Evaluasi', icon: 'fas fa-clipboard-check', color: 'emerald' },
  { id: 'kasus', label: 'Studi Kasus', icon: 'fas fa-lightbulb', color: 'amber' },
  { id: 'digital', label: 'Materi Digital', icon: 'fas fa-mobile-alt', color: 'purple' }
];

// ===== FALLBACK DATA (OPSIONAL) =====
// Data ini bisa digunakan sebagai fallback jika API down
// Uncomment jika ingin menggunakan fallback data

/*
export const panduanData = [
  {
    id: 'fallback-1',
    title: 'Data Fallback - API Sedang Down',
    category: 'Fallback',
    description: 'Ini adalah data fallback ketika API tidak tersedia.',
    author: 'System',
    ageGroup: '0-6',
    aspect: 'kognitif',
    pages: 0,
    downloads: 0,
    rating: 0,
    publishDate: '2025',
    tags: ['Fallback'],
    stakeholder: 'System',
    thumbnail: `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/400/300`,
    pdfUrl: '#'
  }
];

export const videoData = [
  {
    id: 'fallback-1',
    title: 'Data Fallback - API Sedang Down',
    description: 'Ini adalah data fallback ketika API tidak tersedia.',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '00:00',
    views: 0,
    likes: 0,
    publishDate: '2025',
    channel: 'System',
    category: 'Fallback',
    ageGroup: '0-6',
    aspect: 'kognitif',
    tags: ['Fallback'],
    stakeholder: 'System'
  }
];

export const toolsData = [
  {
    id: 'fallback-1',
    title: 'Data Fallback - API Sedang Down',
    description: 'Ini adalah data fallback ketika API tidak tersedia.',
    category: 'Fallback',
    ageGroup: '0-6',
    aspect: 'kognitif',
    downloads: 0,
    rating: 0,
    publishDate: '2025',
    tags: ['Fallback'],
    stakeholder: 'System',
    author: 'System',
    thumbnail: `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/400/300`,
    features: ['Fallback'],
    format: 'System',
    usage: 'Fallback mode'
  }
];
*/