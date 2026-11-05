import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import AdminAnalytics from './AdminAnalytics';
import NewsManagement from './news/NewsManagement';
import FAQManagement from './FAQManagement';
import UserManagement from './UserManagement';
import RanPaudDashboard from './ranpaud/RanPaudDashboard';
import RanPaudManagement from './ranpaud/RanPaudManagement';
import RanPaudReports from './ranpaud/RanPaudReports';
import PembelajaranManagement from './education/PembelajaranManagement';
import FeedbackAdmin from '../components/Feedback/FeedbackAdmin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('ran-paud-data');

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Set active tab based on current route
    if (location.pathname === '/admin/analytics') {
      setActiveTab('analytics');
    } else if (location.pathname === '/admin/ran-paud-dashboard') {
      setActiveTab('ran-paud-dashboard');
    } else if (location.pathname === '/admin/ran-paud-data') {
      if (!activeTab.startsWith('ran-paud-data')) {
        setActiveTab('ran-paud-data');
      }
    } else if (location.pathname === '/admin/ran-paud-reports') {
      setActiveTab('ran-paud-reports');
    } else if (location.pathname === '/admin/feedback') {
      setActiveTab('feedback');
    } else if (location.pathname === '/admin') {
      // Auto-redirect ke halaman Input Data sebagai landing admin
      setActiveTab('ran-paud-data');
      navigate('/admin/ran-paud-data', { replace: true });
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    if (tabId === 'users' && user?.role !== 'super_admin') return;
    setActiveTab(tabId);
    
    if (tabId === 'analytics') {
      navigate('/admin/analytics');
    } else if (tabId === 'ran-paud-dashboard') {
      navigate('/admin/ran-paud-dashboard');
    } else if (tabId === 'ran-paud-data' || tabId === 'ran-paud-data-add') {
      navigate('/admin/ran-paud-data');
    } else if (tabId === 'ran-paud-reports') {
      navigate('/admin/ran-paud-reports');
    } else if (tabId === 'overview') {
      navigate('/admin');
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'news':
        return <NewsManagement />;
      case 'faq':
        return <FAQManagement />;
      case 'users':
        return user?.role === 'super_admin' ? <UserManagement /> : <DashboardOverview />;
      case 'ran-paud-dashboard':
        return <RanPaudDashboard setActiveTab={handleTabChange} />;
      case 'ran-paud-data':
      case 'ran-paud-data-add':
        return <RanPaudManagement activeTab={activeTab} setActiveTab={handleTabChange} />;
      case 'ran-paud-reports':
        return <RanPaudReports setActiveTab={handleTabChange} />;
      case 'pembelajaran-panduan':
        return <PembelajaranManagement activeTab="panduan" setActiveTab={handleTabChange} />;
      case 'pembelajaran-video':
        return <PembelajaranManagement activeTab="video" setActiveTab={handleTabChange} />;
      case 'pembelajaran-tools':
        return <PembelajaranManagement activeTab="tools" setActiveTab={handleTabChange} />;
      case 'feedback':
        return <FeedbackAdmin />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="fixed top-0 left-0 h-screen w-64 z-50">
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />
      </div>
      <main className="ml-64 min-h-screen overflow-x-auto overflow-y-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
