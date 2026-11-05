import { useState, useEffect, useCallback, useRef } from 'react';
import paudPublicApiService from '../utils/paudPublicApiService';
import apiService from '../utils/apiService';

// Constants
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

// Hook untuk akses publik ke dashboard PAUD (tanpa authentication)
export const usePAUDPublicDashboard = (initialYear = '2025', options = {}) => {
  const {
    fetchSummary = true,
    fetchKLStats = true,
    enablePolling = true,
  } = options;
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
    statistics: {},
    chartData: {}
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
    limit: 20
  });

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);

  // ==================== DATA FETCHING (PUBLIC ACCESS) ====================

  // Fetch dashboard summary data (public)
  const fetchDashboardSummary = useCallback(async (year) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paudPublicApiService.getDashboardSummaryPublic(year);

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
  }, []);

  // Fetch unified dashboard summary data (same as dashboard RAN)
  const fetchDashboardSummaryUnified = useCallback(async (year) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paudPublicApiService.getDashboardSummaryUnifiedPublic(year);

      if (response.success) {
        setDashboardData(prev => ({
          ...prev,
          rekap: {
            total: response.data.totalProgram || 0,
            onTrack: response.data.totalDone || 0,
            atRisk: response.data.totalProgress || 0,
            behind: response.data.totalBelum || 0,
            progress: 0, // Will be calculated
            klData: response.data.klSummary || []
          },
          klData: response.data.klSummary || {}
        }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching unified dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch KL statistics (public)
  const fetchKLStatistics = useCallback(async (year) => {
    try {
      const response = await paudPublicApiService.getKLStatisticsPublic(year);

      if (response.success) {
        setDashboardData(prev => ({
          ...prev,
          statistics: response.data || {}
        }));
      }
    } catch (err) {
      console.error('Error fetching KL statistics:', err);
    }
  }, []);

  // Fetch programs data (public)
  const fetchPrograms = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paudPublicApiService.getRanPaudDataPublic({
        year: selectedYear,
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters,
        ...params
      });

      let handled = false;
      if (response?.success) {
        const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        if (raw.length > 0) {
          const transformedData = paudPublicApiService.transformBackendData(raw);
          const chartData = paudPublicApiService.prepareChartData(raw, selectedYear);

          setDashboardData(prev => ({
            ...prev,
            programs: transformedData,
            chartData
          }));

          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination?.currentPage || response.data?.pagination?.currentPage || 1,
            totalPages: response.pagination?.totalPages || response.data?.pagination?.totalPages || 1,
            total: response.pagination?.total || response.data?.pagination?.total || raw.length
          }));
          handled = true;
        }
      }

      // Fallback: jika publik kosong/failed dan ada authToken, gunakan endpoint privat
      if (!handled && localStorage.getItem('authToken')) {
        try {
          const privateResp = await apiService.getRanPaudData({
            year: selectedYear,
            page: pagination.currentPage,
            limit: pagination.limit,
            ...filters,
            ...params
          });
          const privateRaw = Array.isArray(privateResp.data) ? privateResp.data : (privateResp.data?.data || []);
          const transformedData = paudPublicApiService.transformBackendData(privateRaw);
          const chartData = paudPublicApiService.prepareChartData(privateRaw, selectedYear);

          setDashboardData(prev => ({
            ...prev,
            programs: transformedData,
            chartData
          }));

          setPagination(prev => ({
            ...prev,
            currentPage: privateResp.pagination?.currentPage || privateResp.data?.pagination?.currentPage || 1,
            totalPages: privateResp.pagination?.totalPages || privateResp.data?.pagination?.totalPages || 1,
            total: privateResp.pagination?.total || privateResp.data?.pagination?.total || privateRaw.length
          }));
          handled = true;
        } catch (innerErr) {
          console.warn('Private fallback failed:', innerErr);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, pagination.currentPage, pagination.limit, filters]);

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

  // ==================== REAL-TIME UPDATES ====================

  // Setup WebSocket connection untuk public access
  const setupRealTimeUpdates = useCallback(() => {
    if (!enablePolling) return;
    try {
      // Untuk public access, gunakan polling sebagai alternatif WebSocket
      const interval = setInterval(() => {
        refreshData();
        setLastUpdate(new Date());
      }, 30000); // Update setiap 30 detik

      wsRef.current = { interval };
    } catch (err) {
      console.warn('Failed to setup real-time updates:', err);
    }
  }, [enablePolling, refreshData]);

  // Cleanup real-time updates
  const cleanupRealTimeUpdates = useCallback(() => {
    if (wsRef.current?.interval) {
      clearInterval(wsRef.current.interval);
      wsRef.current = null;
    }
  }, []);

  // Setup real-time updates on mount
  useEffect(() => {
    if (enablePolling) {
      setupRealTimeUpdates();
      return cleanupRealTimeUpdates;
    }
  }, [enablePolling, setupRealTimeUpdates, cleanupRealTimeUpdates]);

  // ==================== EFFECTS ====================

  // Main data fetching function
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use unified dashboard summary for consistent data
      await fetchDashboardSummaryUnified(selectedYear);
      await fetchKLStatistics(selectedYear);
      await fetchPrograms();

      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, fetchDashboardSummaryUnified, fetchKLStatistics, fetchPrograms]);

  // Initial data fetch
  useEffect(() => {
    if (fetchSummary) {
      refreshData();
    }
  }, [selectedYear, fetchSummary, refreshData]);

  // ==================== UTILITY FUNCTIONS ====================

  // Get current KL data
  const getCurrentKLData = useCallback(() => {
    if (!selectedKL || !dashboardData.klData) return null;
    return dashboardData.klData[selectedKL] || null;
  }, [selectedKL, dashboardData.klData]);

  // Get available years
  const getAvailableYears = useCallback(() => {
    return YEARS;
  }, []);

  // Get chart data
  const getChartData = useCallback(() => {
    return dashboardData.chartData || {};
  }, [dashboardData.chartData]);

  // Get statistics
  const getStatistics = useCallback(() => {
    return dashboardData.statistics || {};
  }, [dashboardData.statistics]);

  // Refresh all data (legacy method)
  const refreshAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchDashboardSummary(selectedYear),
        fetchKLStatistics(selectedYear),
        fetchPrograms()
      ]);
      
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing all data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, fetchDashboardSummary, fetchKLStatistics, fetchPrograms]);

  // ==================== RETURN VALUES ====================

  return {
    // State
    selectedYear,
    selectedKL,
    loading,
    error,
    dashboardData,
    filters,
    pagination,
    lastUpdate,

    // Actions
    setSelectedYear,
    setSelectedKL,
    updateFilters,
    updatePagination,
    resetFilters,
    refreshData,
    refreshAllData,

    // Real-time
    setupRealTimeUpdates,
    cleanupRealTimeUpdates,

    // Data getters
    getCurrentKLData,
    getAvailableYears,
    getChartData,
    getStatistics,
  };
};
