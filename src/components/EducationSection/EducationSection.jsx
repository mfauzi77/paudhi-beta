// EducationSection.jsx - UPDATED VERSION DENGAN API INTEGRATION
import React, { useState, useCallback, useEffect } from 'react';

// Import semua komponen child
import PanduanHolistik from './PanduanHolistik';
import VideoIntegratif from './VideoIntegratif';
import ToolsAssessment from './ToolsAssessment';
import StudiKasus from './StudiKasus';
import DigitalResources from './DigitalResources';
import Modal from './Modal';
import { tabsConfig } from './data';
import { getTabColorClasses } from './utils';

// Import API service
import apiService from '../../utils/apiService';

const EducationSection = () => {
  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState('panduan');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ===== NEW: API DATA STATE =====
  const [apiData, setApiData] = useState({
    panduan: [],
    video: [],
    tools: []
  });
  const [loading, setLoading] = useState({
    panduan: true,
    video: true,
    tools: true
  });
  const [error, setError] = useState({
    panduan: null,
    video: null,
    tools: null
  });
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // ===== FETCH DATA FROM API =====
  const fetchPembelajaranData = async (type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      setError(prev => ({ ...prev, [type]: null }));

      console.log(`🚀 Fetching ${type} data from API...`);
      
      const response = await apiService.getPembelajaran({
        type: type,
        limit: 20,
        sortBy: 'publishDate',
        sortOrder: 'desc'
      });

      // Handle response structure
      const data = response?.data || response || [];
      
      console.log(`✅ ${type} data received:`, data.length, 'items');
      
      setApiData(prev => ({
        ...prev,
        [type]: Array.isArray(data) ? data : []
      }));

      setConnectionStatus('connected');

    } catch (error) {
      console.error(`❌ Error fetching ${type} data:`, error);
      setError(prev => ({
        ...prev,
        [type]: error.message || 'Gagal memuat data'
      }));
      
      if (error.message?.includes('Koneksi ke server gagal')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // ===== INITIAL DATA FETCH =====
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing EducationSection data...');
      
      // Test connection first
      try {
        const connectionTest = await apiService.testConnection();
        if (connectionTest.success) {
          setConnectionStatus('connected');
          console.log('✅ Backend connection successful');
          
          // Fetch all types of pembelajaran
          await Promise.all([
            fetchPembelajaranData('panduan'),
            fetchPembelajaranData('video'),
            fetchPembelajaranData('tools')
          ]);
        } else {
          setConnectionStatus('disconnected');
          console.warn('⚠️ Backend not connected, using fallback data');
        }
      } catch (error) {
        console.error('❌ Connection test failed:', error);
        setConnectionStatus('disconnected');
      }
    };

    initializeData();
  }, []);

  // ===== REFRESH DATA FUNCTION =====
  const refreshData = useCallback(async (type = null) => {
    console.log('🔄 Refreshing data...', type || 'all types');
    
    if (type) {
      await fetchPembelajaranData(type);
    } else {
      // Refresh all
      setConnectionStatus('checking');
      await Promise.all([
        fetchPembelajaranData('panduan'),
        fetchPembelajaranData('video'),
        fetchPembelajaranData('tools')
      ]);
    }
  }, []);

  // ===== UPDATE STATS WHEN ITEM IS VIEWED =====
  const handleItemView = useCallback(async (item) => {
    try {
      // Update view count di backend
      if (item._id && connectionStatus === 'connected') {
        console.log('👀 Updating view count for:', item.title);
        await apiService.request(`/pembelajaran/${item._id}/stats`, {
          method: 'PATCH',
          body: JSON.stringify({ type: 'view' })
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to update view stats:', error);
    }
  }, [connectionStatus]);

  // ===== HANDLE DOWNLOAD STATS =====
  const handleItemDownload = useCallback(async (item) => {
    try {
      if (item._id && connectionStatus === 'connected') {
        console.log('📥 Updating download count for:', item.title);
        await apiService.request(`/pembelajaran/${item._id}/stats`, {
          method: 'PATCH',
          body: JSON.stringify({ type: 'download' })
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to update download stats:', error);
    }
  }, [connectionStatus]);

  // ===== MODAL HANDLERS =====
  const openModal = useCallback((item) => {
    console.log('🔍 Opening modal for:', item.title);
    setSelectedItem(item);
    setIsModalOpen(true);
    
    // Update view stats
    handleItemView(item);
  }, [handleItemView]);

  const closeModal = useCallback(() => {
    console.log('❌ Closing modal');
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  // ===== TAB CHANGE HANDLER =====
  const handleTabChange = useCallback((tabId) => {
    console.log('📑 Switching to tab:', tabId);
    setActiveTab(tabId);
  }, []);

  // ===== CONNECTION STATUS COMPONENT - DISABLED =====
  const ConnectionStatus = () => {
    // Connection status disembunyikan untuk UI yang lebih clean
    // Hanya tampil jika ada masalah koneksi atau dalam development mode
    if (process.env.NODE_ENV === 'development') {
      if (connectionStatus === 'checking') {
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
              <span className="text-yellow-800 text-sm">Menghubungkan ke server...</span>
            </div>
          </div>
        );
      }
      
      if (connectionStatus === 'disconnected') {
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-orange-800 text-sm">Mode offline - menampilkan data contoh</span>
              </div>
              <button 
                onClick={() => refreshData()}
                className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded text-xs transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        );
      }
    }
    
    // Status "connected" tidak ditampilkan untuk UI yang lebih clean
    return null;
  };

  // ===== GET DATA COUNT FOR TABS =====
  const getDataCount = (tabId) => {
    if (loading[tabId]) return '...';
    if (error[tabId]) return '!';
    return apiData[tabId]?.length || 0;
  };

  // ===== RENDER LOGIC DENGAN API DATA =====
  const renderActiveComponent = () => {
    const currentData = apiData[activeTab] || [];
    const currentLoading = loading[activeTab];
    const currentError = error[activeTab];

    // Props untuk komponen child
    const childProps = {
      onItemClick: openModal,
      onItemDownload: handleItemDownload,
      data: currentData,
      loading: currentLoading,
      error: currentError,
      onRefresh: () => refreshData(activeTab),
      connectionStatus
    };

    switch (activeTab) {
      case 'panduan':
        return <PanduanHolistik {...childProps} />;
      case 'video':
        return <VideoIntegratif {...childProps} />;
      case 'tools':
        return <ToolsAssessment {...childProps} />;
      case 'kasus':
        return <StudiKasus />;
      case 'digital':
        return <DigitalResources />;
      default:
        return <PanduanHolistik {...childProps} />;
    }
  };

  return (
    <div>
      <section id="edukasi" className="pt-20 pb-8 bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* ===== HEADER SECTION ===== */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Pusat Sumber Edukasi
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Pengembangan Anak Usia Dini Holistik Integratif
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Platform komprehensif yang mengintegrasikan 6 aspek perkembangan anak
            </p>
            
            {/* Connection status hanya untuk development/debugging */}
            {(connectionStatus === 'checking' || connectionStatus === 'disconnected') && (
              <div className="max-w-md mx-auto mt-8">
                <ConnectionStatus />
              </div>
            )}
          </div>

          {/* ===== TABS NAVIGATION ===== */}
          <div className="flex flex-wrap justify-center gap-3 mb-8" role="tablist">
            {tabsConfig.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${getTabColorClasses(tab.color, activeTab === tab.id)}`}
              >
                <i className={tab.icon}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                
                {/* Data count - bisa disembunyikan jika diinginkan */}
                {(tab.id === 'panduan' || tab.id === 'video' || tab.id === 'tools') && process.env.NODE_ENV === 'development' && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getDataCount(tab.id)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ===== CONTENT AREA ===== */}
          <div role="tabpanel" id={`tabpanel-${activeTab}`}>
            {renderActiveComponent()}
          </div>

          {/* Debug info dan refresh button dihilangkan untuk production */}
        </div>
      </section>

      {/* ===== MODAL COMPONENT ===== */}
      {isModalOpen && selectedItem && (
        <Modal 
          item={selectedItem} 
          activeTab={activeTab} 
          onClose={closeModal}
          onDownload={() => handleItemDownload(selectedItem)}
        />
      )}
    </div>
  );
};

export default EducationSection;
