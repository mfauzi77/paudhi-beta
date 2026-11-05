// frontend/src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import apiService from '../utils/apiService';

// Generic hook untuk API calls
export const useApi = (apiCall, params = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(params);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Hook untuk News
export const useNews = (params = {}) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getNews(params);
        if (data.success && Array.isArray(data.data)) {
          setNews(data.data);
          setPagination({
            totalPages: data.pagination?.totalPages || data.totalPages,
            currentPage: data.pagination?.currentPage || data.currentPage,
            total: data.pagination?.total || data.total
          });
        } else {
          setNews(data.news || data || []);
          setPagination({
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            total: data.total
          });
        }
      } catch (err) {
        setError(err.message);
        console.error('News fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [JSON.stringify(params)]);

  return { news, loading, error, pagination };
};

// Hook untuk FAQ
export const useFAQs = (params = {}) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getFAQs(params);
        setFaqs(data || []);
      } catch (err) {
        setError(err.message);
        console.error('FAQ fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [JSON.stringify(params)]);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFAQs(params);
      setFaqs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { faqs, loading, error, refetch };
};

// Hook untuk Authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd verify the token with backend
      // For now, we'll assume it's valid
      setUser({ token });
    }
  }, []);

  return { user, login, logout, loading, error };
};

// Hook untuk Single News Item
export const useNewsItem = (id) => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getNewsById(id);
        // Handle PostgreSQL wrapped response
        setNews(data.success ? data.data : data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  return { news, loading, error };
};

// Hook untuk Health Check
export const useHealthCheck = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await apiService.healthCheck();
        setStatus(data);
      } catch (err) {
        setStatus({ status: 'ERROR', message: err.message });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { status, loading };
};

// ===== PEMBELAJARAN HOOKS - TAMBAHAN BARU =====

// Hook untuk single type pembelajaran (panduan, video, tools)
export const usePembelajaran = (type = 'panduan', options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const {
    limit = 20,
    autoLoad = true,
    filters = {},
    sortBy = 'publishDate',
    sortOrder = 'desc'
  } = options;

  // Fetch data function
  const fetchData = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        type,
        page: pageNum,
        limit,
        sortBy,
        sortOrder,
        ...filters
      };

      const response = await apiService.getPembelajaranPublic(params);
      const formattedData = response.data || [];

      if (reset || pageNum === 1) {
        setData(formattedData);
      } else {
        setData(prev => [...prev, ...formattedData]);
      }

      // Check if there's more data
      setHasMore(formattedData.length === limit);
      setPage(pageNum);

    } catch (err) {
      console.error('Error fetching pembelajaran:', err);
      setError(err.message || 'Gagal memuat data pembelajaran');
      
      if (pageNum === 1) {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [type, limit, sortBy, sortOrder, JSON.stringify(filters)]);

  // Load more data
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1, false);
    }
  }, [fetchData, loading, hasMore, page]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  // Search function
  const search = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);

      if (!query.trim()) {
        await fetchData(1, true);
        return;
      }

      const results = await apiService.searchPembelajaran(query, { 
        type,
        ...filters 
      });
      
      setData(results || []);
      setHasMore(false); // Search results don't have pagination
      setPage(1);

    } catch (err) {
      console.error('Error searching pembelajaran:', err);
      setError(err.message || 'Gagal mencari data pembelajaran');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [type, fetchData, JSON.stringify(filters)]);

  // Track interaction
  const trackInteraction = useCallback(async (itemId, interactionType = 'view') => {
    try {
      await apiService.incrementPembelajaranStat(itemId, interactionType);
      
      // Update local data to reflect the change
      setData(prevData => 
        prevData.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              [interactionType + 's']: (item[interactionType + 's'] || 0) + 1
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.warn('Failed to track interaction:', err);
      // Don't show error to user, tracking is not critical
    }
  }, []);

  // Auto load effect
  useEffect(() => {
    if (autoLoad) {
      fetchData(1, true);
    }
  }, [fetchData, autoLoad]);

  // Calculate stats
  const stats = {
    total: data.length,
    totalViews: data.reduce((sum, item) => sum + (item.views || 0), 0),
    totalDownloads: data.reduce((sum, item) => sum + (item.downloads || 0), 0),
    averageRating: data.length > 0 
      ? data.reduce((sum, item) => sum + (item.rating || 0), 0) / data.length 
      : 0
  };

  const isEmpty = !loading && data.length === 0;

  return {
    // Data
    data,
    loading,
    error,
    hasMore,
    page,
    isEmpty,
    stats,
    
    // Actions
    loadMore,
    refresh,
    search,
    trackInteraction,
    
    // Manual fetch
    fetchData: (pageNum, reset) => fetchData(pageNum, reset)
  };
};

// Hook untuk semua jenis pembelajaran sekaligus
export const useAllPembelajaran = (options = {}) => {
  const panduanHook = usePembelajaran('panduan', { ...options, limit: 6 });
  const videoHook = usePembelajaran('video', { ...options, limit: 6 });
  const toolsHook = usePembelajaran('tools', { ...options, limit: 6 });

  const loading = panduanHook.loading || videoHook.loading || toolsHook.loading;
  const error = panduanHook.error || videoHook.error || toolsHook.error;

  const refresh = useCallback(() => {
    panduanHook.refresh();
    videoHook.refresh();
    toolsHook.refresh();
  }, [panduanHook.refresh, videoHook.refresh, toolsHook.refresh]);

  const search = useCallback(async (query) => {
    await Promise.all([
      panduanHook.search(query),
      videoHook.search(query),
      toolsHook.search(query)
    ]);
  }, [panduanHook.search, videoHook.search, toolsHook.search]);

  return {
    panduan: panduanHook,
    video: videoHook,
    tools: toolsHook,
    loading,
    error,
    refresh,
    search
  };
};

// Hook untuk pembelajaran detail
export const usePembelajaranDetail = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPembelajaranDetail(id);
      setData(response);
    } catch (err) {
      console.error('Error fetching pembelajaran detail:', err);
      setError(err.message || 'Gagal memuat detail pembelajaran');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    loading,
    error,
    refresh: fetchDetail
  };
};

// Hook untuk global search di semua pembelajaran
export const usePembelajaranSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);

      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      const response = await apiService.searchPembelajaran(searchQuery, filters);
      setResults(response || []);
    } catch (err) {
      console.error('Error searching pembelajaran:', err);
      setError(err.message || 'Gagal mencari pembelajaran');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    query,
    search,
    clearSearch
  };
};

// Hook untuk pembelajaran categories
export const usePembelajaranCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getCategories();
        setCategories(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Categories fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Hook untuk popular tags
export const usePembelajaranTags = (limit = 20) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getPopularTags({ limit });
        setTags(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Tags fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [limit]);

  return { tags, loading, error };
};

// Hook untuk featured pembelajaran
export const useFeaturedPembelajaran = (limit = 6) => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getFeaturedPembelajaran({ limit });
        setFeatured(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Featured fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { featured, loading, error };
};