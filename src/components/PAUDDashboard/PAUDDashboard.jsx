// PAUDDashboard.jsx - Main Component (Fixed Version)
import React, { useState, useEffect } from 'react';
import { PAUDBreadcrumb, PAUDLoadingSpinner, PAUDEmptyState } from './PAUDComponents';
import { 
  PAUDRekapitulasiSection,
  PAUDKLHeader,
  PAUDSummaryGrid,
  PAUDProgramTable,
  PAUDTabNavigation
} from './PAUDSections';
import { Construction, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { usePAUDPublicDashboard } from '../../hooks/usePAUDPublicDashboard';
import { PAUDDashboardCharts } from './PAUDCharts';

// ==================== TAB CONTENT COMPONENT ====================
const PAUDTabContent = ({ 
  activeTab, 
  tabs, 
  children,
  className = '' 
}) => {
  const currentTab = tabs.find(tab => tab.id === activeTab);
  
  if (!currentTab) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
        <PAUDEmptyState 
          icon={AlertCircle}
          title="Tab tidak ditemukan"
          description="Tab yang diminta tidak tersedia"
        />
      </div>
    );
  }

  if (children) {
    return <div className={className}>{children}</div>;
  }

  if (currentTab.component) {
    const Component = currentTab.component;
    return <Component {...currentTab.props} className={className} />;
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <PAUDEmptyState 
        icon={Construction}
        title="Data Sedang Dalam Pengembangan"
        description={`Detail program ${currentTab.label} akan segera tersedia`}
      />
    </div>
  );
};

// ==================== DASHBOARD CONTENT COMPONENT ====================
const PAUDDashboardContent = ({ 
  showBreadcrumb = true,
  showTabs = true,
  defaultTab = 'kemenko-pmk',
  onKLSelect = null,
  onProgramSelect = null,
  onDataExport = null,
  className = '',
  breadcrumbItems = [],
  customTabs = null
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { 
    setSelectedKL, 
    getCurrentKLData, 
    selectedYear,
    setSelectedYear,
    lastUpdate,
    refreshData,
    dashboardData,
    getAvailableYears,
    getChartData,
    getStatistics,
    loading: internalLoading,
    error: internalError
  } = usePAUDPublicDashboard();

  const tabs = customTabs || [
    { id: 'kemenko-pmk', label: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan', badge: '8' },
            { id: 'kemendikdasmen', label: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', badge: '6' },
            { id: 'kemenkes', label: 'Kementerian Kesehatan', badge: '7' },
            { id: 'kemendukbangga', label: 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional', badge: '5' },
            { id: 'kemensos', label: 'Kementerian Sosial', badge: '6' },
            { id: 'kemen-pppa', label: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak', badge: '4' },
            { id: 'kemendagri', label: 'Kementerian Dalam Negeri', badge: '3' },
    { id: 'bappenas', label: 'Badan Perencanaan Pembangunan Nasional', badge: '4' },
            { id: 'kemenag', label: 'Kementerian Agama', badge: '5' },
            { id: 'kemendesa', label: 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi', badge: '4' },
    { id: 'bps', label: 'Badan Pusat Statistik', badge: '3' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedKL(tabId);
  };

  const handleKLSelect = (klName) => {
    const klMapping = {
      'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan': 'kemenko-pmk',
            'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi': 'kemendikdasmen',
      'Kementerian Kesehatan': 'kemenkes',
      'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional': 'kemendukbangga',
      'Kementerian Sosial': 'kemensos',
      'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak': 'kemen-pppa',
      'Kementerian Dalam Negeri': 'kemendagri',
      'Badan Perencanaan Pembangunan Nasional': 'bappenas',
      'Kementerian Agama': 'kemenag',
      'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi': 'kemendesa',
      'Badan Pusat Statistik': 'bps'
    };

    const tabId = klMapping[klName];
    if (tabId) handleTabChange(tabId);
    if (onKLSelect) onKLSelect(klName, tabId);
  };

  const handleProgramSelect = (program) => {
    if (onProgramSelect) onProgramSelect(program, getCurrentKLData());
  };

  const handleDataExport = (data) => {
    if (onDataExport) onDataExport(data, getCurrentKLData());
  };

  if (internalError) {
    return (
      <div className={`bg-gray-50 font-sans ${className}`}>
        {showBreadcrumb && <PAUDBreadcrumb items={breadcrumbItems} />}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <PAUDEmptyState 
            icon={AlertCircle}
            title="Terjadi Kesalahan"
            description={internalError.message || "Gagal memuat data dashboard"}
            action={
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang
              </button>
            }
          />
        </div>
      </div>
    );
  }

  if (internalLoading) {
    return (
      <div className={`bg-gray-50 font-sans ${className}`}>
        {showBreadcrumb && <PAUDBreadcrumb items={breadcrumbItems} />}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <PAUDLoadingSpinner size="xl" className="mx-auto mb-4" />
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Memuat Dashboard PAUDHI
              </div>
              <div className="text-sm text-gray-500">
                Sedang mengambil data terbaru...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 font-sans ${className}`}>
      {showBreadcrumb && <PAUDBreadcrumb items={breadcrumbItems} />}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Real-time updates aktif</span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Terakhir update: {new Date(lastUpdate).toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>
          <button
            onClick={refreshData}
            disabled={internalLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${internalLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <PAUDRekapitulasiSection 
          onKLSelect={handleKLSelect}
          loading={internalLoading}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          dashboardData={dashboardData}
          getAvailableYears={getAvailableYears}
          refreshData={refreshData}
        />

        <PAUDKLHeader 
          loading={internalLoading}
          getCurrentKLData={getCurrentKLData}
          selectedKL={activeTab}
        />

        <PAUDSummaryGrid 
          loading={internalLoading}
          getCurrentKLData={getCurrentKLData}
          selectedKL={activeTab}
        />

        {/* Charts Section */}
        {!internalLoading && (
          <>
            {console.log('Chart data:', getChartData())}
            <PAUDDashboardCharts 
              chartData={getChartData()}
              selectedYear={selectedYear}
            />
          </>
        )}

        {showTabs && (
          <PAUDTabNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            tabs={tabs} 
          />
        )}

        <PAUDTabContent activeTab={activeTab} tabs={tabs}>
          {activeTab === 'kemenko-pmk' ? (
            <PAUDProgramTable 
              onProgramSelect={handleProgramSelect}
              onExport={handleDataExport}
              getCurrentKLData={getCurrentKLData}
              selectedKL={activeTab}
            />
          ) : (
            <PAUDEmptyState 
              icon={Construction}
              title="Data Sedang Dalam Pengembangan"
              description={`Detail program ${tabs.find(tab => tab.id === activeTab)?.label} akan segera tersedia`}
            />
          )}
        </PAUDTabContent>
      </div>
    </div>
  );
};

// Note: Other components (Compact, Embedded, KL Dashboard, Main Export) are unchanged
// Silakan gabungkan bagian ini ke file asli untuk update yang hanya menyentuh konflik loading/error


// ==================== DASHBOARD VARIANTS ====================

// Compact Dashboard - Hanya rekapitulasi
const PAUDCompactDashboard = ({ 
  className = '',
  showYearFilter = true,
  onKLSelect = null,
  // Data props
  selectedYear = 2025,
  setSelectedYear = null,
  dashboardData = {},
  getAvailableYears = null,
  refreshData = null,
  loading = false
}) => {
  return (
    <div className={`bg-gray-50 font-sans ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PAUDRekapitulasiSection 
          onKLSelect={onKLSelect}
          showYearFilter={showYearFilter}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          dashboardData={dashboardData}
          getAvailableYears={getAvailableYears}
          refreshData={refreshData}
          loading={loading}
        />
      </div>
    </div>
  );
};

// KL Dashboard - Fokus pada satu K/L
const PAUDKLDashboard = ({ 
  klId = 'kemenko-pmk',
  className = '',
  showBreadcrumb = false,
  onProgramSelect = null,
  // Data props
  selectedYear = 2025,
  setSelectedYear = null,
  dashboardData = {},
  getAvailableYears = null,
  refreshData = null,
  loading = false,
  getCurrentKLData = null,
  selectedKL = null
}) => {
  return (
    <div className={`bg-gray-50 font-sans ${className}`}>
      {showBreadcrumb && <PAUDBreadcrumb />}
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <PAUDKLHeader 
          loading={loading}
          getCurrentKLData={getCurrentKLData}
          selectedKL={selectedKL}
        />
        <PAUDSummaryGrid 
          loading={loading}
          getCurrentKLData={getCurrentKLData}
          selectedKL={selectedKL}
        />
        <PAUDProgramTable 
          onProgramSelect={onProgramSelect}
          getCurrentKLData={getCurrentKLData}
          selectedKL={selectedKL}
        />
      </div>
    </div>
  );
};

// Embedded Dashboard - Untuk iframe atau embed
const PAUDEmbeddedDashboard = ({ 
  height = '600px',
  showControls = false,
  theme = 'light',
  className = '',
  // Data props
  selectedYear = 2025,
  setSelectedYear = null,
  dashboardData = {},
  getAvailableYears = null,
  refreshData = null,
  loading = false,
  getCurrentKLData = null,
  selectedKL = null
}) => {
  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';

  return (
    <div 
      className={`${themeClasses} font-sans overflow-auto ${className}`}
      style={{ height }}
    >
      <div className="p-4 space-y-6">
        <PAUDRekapitulasiSection 
          showYearFilter={showControls}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          dashboardData={dashboardData}
          getAvailableYears={getAvailableYears}
          refreshData={refreshData}
          loading={loading}
        />
        {showControls && (
          <>
            <PAUDKLHeader 
              loading={loading}
              getCurrentKLData={getCurrentKLData}
              selectedKL={selectedKL}
            />
            <PAUDSummaryGrid 
              loading={loading}
              getCurrentKLData={getCurrentKLData}
              selectedKL={selectedKL}
            />
          </>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const PAUDDashboard = ({ 
  // Basic props
  showBreadcrumb = true,
  showTabs = true,
  className = '',
  
  // Data props
  initialData = null,
  apiEndpoint = null,
  
  // Customization props
  defaultTab = 'kemenko-pmk',
  breadcrumbItems = [],
  customTabs = null,
  
  // Event handlers
  onKLSelect = null,
  onProgramSelect = null,
  onDataExport = null,
  onError = null,
  
  // State management props
  loading: externalLoading = false,
  error: externalError = null,
  
  // Feature flags
  enableRealTimeUpdates = true,
  autoRefreshInterval = 30000, // 30 seconds
  
  // Styling props
  theme = 'light',
  compact = false
}) => {
  const {
    selectedYear,
    setSelectedYear,
    selectedKL,
    setSelectedKL,
    loading: internalLoading,
    error: internalError,
    dashboardData,
    filters,
    pagination,
    lastUpdate,
    getCurrentKLData,
    getFilteredPrograms,
    getAvailableYears,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    updateFilters,
    updatePagination,
    resetFilters,
    refreshData,
    setupRealTimeUpdates,
    cleanupRealTimeUpdates
  } = usePAUDPublicDashboard('2025');

  const loading = externalLoading || internalLoading;
  const error = externalError || internalError;

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefreshInterval && enableRealTimeUpdates) {
      const interval = setInterval(() => {
        refreshData();
      }, autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, enableRealTimeUpdates, refreshData]);

  // Setup real-time updates
  useEffect(() => {
    if (enableRealTimeUpdates) {
      setupRealTimeUpdates();
      return () => cleanupRealTimeUpdates();
    }
  }, [enableRealTimeUpdates, setupRealTimeUpdates, cleanupRealTimeUpdates]);

  // Compact version
  if (compact) {
    return (
      <PAUDCompactDashboard 
        className={className}
        onKLSelect={onKLSelect}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        dashboardData={dashboardData}
        getAvailableYears={getAvailableYears}
        refreshData={refreshData}
        loading={loading}
      />
    );
  }

  return (
    <PAUDDashboardContent
      showBreadcrumb={showBreadcrumb}
      showTabs={showTabs}
      defaultTab={defaultTab}
      onKLSelect={onKLSelect}
      onProgramSelect={onProgramSelect}
      onDataExport={onDataExport}
      loading={loading}
      error={error}
      className={className}
      breadcrumbItems={breadcrumbItems}
      customTabs={customTabs}
    />
  );
};

// ==================== HOOKS FOR EXTERNAL USE ====================

// Hook for dashboard analytics
const usePAUDAnalytics = () => {
  const trackEvent = (eventName, properties = {}) => {
    console.log('Analytics Event:', eventName, properties);
    // Implement analytics tracking here
  };
  
  const trackKLSelect = (klName) => {
    trackEvent('kl_selected', { kl_name: klName });
  };
  
  const trackProgramView = (programName) => {
    trackEvent('program_viewed', { program_name: programName });
  };
  
  const trackDataExport = (exportType) => {
    trackEvent('data_exported', { export_type: exportType });
  };
  
  return {
    trackKLSelect,
    trackProgramView,
    trackDataExport
  };
};

// ==================== CLEAN EXPORTS (NO CONFLICTS) ====================
export default PAUDDashboard;

// Named exports for variants and utilities
export {
  PAUDCompactDashboard,
  PAUDKLDashboard,
  PAUDEmbeddedDashboard,
  PAUDDashboardContent,
  PAUDTabContent,
  usePAUDAnalytics
};