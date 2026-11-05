// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ChevronDown, User, LogOut, Settings, BarChart3, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../pages/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import apiService from '../utils/apiService';
import LogoutConfirmModal from './LogoutConfirmModal';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const searchRef = useRef(null);

  // Close search & dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality (sama persis seperti Navigation)
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchPromises = [
        apiService.searchNews ? apiService.searchNews(query).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        apiService.searchRanPaud ? apiService.searchRanPaud(query).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        apiService.searchPembelajaran ? apiService.searchPembelajaran(query).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
      ];

      const [newsResults, ranPaudResults, pembelajaranResults] = await Promise.all(searchPromises);

      const results = [
        ...(newsResults?.data || []).map(item => ({
          ...item,
          type: 'news',
          title: item.title,
          description: item.content?.substring(0, 100) + '...',
          url: `/news/${item._id}`
        })),
        ...(ranPaudResults?.data || []).map(item => ({
          ...item,
          type: 'ranpaud',
          title: `${item.klName} - ${item.program}`,
          description: `Program RAN PAUDHI dari ${item.klName}`,
          url: `/ran-paud-dashboard`
        })),
        ...(pembelajaranResults?.data || []).map(item => ({
          ...item,
          type: 'pembelajaran',
          title: item.judul || item.nama,
          description: item.deskripsi?.substring(0, 100) + '...' || 'Materi pembelajaran',
          url: `/education`
        }))
      ];

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchError('Gagal melakukan pencarian. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchError(null);

    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
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

  // Daftar menu untuk sidebar
  const menuItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Dashboard RAN PAUD', path: '/ran-paud-dashboard' },

    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className="flex items-center" onClick={() => setSidebarOpen(false)}>
            <img className="h-8 w-auto" src="/logo.svg" alt="PAUDHI Logo" />
            <h1 className="ml-3 text-xl font-bold text-gray-900">PAUDHI</h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) =>
              item.external ? (
                <li key={item.path}>
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ) : (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              )
            )}

            {/* Admin / Login Button */}
            {!user ? (
              <li>
                <Link
                  to="/admin"
                  className="block w-full text-center px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  Login
                </Link>
              </li>
            ) : (
              <li className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive('/admin')
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="mt-1 ml-2 space-y-1">
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSidebarOpen(false);
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard Admin
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSidebarOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Konten Utama */}
      <div className="flex flex-col flex-1">
        {/* Header Sederhana */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo & Nama (hanya di mobile) */}
            <div className="lg:hidden flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="PAUDHI Logo" />
              <h1 className="ml-3 text-lg font-bold text-gray-900">PAUDHI</h1>
            </div>

            {/* Search Bar (sama persis seperti Navigation) */}
            <div className="flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari berita, program, atau materi pembelajaran..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchTerm.trim() && setShowSearchResults(true)}
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${index}`}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {result.type === 'news' && <FileText className="h-4 w-4 text-blue-600" />}
                          {result.type === 'ranpaud' && <BarChart3 className="h-4 w-4 text-green-600" />}
                          {result.type === 'pembelajaran' && <GraduationCap className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {result.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {result.description}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              result.type === 'news' ? 'bg-blue-100 text-blue-800' :
                              result.type === 'ranpaud' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {result.type === 'news' ? 'Berita' :
                               result.type === 'ranpaud' ? 'Program RAN PAUD' :
                               'Materi Pembelajaran'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSearchResults && searchResults.length === 0 && searchTerm.trim() && !isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-4">
                  <div className="text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Tidak ada hasil ditemukan</p>
                    <p className="text-sm">Coba kata kunci yang berbeda</p>
                  </div>
                </div>
              )}

              {searchError && (
                <div className="absolute z-50 w-full mt-1 bg-red-50 rounded-md shadow-lg border border-red-200 p-4">
                  <div className="text-center text-red-600">
                    <div className="text-red-500 text-6xl mb-2">⚠️</div>
                    <p className="font-medium">Error Pencarian</p>
                    <p className="text-sm">{searchError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Spacer di kanan (kosong) */}
            <div className="w-8"></div>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Modal Logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default Layout;