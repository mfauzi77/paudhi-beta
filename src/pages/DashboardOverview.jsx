import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Eye, User, Plus, BarChart3, Target, TrendingUp, TrendingDown, Edit, AlertCircle } from 'lucide-react';
import apiService from '../utils/apiService';
import RanPaudDataTable from '../components/RanPaudDataTable';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    newsCount: 0,
    faqCount: 0,
    totalViews: 0,
    userCount: 0
  });
  const [ranPaudStats, setRanPaudStats] = useState({
    totalProgram: 0,
    totalDone: 0,
    totalProgress: 0,
    totalBelum: 0,
    totalRO: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRanPaudStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [newsResponse, faqResponse] = await Promise.all([
        apiService.getNews({ status: 'all' }),
        apiService.getFAQs()
      ]);
      
      const newsCount = newsResponse.total || newsResponse.news?.length || 0;
      const faqCount = faqResponse.length || 0;
      const totalViews = newsResponse.news?.reduce((sum, news) => sum + (news.views || 0), 0) || 0;
      
      setStats({
        newsCount,
        faqCount,
        totalViews,
        userCount: 5
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch RAN PAUD stats
  const fetchRanPaudStats = async () => {
    try {
      const response = await apiService.getRanPaudDashboardSummaryUnified();
      if (response.success) {
        setRanPaudStats(response.data);
      } else {
        console.error('Failed to fetch RAN PAUD stats:', response.message);
      }
    } catch (error) {
      console.error('Error fetching RAN PAUD stats:', error);
    }
  };

  const statsData = [
    { title: 'Total Berita', value: stats.newsCount.toString(), icon: FileText, color: 'bg-blue-500', change: '+5%' },
    { title: 'FAQ Aktif', value: stats.faqCount.toString(), icon: MessageSquare, color: 'bg-green-500', change: '+2%' },
    { title: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-500', change: '+12%' },
    { title: 'Total Pengguna', value: stats.userCount.toString(), icon: User, color: 'bg-orange-500', change: '0%' }
  ];

  // RAN PAUD stats data for display
  const ranPaudStatsData = [
    {
      title: "Total Program",
      value: ranPaudStats.totalProgram || 0,
      description: "Program",
      icon: Target,
      color: "bg-blue-500"
    },
    {
      title: "Tercapai",
      value: ranPaudStats.totalDone || 0,
      description: "Tercapai",
      icon: TrendingUp,
      color: "bg-green-500"
    },
    {
      title: "Dalam Proses",
      value: ranPaudStats.totalProgress || 0,
      description: "Dalam Proses",
      icon: TrendingDown,
      color: "bg-yellow-500"
    },
    {
      title: "Belum Lapor",
      value: ranPaudStats.totalBelum || 0,
      description: "Belum Lapor",
      icon: AlertCircle,
      color: "bg-red-500"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('id-ID')}
        </div>
      </div>
      
      {/* General Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RAN PAUDHI Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">RAN PAUDHI - Statistik Program</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ranPaudStatsData.map((stat, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-20`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-white text-opacity-80">{stat.description}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white text-opacity-90">{stat.title}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-white text-opacity-80">
            Total RO: {ranPaudStats.totalRO.toLocaleString()} | 
            Progress: {ranPaudStats.totalProgram > 0 ? Math.round((ranPaudStats.totalDone / ranPaudStats.totalProgram) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Data Program dan Indikator RAN PAUDHI */}
      <RanPaudDataTable 
        title="Data Program dan Indikator RAN PAUDHI"
        className="mt-8"
      />

      <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Buat Berita
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
