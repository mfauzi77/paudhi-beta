// paudPublicApiService.js - Service untuk akses publik ke data RAN PAUD
import { API_BASE_URL } from './api'; // import dari satu file utils/api.js

class PAUDPublicApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get headers tanpa authentication untuk akses publik
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Generic request method untuk akses publik
  async request(endpoint, options = {}, retries = 2) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        // Simple retry/backoff for 429
        if (response.status === 429 && retries > 0) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
          const waitMs = Math.max(500, retryAfter * 1000 * (3 - retries));
          await new Promise(r => setTimeout(r, waitMs));
          return this.request(endpoint, options, retries - 1);
        }
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('PAUD Public API Error:', error);
      throw error;
    }
  }

  // ==================== PUBLIC RAN PAUD DATA ENDPOINTS ====================

  // Get all RAN PAUD data dengan filters (public access)
  async getRanPaudDataPublic(filters = {}) {
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

    return this.request(`/ran-paud/public?${params.toString()}`);
  }

  // Get achievement data by year (public access)
  async getAchievementByYearPublic(year) {
    return this.request(`/ran-paud/achievement/${year}/public`);
  }

  // Get dashboard summary data (public access)
  async getDashboardSummaryPublic(year) {
    return this.request(`/ran-paud/dashboard-summary/${year}/public`);
  }

  // Get unified dashboard summary data (public access)
  async getDashboardSummaryUnifiedPublic(year) {
    const params = year ? `?year=${year}` : '';
    return this.request(`/ran-paud/dashboard-summary-unified/public${params}`);
  }

  // Get KL statistics (public access)
  async getKLStatisticsPublic(year) {
    return this.request(`/ran-paud/kl-statistics/${year}/public`);
  }

  // Get program details by ID (public access)
  async getRanPaudByIdPublic(id) {
    return this.request(`/ran-paud/${id}/public`);
  }

  // Get available years (public access)
  async getAvailableYearsPublic() {
    return this.request('/ran-paud/years/public');
  }

  // Get KL mapping (public access)
  async getKLMappingPublic() {
    return this.request('/ran-paud/kl-mapping/public');
  }

  // Get KL detail data (public access)
  async getKLDetailPublic(klId, year) {
    const params = year ? `?year=${year}` : '';
    return this.request(`/ran-paud/kl-detail/${klId}${params}`);
  }

  // ==================== DATA TRANSFORMATION ====================

  // Transform backend data untuk frontend
  transformBackendData(backendData) {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }

    const results = [];
    backendData.forEach(item => {
      // New shape: item.indikators is an array, each with its own tahunData
      if (Array.isArray(item.indikators) && item.indikators.length > 0) {
        item.indikators.forEach((indikatorObj, index) => {
          const tahunData = indikatorObj?.tahunData || [];
          results.push({
            id: `${item._id || item.id}:${indikatorObj._id || index}`,
            klId: item.klId,
            klName: item.klName,
            program: item.program,
            indikator: indikatorObj.indikator,
            targetSatuan: indikatorObj.targetSatuan,
            tahunData,
            status: this.calculateStatus({ tahunData }),
            progress: this.calculateProgress({ tahunData }),
            lastUpdate: item.updatedAt || item.createdAt,
            createdAt: item.createdAt
          });
        });
      } else {
        // Legacy shape fallback
        results.push({
          id: item._id || item.id,
          klId: item.klId,
          klName: item.klName,
          program: item.program,
          indikator: item.indikator,
          targetSatuan: item.targetSatuan,
          tahunData: item.tahunData || [],
          status: this.calculateStatus(item),
          progress: this.calculateProgress(item),
          lastUpdate: item.updatedAt || item.createdAt,
          createdAt: item.createdAt
        });
      }
    });

    return results;
  }

  // Calculate status berdasarkan data
  calculateStatus(item) {
    if (!item.tahunData || item.tahunData.length === 0) {
      return 'BELUM LAPORAN';
    }

    const currentYear = new Date().getFullYear();
    const yearData = item.tahunData.find(data => parseInt(data.tahun) === currentYear);
    
    if (!yearData) {
      return 'BELUM LAPORAN';
    }

    if (yearData.kategori === 'TERCAPAI') {
      return 'TERCAPAI';
    } else if (yearData.kategori === 'TIDAK TERCAPAI') {
      return 'TIDAK TERCAPAI';
    } else {
      return 'BELUM LAPORAN';
    }
  }

  // Calculate progress percentage
  calculateProgress(item) {
    if (!item.tahunData || item.tahunData.length === 0) {
      return 0;
    }

    const currentYear = new Date().getFullYear();
    const yearData = item.tahunData.find(data => parseInt(data.tahun) === currentYear);
    
    if (!yearData || !yearData.persentase) {
      return 0;
    }

    return Math.min(100, Math.max(0, yearData.persentase));
  }

  // ==================== CHART DATA PREPARATION ====================

  // Prepare chart data untuk visualisasi
  prepareChartData(data, year) {
    // Validate input data
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data for chart preparation:', data);
      return {
        klData: [],
        programData: [],
        achievementData: []
      };
    }

    const klData = {};
    const programData = [];
    const achievementData = [];

    data.forEach(item => {
      if (!item || !item.klId || !item.klName) {
        console.warn('Invalid item data:', item);
        return;
      }

      const yearData = item.tahunData?.find(d => d.tahun === parseInt(year));
      
      if (yearData) {
        // KL Data aggregation
        if (!klData[item.klId]) {
          klData[item.klId] = {
            name: item.klName,
            total: 0,
            tercapai: 0,
            tidakTercapai: 0,
            belumLaporan: 0
          };
        }

        klData[item.klId].total++;
        
        if (yearData.kategori === 'TERCAPAI') {
          klData[item.klId].tercapai++;
        } else if (yearData.kategori === 'TIDAK TERCAPAI') {
          klData[item.klId].tidakTercapai++;
        } else {
          klData[item.klId].belumLaporan++;
        }

        // Program data
        programData.push({
          name: item.program,
          kl: item.klName,
          target: yearData.target,
          realisasi: yearData.realisasi,
          progress: yearData.persentase || 0,
          status: yearData.kategori
        });

        // Achievement data
        achievementData.push({
          kl: item.klName,
          program: item.program,
          target: yearData.target,
          realisasi: yearData.realisasi,
          persentase: yearData.persentase || 0
        });
      }
    });

    console.log('Prepared chart data:', {
      klData: Object.values(klData),
      programData: programData.length,
      achievementData: achievementData.length
    });

    return {
      klData: Object.values(klData),
      programData,
      achievementData
    };
  }

  // ==================== STATISTICS CALCULATION ====================

  // Calculate overall statistics
  calculateStatistics(data, year) {
    const yearData = data.filter(item => 
      item.tahunData?.some(d => d.tahun === parseInt(year))
    );

    const total = yearData.length;
    const tercapai = yearData.filter(item => {
      const yearItem = item.tahunData.find(d => d.tahun === parseInt(year));
      return yearItem?.kategori === 'TERCAPAI';
    }).length;

    const tidakTercapai = yearData.filter(item => {
      const yearItem = item.tahunData.find(d => d.tahun === parseInt(year));
      return yearItem?.kategori === 'TIDAK TERCAPAI';
    }).length;

    const belumLaporan = total - tercapai - tidakTercapai;

    return {
      total,
      tercapai,
      tidakTercapai,
      belumLaporan,
      progress: total > 0 ? Math.round((tercapai / total) * 100) : 0
    };
  }
}

// Create singleton instance
const paudPublicApiService = new PAUDPublicApiService();

export default paudPublicApiService;
