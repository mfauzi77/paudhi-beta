import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ChevronDown, LogOut, BarChart3, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../pages/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import LogoutConfirmModal from './LogoutConfirmModal';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Search functionality with debounce
  const searchTimeoutRef = useRef(null);
  
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const searchPromises = [
        apiService.searchNews(query).catch(() => ({ data: [] })),
        apiService.searchRanPaud(query).catch(() => ({ data: [] })),
        apiService.searchPembelajaran(query).catch(() => ({ data: [] }))
      ];

      const [newsResults, ranPaudResults, pembelajaranResults] = await Promise.all(searchPromises);

      // Extract results safely
      const newsArr = Array.isArray(newsResults?.data) ? newsResults.data : [];
      const ranPaudArr = Array.isArray(ranPaudResults?.data) ? ranPaudResults.data : [];
      const pembArr = Array.isArray(pembelajaranResults?.data) ? pembelajaranResults.data : (Array.isArray(pembelajaranResults) ? pembelajaranResults : []);

      const results = [
        ...newsArr.map(item => ({
          ...item,
          type: 'news',
          title: item.title,
          description: (item.excerpt || item.content || '').substring(0, 100).replace(/<[^>]*>/g, '').trim() + '...',
          url: `/news/${item.id || item._id}`,
          image: item.image
        })),
        ...ranPaudArr.map(item => ({
          ...item,
          type: 'ranpaud',
          title: `${item.klName || ''} - ${item.program || ''}`,
          description: `Program RAN PAUDHI dari ${item.klName || ''}`,
          url: `/ran-paud-dashboard`,
          image: null
        })),
        ...pembArr.map(item => ({
          ...item,
          type: 'pembelajaran',
          title: item.title || item.judul || item.nama,
          description: (item.description || item.deskripsi || 'Materi pembelajaran').substring(0, 100).replace(/<[^>]*>/g, '').trim() + '...',
          url: `/education`,
          image: item.thumbnail || item.image
        }))
      ];

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Gagal melakukan pencarian. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 500); // 500ms debounce
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setSearchTerm('');
    navigate(result.url);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Helper to resolve image URL
  const getResultImage = (result) => {
    if (!result.image) return null;
    if (result.image.startsWith('http')) return result.image;
    
    let backendOrigin;
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      backendOrigin = /^https?:\/\//i.test(apiBase) 
        ? apiBase.replace(/\/+$/, '').replace(/\/api\/?$/, '')
        : window.location.origin;
    } catch (e) {
      backendOrigin = window.location.origin;
    }
    
    return result.image.startsWith('/') 
      ? `${backendOrigin}${result.image}`
      : `${backendOrigin}/${result.image}`;
  };

  // Menu items shared between desktop and mobile
  const navItems = [
    { label: 'Beranda', path: '/' },
    { label: 'Tentang', path: '/about' },
    { label: 'Tanya Jawab PAUDHI', path: '/faq' },
    { label: 'Pelaporan PAUDHI', path: '/ran-paud-dashboard' },
    { label: 'Peta Daycare', path: '/peta-daycare' },
    { label: 'CERIA', path: '/ceria' },
  ];



  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="Beranda">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="PAUDHI Logo"
              />
            </div>
            <div className="ml-3 hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">SISMONEV CERIA</h1>
            </div>
          </Link>

          {/* Search Bar - Desktop only */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berita, program, atau materi..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => searchTerm.trim() && !isSearching && setShowSearchResults(true)}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {searchResults.length > 0 ? (
                  <div className="max-h-[70vh] overflow-y-auto">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Hasil Pencarian ({searchResults.length})
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.type}-${index}`}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearchResultClick(result);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                            {result.image ? (
                              <img 
                                src={getResultImage(result)} 
                                alt="" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '';
                                  e.target.parentNode.innerHTML = '<div class="text-blue-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"></path></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="text-gray-400">
                                {result.type === 'news' && <FileText className="h-5 w-5 text-blue-500" />}
                                {result.type === 'ranpaud' && <BarChart3 className="h-5 w-5 text-green-500" />}
                                {result.type === 'pembelajaran' && <GraduationCap className="h-5 w-5 text-purple-500" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 line-clamp-1 mb-0.5">
                              {result.title}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {result.description}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                result.type === 'news' ? 'bg-blue-100 text-blue-700' :
                                result.type === 'ranpaud' ? 'bg-green-100 text-green-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {result.type === 'news' ? 'Berita' :
                                 result.type === 'ranpaud' ? 'Program' :
                                 'Edukasi'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isSearching && searchTerm.trim() ? (
                  <div className="p-8 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-bold">Tidak ada hasil ditemukan</p>
                    <p className="text-sm text-gray-500 mt-1">Coba kata kunci lain atau periksa ejaan Anda</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Error Display */}
            {searchError && (
              <div className="absolute z-[100] w-full mt-2 bg-red-50 rounded-xl shadow-2xl border border-red-100 p-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="bg-red-100 p-2 rounded-full">⚠️</div>
                  <div>
                    <p className="font-bold text-sm">Kesalahan Pencarian</p>
                    <p className="text-xs opacity-80">{searchError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </a>
            ))}

            {!user ? (
              <Link
                to="/admin"
                className="text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              >
                Masuk
              </Link>
            ) : (
              <Link
                to="/admin"
                className="text-sm font-medium bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            {!user ? (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Masuk
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  } flex items-center justify-between`}
                >
                  Admin
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      to="/admin"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard Admin
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </nav>
  );
};

export default Navigation;
