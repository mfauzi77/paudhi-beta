import { useState, useEffect, useCallback, useRef } from 'react';
import paudApiService from '../utils/paudApiService';

// Tambahkan parameter apiEndpoint
export const usePAUDDashboard = (initialYear = '2025', apiEndpoint = null) => {
  // State management
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedKL, setSelectedKL] = useState('kemenko-pmk');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [dashboardData, setDashboardData] = useState({
    rekap: {},
    klData: {},
    programs: [],
    statistics: {}
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    klId: ''
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 50
  });

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);

  // ==================== DATA FETCHING ====================

  // Fetch dashboard summary data
  const fetchDashboardSummary = useCallback(async (year) => {
    try {
      setLoading(true);
      setError(null);

      // Gunakan endpoint custom jika ada
      let response;
      if (apiEndpoint) {
        response = await paudApiService.getDashboardSummaryCustom(year, apiEndpoint);
      } else {
        response = await paudApiService.getDashboardSummary(year);
      }

      if (response.success) {
        setDashboardData(prev => ({
          ...prev,
          rekap: response.data.rekap || {},
          klData: response.data.klData || {}
        }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  // Fetch KL statistics
  const fetchKLStatistics = useCallback(async (year) => {
    try {
      let response;
      if (apiEndpoint) {
        response = await paudApiService.getKLStatisticsCustom(year, apiEndpoint);
      } else {
        response = await paudApiService.getKLStatistics(year);
      }

      if (response.success) {
        setDashboardData(prev => ({
          ...prev,
          statistics: response.data || {}
        }));
      }
    } catch (err) {
      console.error('Error fetching KL statistics:', err);
    }
  }, [apiEndpoint]);

  // Fetch programs data
  const fetchPrograms = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (apiEndpoint) {
        response = await paudApiService.getRanPaudDataCustom({
          year: selectedYear,
          page: pagination.currentPage,
          limit: pagination.limit,
          ...filters,
          ...params
        }, apiEndpoint);
      } else {
        response = await paudApiService.getRanPaudData({
          year: selectedYear,
          page: pagination.currentPage,
          limit: pagination.limit,
          ...filters,
          ...params
        });
      }

      if (response.success) {
        const transformedData = paudApiService.transformBackendData(response.data);

        setDashboardData(prev => ({
          ...prev,
          programs: transformedData
        }));

        setPagination(prev => ({
          ...prev,
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total
        }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, pagination.currentPage, pagination.limit, filters, apiEndpoint]);
  // ==================== CRUD OPERATIONS ====================
  
  // Create new program
  const createProgram = useCallback(async (programData) => {
    try {
      setLoading(true);
      setError(null);
      
      const transformedData = paudApiService.transformFrontendData(programData);
      const response = await paudApiService.createRanPaud(transformedData);
      
      if (response.success) {
        // Refresh data after creation
        await fetchPrograms();
        setLastUpdate(new Date());
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating program:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPrograms]);
  
  // Update program
  const updateProgram = useCallback(async (id, programData) => {
    try {
      setLoading(true);
      setError(null);
      
      const transformedData = paudApiService.transformFrontendData(programData);
      const response = await paudApiService.updateRanPaud(id, transformedData);
      
      if (response.success) {
        // Refresh data after update
        await fetchPrograms();
        setLastUpdate(new Date());
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating program:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPrograms]);
  
  // Delete program
  const deleteProgram = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paudApiService.deleteRanPaud(id);
      
      if (response.success) {
        // Refresh data after deletion
        await fetchPrograms();
        setLastUpdate(new Date());
        return true;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting program:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPrograms]);
  
  // ==================== FILTERS & PAGINATION ====================
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);
  
  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      klId: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);
  
  // ==================== EXPORT OPERATIONS ====================
  
  // Export to Excel
  const exportToExcel = useCallback(async () => {
    try {
      await paudApiService.exportToExcel({
        year: selectedYear,
        ...filters
      });
    } catch (err) {
      setError(err.message);
      console.error('Error exporting to Excel:', err);
    }
  }, [selectedYear, filters]);
  
  // Export to CSV
  const exportToCSV = useCallback(async () => {
    try {
      await paudApiService.exportToCSV({
        year: selectedYear,
        ...filters
      });
    } catch (err) {
      setError(err.message);
      console.error('Error exporting to CSV:', err);
    }
  }, [selectedYear, filters]);
  
  // ==================== REAL-TIME UPDATES ====================
  
  // Setup WebSocket connection
  const setupRealTimeUpdates = useCallback(() => {
    try {
      wsRef.current = paudApiService.subscribeToUpdates((data) => {
        // Handle real-time updates
        if (data.type === 'program_updated' || data.type === 'program_created' || data.type === 'program_deleted') {
          // Refresh data when changes occur
          fetchPrograms();
          setLastUpdate(new Date());
        }
      });
    } catch (err) {
      console.warn('Failed to setup real-time updates:', err);
    }
  }, [fetchPrograms]);
  
  // Cleanup WebSocket connection
  const cleanupRealTimeUpdates = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  // ==================== EFFECTS ====================
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardSummary(selectedYear);
    fetchKLStatistics(selectedYear);
    fetchPrograms();
  }, [selectedYear, fetchDashboardSummary, fetchKLStatistics, fetchPrograms]);

  // Setup real-time updates
  useEffect(() => {
    setupRealTimeUpdates();

    return () => {
      cleanupRealTimeUpdates();
    };
  }, [setupRealTimeUpdates, cleanupRealTimeUpdates]);

  
  // ==================== UTILITY FUNCTIONS ====================
  
  // Get current KL data
  const getCurrentKLData = useCallback(() => {
    // Map frontend KL ID to backend KL ID
    const klMapping = {
      'kemenko-pmk': 'KEMENKO_PMK',
      'kemendikdasmen': 'KEMENDIKDASMEN',
      'kemenag': 'KEMENAG',
      'kemendesa': 'KEMENDES_PDT',
      'kemenkes': 'KEMENKES',
      'Kemendukbangga': 'Kemendukbangga',
      'kemensos': 'KEMENSOS',
      'kemen-pppa': 'KPPPA',
      'kemendagri': 'KEMENDAGRI',
      'bappenas': 'BAPPENAS',
      'bps': 'BPS'
    };
    
    const backendKLId = klMapping[selectedKL] || selectedKL;
    const klData = dashboardData.klData[backendKLId] || {};
    
    return {
      name: klData.name || 'Kementerian/Lembaga',
      description: klData.description || 'Deskripsi K/L',
      type: klData.type || 'Kementerian',
      role: klData.role || 'Penyelenggara',
      programs: klData.programs || 0,
      total: klData.total || 0,
      onTrack: klData.onTrack || 0,
      atRisk: klData.atRisk || 0,
      behind: klData.behind || 0,
      progress: klData.progress || 0,
      programList: klData.programList || []
    };
  }, [dashboardData.klData, selectedKL]);
  
  // Get filtered programs
  const getFilteredPrograms = useCallback(() => {
    return dashboardData.programs.filter(program => {
      const matchesSearch = !filters.search || 
        program.program.toLowerCase().includes(filters.search.toLowerCase()) ||
        program.klName.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || 
        program.status === filters.status;
      
      const matchesKL = !filters.klId || 
        program.klId === filters.klId;
      
      return matchesSearch && matchesStatus && matchesKL;
    });
  }, [dashboardData.programs, filters]);
  
  // Get available years
  const getAvailableYears = useCallback(async () => {
    try {
      const years = await paudApiService.getAvailableYears();
      return Array.isArray(years) ? years : [2020, 2021, 2022, 2023, 2024, 2025];
    } catch (err) {
      console.warn('Failed to get available years:', err);
      return [2020, 2021, 2022, 2023, 2024, 2025];
    }
  }, []);

  // Export data function
  const exportData = useCallback(async (data, format = 'excel') => {
    try {
      if (format === 'excel') {
        await exportToExcel();
      } else if (format === 'csv') {
        await exportToCSV();
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  }, [exportToExcel, exportToCSV]);
  
  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchDashboardSummary(selectedYear),
      fetchKLStatistics(selectedYear),
      fetchPrograms()
    ]);
    setLastUpdate(new Date());
  }, [selectedYear, fetchDashboardSummary, fetchKLStatistics, fetchPrograms]);
  
  // ==================== RETURN VALUES ====================
  
   return {
    // State
    selectedYear,
    setSelectedYear,
    selectedKL,
    setSelectedKL,
    loading,
    error,
    dashboardData,
    filters,
    pagination,
    lastUpdate,

    // Data getters
    getCurrentKLData,
    getFilteredPrograms,
    getAvailableYears,
    exportData,

    // Actions
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    updateFilters,
    updatePagination,
    resetFilters,
    exportToExcel,
    exportToCSV,
    refreshData,

    // Real-time
    setupRealTimeUpdates,
    cleanupRealTimeUpdates
  };
};