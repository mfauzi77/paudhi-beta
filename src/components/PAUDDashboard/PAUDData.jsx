// PAUDData.jsx - Data, Context & Utilities
import React, { createContext, useContext, useState } from 'react';

// ==================== DATA ====================
export const dashboardData = {
  rekap: {
    2025: {
      total: 55, onTrack: 31, atRisk: 14, behind: 10,
      klData: [
        { name: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan', total: 8, onTrack: 5, atRisk: 2, behind: 1, progress: 78 },
        { name: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', total: 6, onTrack: 4, atRisk: 1, behind: 1, progress: 82 },
        { name: 'Kementerian Kesehatan', total: 7, onTrack: 4, atRisk: 2, behind: 1, progress: 75 },
        { name: 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional', total: 5, onTrack: 3, atRisk: 1, behind: 1, progress: 68 },
        { name: 'Kementerian Sosial', total: 6, onTrack: 4, atRisk: 1, behind: 1, progress: 72 },
        { name: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak', total: 4, onTrack: 3, atRisk: 1, behind: 0, progress: 84 },
        { name: 'Kementerian Dalam Negeri', total: 3, onTrack: 2, atRisk: 1, behind: 0, progress: 76 },
        { name: 'Badan Perencanaan Pembangunan Nasional', total: 4, onTrack: 3, atRisk: 1, behind: 0, progress: 85 },
        { name: 'Kementerian Agama', total: 5, onTrack: 3, atRisk: 2, behind: 0, progress: 73 },
        { name: 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi', total: 4, onTrack: 2, atRisk: 1, behind: 1, progress: 64 },
        { name: 'Badan Pusat Statistik', total: 3, onTrack: 2, atRisk: 1, behind: 0, progress: 88 }
      ]
    },
    2026: {
      total: 58, onTrack: 35, atRisk: 15, behind: 8,
      klData: [
        { name: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan', total: 8, onTrack: 6, atRisk: 2, behind: 0, progress: 85 },
        { name: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', total: 6, onTrack: 5, atRisk: 1, behind: 0, progress: 88 },
        { name: 'Kementerian Kesehatan', total: 7, onTrack: 5, atRisk: 2, behind: 0, progress: 82 },
        { name: 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional', total: 5, onTrack: 3, atRisk: 2, behind: 0, progress: 75 },
        { name: 'Kementerian Sosial', total: 6, onTrack: 4, atRisk: 1, behind: 1, progress: 78 },
        { name: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak', total: 4, onTrack: 3, atRisk: 1, behind: 0, progress: 87 },
        { name: 'Kementerian Dalam Negeri', total: 3, onTrack: 2, atRisk: 1, behind: 0, progress: 80 },
        { name: 'Badan Perencanaan Pembangunan Nasional', total: 4, onTrack: 3, atRisk: 1, behind: 0, progress: 88 },
        { name: 'Kementerian Agama', total: 5, onTrack: 3, atRisk: 2, behind: 0, progress: 76 },
        { name: 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi', total: 4, onTrack: 3, atRisk: 1, behind: 0, progress: 72 },
        { name: 'Badan Pusat Statistik', total: 3, onTrack: 3, atRisk: 0, behind: 0, progress: 92 }
      ]
    }
  },
  kl: {
    'kemenko-pmk': {
      name: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
      description: 'Memimpin koordinasi lintas kementerian/lembaga dalam pelaksanaan program PAUD Holistik Integratif di seluruh Indonesia untuk memastikan sinkronisasi kebijakan dan efektivitas implementasi program.',
      type: 'Kementerian Koordinator',
      role: 'Koordinator Program PAUDHI',
      programs: '8 Program Utama',
      logo: 'https://www.kemenkopmk.go.id/sites/default/files/logo_kemenko_pmk.png',
      total: 8, onTrack: 5, atRisk: 2, behind: 1, progress: 78,
      programList: [
        {
          id: 1,
          name: 'Koordinasi Kebijakan PAUDHI Nasional',
          description: 'Memfasilitasi koordinasi lintas K/L untuk sinkronisasi kebijakan dan program PAUDHI di tingkat nasional',
          indicators: ['Jumlah Rapat Koordinasi K/L', 'Dokumen Kebijakan Terintegrasi', 'MoU Antar K/L'],
          targets: ['48 Rapat', '15 Dokumen', '20 MoU'],
          achievements: ['12 Rapat', '3 Dokumen', '5 MoU'],
          status: 'on-track',
          progress: 85
        },
        {
          id: 2,
          name: 'Monitoring & Evaluasi Program PAUDHI',
          description: 'Pelaksanaan monitoring dan evaluasi berkala terhadap implementasi program PAUDHI di seluruh Indonesia',
          indicators: ['Laporan Monitoring Triwulan', 'Evaluasi Tahunan Program', 'Dashboard Monitoring Online'],
          targets: ['80 Laporan', '5 Evaluasi', '1 Dashboard'],
          achievements: ['18 Laporan', '1 Evaluasi', '1 Dashboard'],
          status: 'at-risk',
          progress: 72
        },
        {
          id: 3,
          name: 'Pengembangan SDM PAUDHI',
          description: 'Program pelatihan dan pengembangan kapasitas sumber daya manusia untuk program PAUDHI',
          indicators: ['Pelatihan Tenaga Pendidik', 'Sertifikasi Kompetensi', 'Modul Pelatihan'],
          targets: ['2,500 Peserta', '2,000 Sertifikat', '25 Modul'],
          achievements: ['450 Peserta', '380 Sertifikat', '5 Modul'],
          status: 'on-track',
          progress: 90
        },
        {
          id: 4,
          name: 'Fasilitasi Anggaran PAUDHI',
          description: 'Koordinasi dan fasilitasi alokasi anggaran lintas K/L untuk program PAUDHI',
          indicators: ['Dokumen Perencanaan Anggaran', 'Alokasi Budget Terintegrasi', 'Monitoring Realisasi'],
          targets: ['25 Dokumen', 'Rp 15T', '100% Realisasi'],
          achievements: ['4 Dokumen', 'Rp 2.8T', '93% Realisasi'],
          status: 'at-risk',
          progress: 75
        },
        {
          id: 5,
          name: 'Inovasi Program PAUDHI',
          description: 'Pengembangan inovasi dan pilot project untuk meningkatkan efektivitas program PAUDHI',
          indicators: ['Pilot Project Inovasi', 'Best Practice Documentation', 'Disseminasi Inovasi'],
          targets: ['15 Pilot', '50 Dokumentasi', '100 Disseminasi'],
          achievements: ['3 Pilot', '8 Dokumentasi', '15 Disseminasi'],
          status: 'on-track',
          progress: 80
        },
        {
          id: 6,
          name: 'Kemitraan Stakeholder PAUDHI',
          description: 'Membangun dan memperkuat kemitraan dengan berbagai stakeholder dalam implementasi PAUDHI',
          indicators: ['Partnership Agreement', 'Kolaborasi Program', 'Forum Stakeholder'],
          targets: ['100 Partnership', '50 Kolaborasi', '25 Forum'],
          achievements: ['18 Partnership', '9 Kolaborasi', '4 Forum'],
          status: 'on-track',
          progress: 88
        },
        {
          id: 7,
          name: 'Komunikasi & Sosialisasi PAUDHI',
          description: 'Program komunikasi publik dan sosialisasi untuk meningkatkan awareness masyarakat terhadap PAUDHI',
          indicators: ['Kampanye Media Massa', 'Materi Sosialisasi', 'Event Awareness'],
          targets: ['500 Kampanye', '1,000 Materi', '150 Event'],
          achievements: ['85 Kampanye', '180 Materi', '25 Event'],
          status: 'on-track',
          progress: 87
        },
        {
          id: 8,
          name: 'Digitalisasi Sistem PAUDHI',
          description: 'Pengembangan sistem informasi dan digitalisasi untuk mendukung efisiensi program PAUDHI',
          indicators: ['Sistem Informasi Terintegrasi', 'Mobile Application', 'Database Nasional'],
          targets: ['5 Sistem', '10 Aplikasi', '1 Database'],
          achievements: ['0 Sistem', '1 Aplikasi', '0 Database'],
          status: 'behind',
          progress: 25
        }
      ]
    },
    'kemendikdasmen': {
      name: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
      description: 'Bertanggung jawab atas pengembangan kurikulum, standar pendidikan, dan peningkatan kualitas layanan PAUD di seluruh Indonesia melalui pendekatan holistik integratif.',
      type: 'Kementerian',
      role: 'Penyelenggara Pendidikan PAUD',
      programs: '6 Program Utama',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Logo_Kemendikdasmen.png/200px-Logo_Kemendikdasmen.png',
      total: 6, onTrack: 4, atRisk: 1, behind: 1, progress: 82,
      programList: []
    },
    'kemenkes': {
      name: 'Kementerian Kesehatan Republik Indonesia',
      description: 'Memastikan aspek kesehatan dan gizi dalam program PAUDHI melalui pelayanan kesehatan ibu dan anak, imunisasi, dan monitoring tumbuh kembang anak.',
      type: 'Kementerian',
      role: 'Penyedia Layanan Kesehatan',
      programs: '7 Program Utama',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Logo_Kementerian_Kesehatan_RI.svg/200px-Logo_Kementerian_Kesehatan_RI.svg.png',
      total: 7, onTrack: 4, atRisk: 2, behind: 1, progress: 75,
      programList: []
    },
    'kemendukbangga': {
              name: 'Kementerian Pembangunan Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi',
      description: 'Mengintegrasikan program kependudukan dan keluarga berencana dengan PAUDHI untuk mendukung perencanaan keluarga yang berkualitas.',
      type: 'Lembaga Pemerintah',
      role: 'Program Kependudukan & KB',
      programs: '5 Program Utama',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Logo_Kemendukbangga.png/200px-Logo_Kemendukbangga.png',
      total: 5, onTrack: 3, atRisk: 1, behind: 1, progress: 68,
      programList: []
    },
    'kemensos': {
      name: 'Kementerian Sosial Republik Indonesia',
      description: 'Menyediakan program perlindungan sosial dan bantuan sosial untuk keluarga dan anak dalam rangka mendukung program PAUDHI.',
      type: 'Kementerian',
      role: 'Perlindungan Sosial Anak',
      programs: '6 Program Utama',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Logo_Kementerian_Sosial.png/200px-Logo_Kementerian_Sosial.png',
      total: 6, onTrack: 4, atRisk: 1, behind: 1, progress: 72,
      programList: []
    }
  }
};

// ==================== CONTEXT ====================
const PAUDDashboardContext = createContext();

export const PAUDDashboardProvider = ({ children, initialData = null }) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedKL, setSelectedKL] = useState('kemenko-pmk');
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    status: ''
  });

  // Use initialData if provided, otherwise use default data
  const data = initialData || dashboardData;

  // Get current rekap data based on selected year
  const getCurrentRekapData = () => {
    return data.rekap[selectedYear] || data.rekap['2025'];
  };

  // Get current KL data
  const getCurrentKLData = () => {
    return data.kl[selectedKL] || data.kl['kemenko-pmk'];
  };

  // Filter programs based on search criteria
  const getFilteredPrograms = () => {
    const klData = getCurrentKLData();
    const programs = klData.programList || [];
    
    return programs.filter(program => {
      const matchesSearch = !searchFilters.search || 
        program.name.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
        program.description.toLowerCase().includes(searchFilters.search.toLowerCase());
      
      const matchesStatus = !searchFilters.status || 
        program.status === searchFilters.status;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Update search filters
  const updateSearchFilters = (filters) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  // Get available years
  const getAvailableYears = () => {
    return Object.keys(data.rekap);
  };

  // Get all KL list
  const getKLList = () => {
    return Object.keys(data.kl).map(key => ({
      id: key,
      ...data.kl[key]
    }));
  };

  // Export data function
  const exportData = (programs) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Program/Kegiatan,Deskripsi,Indikator,Target,Capaian,Status,Progress\n";
    
    programs.forEach(program => {
      const row = [
        `"${program.name}"`,
        `"${program.description}"`,
        `"${program.indicators.join('; ')}"`,
        `"${program.targets.join('; ')}"`,
        `"${program.achievements.join('; ')}"`,
        `"${program.status}"`,
        `"${program.progress}%"`
      ].join(',');
      csvContent += row + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PAUD_HI_Programs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    // State
    selectedYear,
    setSelectedYear,
    selectedKL,
    setSelectedKL,
    searchFilters,
    
    // Data getters
    getCurrentRekapData,
    getCurrentKLData,
    getFilteredPrograms,
    getAvailableYears,
    getKLList,
    
    // Actions
    updateSearchFilters,
    exportData
  };

  return (
    <PAUDDashboardContext.Provider value={value}>
      {children}
    </PAUDDashboardContext.Provider>
  );
};

export const usePAUDDashboard = () => {
  const context = useContext(PAUDDashboardContext);
  if (!context) {
    throw new Error('usePAUDDashboard must be used within PAUDDashboardProvider');
  }
  return context;
};

// ==================== UTILITY FUNCTIONS ====================
export const formatPAUDNumber = (num) => {
  if (typeof num !== 'number') return num;
  return new Intl.NumberFormat('id-ID').format(num);
};

export const getPAUDStatusColor = (status) => {
  const colors = {
    'on-track': '#10B981',
    'at-risk': '#F59E0B',
    'behind': '#EF4444',
    'completed': '#3B82F6'
  };
  return colors[status] || '#6B7280';
};

export const calculatePAUDProgress = (achievements, targets) => {
  if (!achievements || !targets || targets.length === 0) return 0;
  
  const totalProgress = achievements.reduce((sum, achievement, index) => {
    const target = targets[index];
    if (!target) return sum;
    
    // Extract numbers from strings like "12 Rapat" -> 12
    const achievementNum = parseInt(achievement.match(/\d+/)?.[0] || 0);
    const targetNum = parseInt(target.match(/\d+/)?.[0] || 1);
    
    return sum + (achievementNum / targetNum);
  }, 0);
  
  return Math.round((totalProgress / targets.length) * 100);
};

export const getProgressColorClass = (progress) => {
  if (progress >= 80) return 'bg-gradient-to-br from-emerald-500 to-green-500';
  if (progress >= 60) return 'bg-gradient-to-br from-orange-500 to-yellow-500';
  return 'bg-gradient-to-br from-red-600 to-purple-700';
};

export const getStatusConfig = (status) => {
  const statusConfig = {
    'on-track': { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      label: 'On Track',
      description: 'Program berjalan sesuai target'
    },
    'at-risk': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      label: 'At Risk',
      description: 'Program memerlukan perhatian'
    },
    'behind': { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      label: 'Behind',
      description: 'Program tertinggal dari target'
    },
    'completed': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Completed',
      description: 'Program telah selesai'
    }
  };
  
  return statusConfig[status] || statusConfig['on-track'];
};

// ==================== CONSTANTS ====================
export const PAUD_CONSTANTS = {
  CARD_TYPES: {
    TOTAL: 'total',
    ON_TRACK: 'onTrack',
    AT_RISK: 'atRisk',
    BEHIND: 'behind'
  },
  
  CARD_STYLES: {
    total: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    onTrack: 'bg-gradient-to-br from-emerald-500 to-green-500',
    atRisk: 'bg-gradient-to-br from-orange-500 to-yellow-500',
    behind: 'bg-gradient-to-br from-red-600 to-purple-700'
  },
  
  STATUS_COLORS: {
    'on-track': 'bg-green-500',
    'at-risk': 'bg-yellow-500',
    'behind': 'bg-red-500',
    'completed': 'bg-blue-500'
  },
  
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280
  }
};