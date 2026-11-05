// paudApiService.js - Service untuk koneksi ke backend RAN PAUD
import { API_BASE_URL } from './api'; // import dari satu file utils/api.js

class PAUDApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Set authentication token
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('PAUD API Error:', error);
      throw error;
    }
  }

  // ==================== RAN PAUD DATA ENDPOINTS ====================

  // Get all RAN PAUD data with filters
  async getRanPaudData(filters = {}) {
    const {
      page = 1,
      limit = 50,
      year,
      klId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (year) params.append('year', year);
    if (klId) params.append('klId', klId);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    return this.request(`/ran-paud?${params.toString()}`);
  }

  // Get achievement data by year
  async getAchievementByYear(year) {
    return this.request(`/ran-paud/achievement/${year}`);
  }

  // Get dashboard summary data
  async getDashboardSummary(year) {
    return this.request(`/ran-paud/dashboard-summary?year=${year}`);
  }

  // Get KL statistics
  async getKLStatistics(year) {
    return this.request(`/ran-paud/kl-statistics?year=${year}`);
  }

  // ==================== CRUD OPERATIONS ====================

  // Create new RAN PAUD entry
  async createRanPaud(data) {
    return this.request('/ran-paud', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Update RAN PAUD entry
  async updateRanPaud(id, data) {
    return this.request(`/ran-paud/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Delete RAN PAUD entry
  async deleteRanPaud(id) {
    return this.request(`/ran-paud/${id}`, {
      method: 'DELETE'
    });
  }

  // Get single RAN PAUD entry
  async getRanPaudById(id) {
    return this.request(`/ran-paud/${id}`);
  }

  // ==================== BULK OPERATIONS ====================

  // Bulk import RAN PAUD data
  async bulkImport(data) {
    return this.request('/ran-paud/bulk-import', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Bulk update RAN PAUD data
  async bulkUpdate(updates) {
    return this.request('/ran-paud/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // ==================== EXPORT OPERATIONS ====================

  // Export data to Excel
  async exportToExcel(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/ran-paud/export/excel?${params.toString()}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAN_PAUD_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Export data to CSV
  async exportToCSV(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/ran-paud/export/csv?${params.toString()}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAN_PAUD_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // ==================== REAL-TIME UPDATES ====================

  // Subscribe to real-time updates
  subscribeToUpdates(callback) {
    // WebSocket connection for real-time updates
    const wsUrl = this.baseURL.replace('http', 'ws') + '/ran-paud/updates';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected for PAUD updates');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return ws;
  }

  // ==================== UTILITY METHODS ====================

  // Get available years from data
  async getAvailableYears() {
    try {
      const response = await this.request('/ran-paud/available-years');
      return response.data || [2020, 2021, 2022, 2023, 2024, 2025];
    } catch (error) {
      console.warn('Failed to get available years, using default:', error);
      return [2020, 2021, 2022, 2023, 2024, 2025];
    }
  }

  // Get KL mapping
  async getKLMapping() {
    try {
      const response = await this.request('/ran-paud/kl-mapping');
      return response.data || {};
    } catch (error) {
      console.warn('Failed to get KL mapping, using default:', error);
      return {
        'KEMENKO_PMK': 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
        'KEMENDIKDASMEN': 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
        'KEMENAG': 'Kementerian Agama',
        'KEMENDES_PDT': 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi',
        'KEMENKES': 'Kementerian Kesehatan',
        'Kemendukbangga': 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional',
        'KEMENSOS': 'Kementerian Sosial',
        'KPPPA': 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak',
        'KEMENDAGRI': 'Kementerian Dalam Negeri',
        'BAPPENAS': 'Badan Perencanaan Pembangunan Nasional',
        'BPS': 'Badan Pusat Statistik'
      };
    }
  }

  // Transform backend data to frontend format
  transformBackendData(backendData) {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    return backendData.map(item => ({
      id: item._id,
      klId: item.klId,
      klName: item.klName,
      program: item.program,
      indikators: item.indikators || [],
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      updatedBy: item.updatedBy
    }));
  }

  // Transform frontend data to backend format
  transformFrontendData(frontendData) {
    return {
      klId: frontendData.klId,
      klName: frontendData.klName,
      program: frontendData.program,
      indikators: frontendData.indikators || [],
      status: frontendData.status || 'active'
    };
  }
}

// Create singleton instance
const paudApiService = new PAUDApiService();

export default paudApiService; 
