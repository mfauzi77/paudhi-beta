// PAUDSections.jsx - Section Components
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  CheckSquare, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Building, 
  Users, 
  Calendar, 
  TrendingUp,
  Search,
  Download,
  PieChart,
  Construction,
  Filter,
  Eye,
  Edit
} from 'lucide-react';

import { 
  PAUDButton,
  PAUDSummaryCard,
  PAUDProgressCircle,
  PAUDStatusBadge,
  PAUDProgressBar,
  PAUDCard,
  PAUDEmptyState,
  PAUDLoadingSpinner
} from './PAUDComponents';
import PAUDYearFilter from './PAUDYearFilter';

// ==================== REKAPITULASI TABLE ====================
export const PAUDRekapitulasiTable = ({ 
  data, 
  onKLSelect, 
  loading = false,
  className = '' 
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <div className="animate-pulse p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full border-collapse text-sm min-w-[800px]">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
            <th className="text-white p-6 text-left font-semibold border-none whitespace-nowrap">
              Kementerian/Lembaga
            </th>
            <th className="text-white p-6 text-center font-semibold border-none">Total Program</th>
            <th className="text-white p-6 text-center font-semibold border-none">On Track</th>
            <th className="text-white p-6 text-center font-semibold border-none">At Risk</th>
            <th className="text-white p-6 text-center font-semibold border-none">Behind</th>
            <th className="text-white p-6 text-center font-semibold border-none">Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.klData.map((kl, index) => (
            <tr 
              key={index} 
              className="hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onKLSelect && onKLSelect(kl.name)}
            >
              <td className="p-4 font-semibold text-gray-900 border-b border-gray-100 min-w-[200px] group-hover:text-blue-600 transition-colors">
                <div className="flex items-center gap-2">
                  {kl.name}
                  <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </td>
              <td className="p-4 text-center font-semibold border-b border-gray-100">{kl.total}</td>
              <td className="p-4 text-center font-semibold text-green-600 border-b border-gray-100">{kl.onTrack}</td>
              <td className="p-4 text-center font-semibold text-yellow-600 border-b border-gray-100">{kl.atRisk}</td>
              <td className="p-4 text-center font-semibold text-red-600 border-b border-gray-100">{kl.behind}</td>
              <td className="p-4 text-center border-b border-gray-100">
                <div className="flex justify-center">
                  <PAUDProgressCircle progress={kl.progress} />
                </div>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="p-4 text-blue-600">TOTAL KESELURUHAN</td>
            <td className="p-4 text-center text-blue-600">{data.total}</td>
            <td className="p-4 text-center text-green-600">{data.onTrack}</td>
            <td className="p-4 text-center text-yellow-600">{data.atRisk}</td>
            <td className="p-4 text-center text-red-600">{data.behind}</td>
            <td className="p-4 text-center">
              <div className="flex justify-center">
                <div className="w-15 h-15 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {Math.round((data.onTrack * 100) / data.total)}%
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ==================== REKAPITULASI SECTION ====================
export const PAUDRekapitulasiSection = ({ 
  onKLSelect, 
  className = '',
  showYearFilter = true,
  loading = false,
  // Data props from parent
  selectedYear = 2025,
  setSelectedYear = null,
  dashboardData = {},
  getAvailableYears = null,
  refreshData = null
}) => {
  const currentData = useMemo(() => {
    const rekap = dashboardData.rekap || {};
    return {
      total: rekap.total || 0,
      onTrack: rekap.onTrack || 0,
      atRisk: rekap.atRisk || 0,
      behind: rekap.behind || 0,
      progress: rekap.progress || 0,
      klData: Array.isArray(rekap.klData) ? rekap.klData : []
    };
  }, [dashboardData.rekap]);

  const handleYearChange = async (year) => {
    if (setSelectedYear) {
      setSelectedYear(year);
    }
    // Refresh data when year changes
    if (refreshData) {
      refreshData();
    }
  };

  // Get available years
  const [availableYears, setAvailableYears] = useState([2020, 2021, 2022, 2023, 2024, 2025]);
  
  useEffect(() => {
    const fetchYears = async () => {
      if (getAvailableYears) {
        try {
          const years = await getAvailableYears();
          setAvailableYears(years);
        } catch (error) {
          console.warn('Failed to fetch available years:', error);
        }
      }
    };
    fetchYears();
  }, [getAvailableYears]);

  return (
    <PAUDCard className={`mb-8 ${className}`} padding="xl" shadow="lg" rounded="2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
          <BarChart3 className="text-blue-600" />
          Rekapitulasi Program PAUDHI Seluruh K/L
        </h2>
        
        {showYearFilter && (
          <PAUDYearFilter
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            availableYears={availableYears}
            disabled={loading}
          />
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <PAUDSummaryCard 
          icon={CheckSquare}
          number={loading ? '...' : currentData.total}
          label="Total Program"
          description={`Seluruh K/L - Tahun ${selectedYear}`}
          type="total"
          loading={loading}
        />
        <PAUDSummaryCard 
          icon={CheckCircle}
          number={loading ? '...' : currentData.onTrack}
          label="On Track"
          description="Program Sesuai Target"
          type="onTrack"
          loading={loading}
        />
        <PAUDSummaryCard 
          icon={AlertTriangle}
          number={loading ? '...' : currentData.atRisk}
          label="At Risk"
          description="Perlu Perhatian"
          type="atRisk"
          loading={loading}
        />
        <PAUDSummaryCard 
          icon={Clock}
          number={loading ? '...' : currentData.behind}
          label="Behind"
          description="Tertinggal Target"
          type="behind"
          loading={loading}
        />
      </div>

      {/* Table */}
      <PAUDRekapitulasiTable 
        data={currentData} 
        onKLSelect={onKLSelect} 
        loading={loading}
      />
    </PAUDCard>
  );
};

// ==================== KL HEADER ====================
export const PAUDKLHeader = ({ 
  className = '',
  loading = false,
  editable = false,
  onEdit = null,
  // Data props from parent
  getCurrentKLData = null,
  selectedKL = null
}) => {
  const klData = useMemo(() => {
    const data = getCurrentKLData ? getCurrentKLData() : {};
    return {
      name: data.name || 'Kementerian/Lembaga',
      description: data.description || 'Deskripsi K/L',
      type: data.type || 'Kementerian',
      role: data.role || 'Penyelenggara',
      programs: data.programs || 0,
      total: data.total || 0,
      onTrack: data.onTrack || 0,
      atRisk: data.atRisk || 0,
      behind: data.behind || 0,
      progress: data.progress || 0,
      programList: data.programList || []
    };
  }, [selectedKL, getCurrentKLData]);

  if (loading) {
    return (
      <PAUDCard className={`mb-8 ${className}`} padding="xl" shadow="lg" rounded="2xl" loading />
    );
  }

  return (
    <PAUDCard className={`mb-8 ${className}`} padding="xl" shadow="lg" rounded="2xl">
      <div className="flex flex-col lg:flex-row items-center gap-8">
     {/* Logo  <div className="flex-shrink-0">
          <img 
            src={klData.logo || `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/120/120`}
            alt={`Logo ${klData.name}`}
            className="w-30 h-30 object-contain rounded-lg bg-white p-4 shadow-md"
            onError={(e) => { e.target.src = `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/120/120`; }}
          />
        </div> */}
        
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {klData.name}
            </h1>
            {editable && onEdit && (
              <PAUDButton 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(klData)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </PAUDButton>
            )}
          </div>
          
          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            {klData.description}
          </p>
          
          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Building className="w-4 h-4 text-blue-600" />
              <span>{klData.type}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{klData.role}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Periode 2025-2029</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{klData.programs}</span>
            </div>
          </div>
        </div>
      </div>
    </PAUDCard>
  );
};

// ==================== SUMMARY GRID ====================
export const PAUDSummaryGrid = ({ 
  className = '',
  loading = false,
  columns = { sm: 2, md: 3, lg: 5 },
  // Data props from parent
  getCurrentKLData = null,
  selectedKL = null
}) => {
  const data = useMemo(() => {
    const klData = getCurrentKLData ? getCurrentKLData() : {};
    return {
      total: klData.total || 0,
      onTrack: klData.onTrack || 0,
      atRisk: klData.atRisk || 0,
      behind: klData.behind || 0,
      completed: klData.completed || 0,
      progress: klData.progress || 0
    };
  }, [getCurrentKLData, selectedKL]);

  const SummaryCard = ({ icon: Icon, number, label, description, bgColor }) => (
    <PAUDCard hover className="text-center" padding="md" shadow="md" rounded="lg">
      <div className={`w-14 h-14 ${bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{loading ? '...' : number}</div>
      <div className="text-gray-600 font-semibold mb-1">{label}</div>
      <div className="text-gray-500 text-xs">{description}</div>
    </PAUDCard>
  );

  const gridClasses = `grid gap-6 ${className}`;
  const responsiveClasses = `grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;

  if (loading) {
    return (
      <div className={`${gridClasses} ${responsiveClasses}`}>
        {[...Array(5)].map((_, index) => (
          <PAUDCard key={index} loading className="text-center" padding="md" />
        ))}
      </div>
    );
  }

  return (
    <div className={`${gridClasses} ${responsiveClasses}`}>
      <SummaryCard 
        icon={CheckSquare}
        number={data.total}
        label="Total Program"
        description="Program & Kegiatan Aktif"
        bgColor="bg-blue-600"
      />
      <SummaryCard 
        icon={CheckCircle}
        number={data.onTrack}
        label="On Track"
        description="Program Sesuai Target"
        bgColor="bg-green-500"
      />
      <SummaryCard 
        icon={AlertTriangle}
        number={data.atRisk}
        label="At Risk"
        description="Perlu Perhatian"
        bgColor="bg-yellow-500"
      />
      <SummaryCard 
        icon={Clock}
        number={data.behind}
        label="Behind"
        description="Tertinggal Target"
        bgColor="bg-red-500"
      />
      <SummaryCard 
        icon={PieChart}
        number={`${data.progress}%`}
        label="Progress Keseluruhan"
        description="Rata-rata Pencapaian"
        bgColor="bg-emerald-500"
      />
    </div>
  );
};

// ==================== TABLE FILTERS ====================
export const PAUDTableFilters = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onExport,
  className = '',
  placeholder = "Cari program...",
  statusOptions = [],
  showExport = true
}) => {
  const defaultStatusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'on-track', label: 'On Track' },
    { value: 'at-risk', label: 'At Risk' },
    { value: 'behind', label: 'Behind' },
    { value: 'completed', label: 'Completed' }
  ];

  const options = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;

  return (
    <div className={`flex flex-col md:flex-row gap-4 w-full md:w-auto ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Status Filter */}
      <div className="relative">
        <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <select 
          className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[140px]"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Export Button */}
      {showExport && (
        <PAUDButton variant="outline" size="sm" onClick={onExport}>
          <Download className="w-4 h-4" />
          Export
        </PAUDButton>
      )}
    </div>
  );
};

// ==================== PROGRAM TABLE ====================
export const PAUDProgramTable = ({ 
  className = '',
  onExport = null,
  onProgramSelect = null,
  showFilters = true,
  maxHeight = null,
  // Data props from parent
  getCurrentKLData = null,
  selectedKL = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const klData = useMemo(() => {
    const data = getCurrentKLData ? getCurrentKLData() : {};
    return {
      name: data.name || 'Kementerian/Lembaga',
      description: data.description || 'Deskripsi K/L',
      type: data.type || 'Kementerian',
      role: data.role || 'Penyelenggara',
      programs: data.programs || 0,
      total: data.total || 0,
      onTrack: data.onTrack || 0,
      atRisk: data.atRisk || 0,
      behind: data.behind || 0,
      progress: data.progress || 0,
      programList: data.programList || []
    };
  }, [selectedKL, getCurrentKLData]);
  const programs = klData.programList || [];
  
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !searchTerm || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || program.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (onExport) {
      onExport(filteredPrograms);
    }
  };

  if (programs.length === 0) {
    return (
      <PAUDCard className={className} padding="md" shadow="lg" rounded="2xl">
        <PAUDEmptyState 
          icon={Construction}
          title="Data Sedang Dalam Pengembangan"
          description={`Detail program ${klData.name} akan segera tersedia`}
        />
      </PAUDCard>
    );
  }

  return (
    <PAUDCard className={className} padding="md" shadow="lg" rounded="2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Program & Kegiatan {klData.name}
        </h2>
        
        {showFilters && (
          <PAUDTableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onExport={handleExport}
          />
        )}
      </div>

      {filteredPrograms.length === 0 && (searchTerm || statusFilter) ? (
        <PAUDEmptyState 
          title="Tidak ada data yang ditemukan"
          description="Coba ubah filter pencarian Anda"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200" style={{ maxHeight }}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Program/Kegiatan</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Indikator Output</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Target</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Capaian</th>
                <th className="p-4 text-left font-semibold text-gray-700 border-b border-gray-200">Status & Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.map((program, index) => (
                <tr 
                  key={program.id || index} 
                  className={`hover:bg-gray-50 transition-colors ${onProgramSelect ? 'cursor-pointer' : ''}`}
                  onClick={() => onProgramSelect && onProgramSelect(program)}
                >
                  <td className="p-4 border-b border-gray-100 align-top">
                    <div className="font-semibold text-gray-900 mb-1">{program.name}</div>
                    <div className="text-gray-600 text-xs leading-relaxed">{program.description}</div>
                  </td>
                  <td className="p-4 border-b border-gray-100 align-top">
                    {program.indicators.map((indicator, idx) => (
                      <div key={idx} className="mb-1 text-gray-700 text-xs">• {indicator}</div>
                    ))}
                  </td>
                  <td className="p-4 border-b border-gray-100 align-top">
                    {program.targets.map((target, idx) => (
                      <div key={idx} className="mb-1 font-semibold text-gray-900">{target}</div>
                    ))}
                  </td>
                  <td className="p-4 border-b border-gray-100 align-top">
                    {program.achievements.map((achievement, idx) => (
                      <div key={idx} className="mb-1 font-semibold text-gray-900">{achievement}</div>
                    ))}
                  </td>
                  <td className="p-4 border-b border-gray-100 align-top">
                    <PAUDStatusBadge status={program.status} className="mb-2" />
                    <PAUDProgressBar 
                      progress={program.progress} 
                      status={program.status} 
                      className="mb-1"
                      showPercentage={true}
                    />
                    <div className="text-xs text-gray-600">{program.progress}% tercapai</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center text-sm text-gray-600">
        <span>
          Menampilkan {filteredPrograms.length} dari {programs.length} program
        </span>
        <span>
          {searchTerm && `Hasil pencarian: "${searchTerm}"`}
          {statusFilter && ` | Filter: ${statusFilter}`}
        </span>
      </div>
    </PAUDCard>
  );
};

// ==================== TAB NAVIGATION ====================
export const PAUDTabNavigation = ({ 
  activeTab, 
  onTabChange, 
  tabs, 
  className = '',
  variant = 'default' // 'default' | 'pills'
}) => {
  const baseClasses = variant === 'pills' 
    ? 'flex gap-2 mb-8 overflow-x-auto pb-0'
    : 'flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto pb-0';

  const getTabClasses = (tab) => {
    const baseTabClasses = 'px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 min-w-max';
    
    if (variant === 'pills') {
      return `${baseTabClasses} rounded-lg ${
        activeTab === tab.id
          ? 'bg-blue-600 text-white font-semibold'
          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
      }`;
    }
    
    return `${baseTabClasses} border-b-3 ${
      activeTab === tab.id
        ? 'text-blue-600 border-blue-600 font-semibold'
        : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50'
    }`;
  };

  return (
    <div className={`${baseClasses} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={getTabClasses(tab)}
          disabled={tab.disabled}
        >
          <div className="flex items-center gap-2">
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                {tab.badge}
              </span>
            )}
            {tab.notification && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

// ==================== EXPORT ALL ====================
export default {
  PAUDRekapitulasiSection,
  PAUDRekapitulasiTable,
  PAUDKLHeader,
  PAUDSummaryGrid,
  PAUDProgramTable,
  PAUDTableFilters,
  PAUDTabNavigation
};