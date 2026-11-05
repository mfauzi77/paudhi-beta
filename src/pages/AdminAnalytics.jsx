import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MessageCircle, 
  Brain, 
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    website: {
      totalVisits: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      topPages: [],
      dailyVisits: [],
      monthlyVisits: []
    },
    chatbot: {
      totalConversations: 0,
      activeUsers: 0,
      averageResponseTime: 0,
      satisfactionRate: 0,
      topQuestions: [],
      dailyUsage: [],
      monthlyUsage: []
    },
    pengasuhanAI: {
      totalSessions: 0,
      uniqueUsers: 0,
      averageSessionTime: 0,
      completionRate: 0,
      topTopics: [],
      dailySessions: [],
      monthlySessions: []
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      const mockData = generateMockAnalyticsData(selectedPeriod);
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalyticsData = (period) => {
    const now = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 7;
    
    const generateDailyData = (baseValue, variance) => {
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
          value: Math.max(0, baseValue + (Math.random() - 0.5) * variance)
        };
      });
    };

    return {
      website: {
        totalVisits: 15420,
        uniqueVisitors: 8234,
        pageViews: 45678,
        averageSessionDuration: 245,
        bounceRate: 32.5,
        topPages: [
          { page: '/', views: 12500, percentage: 27.4 },
          { page: '/ran-paud-dashboard', views: 8900, percentage: 19.5 },
          { page: '/education', views: 6700, percentage: 14.7 },
          { page: '/about', views: 5400, percentage: 11.8 },
          { page: '/chatbot', views: 4200, percentage: 9.2 }
        ],
        dailyVisits: generateDailyData(500, 200),
        monthlyVisits: generateDailyData(15000, 5000)
      },
      chatbot: {
        totalConversations: 8920,
        activeUsers: 3456,
        averageResponseTime: 1.2,
        satisfactionRate: 87.3,
        topQuestions: [
          { question: 'Apa itu PAUDHI?', count: 1250, percentage: 14.0 },
          { question: 'Bagaimana cara mendaftar?', count: 890, percentage: 10.0 },
          { question: 'Jadwal kegiatan', count: 670, percentage: 7.5 },
          { question: 'Persyaratan dokumen', count: 540, percentage: 6.1 },
          { question: 'Kontak admin', count: 420, percentage: 4.7 }
        ],
        dailyUsage: generateDailyData(300, 150),
        monthlyUsage: generateDailyData(8000, 3000)
      },
      pengasuhanAI: {
        totalSessions: 5678,
        uniqueUsers: 2345,
        averageSessionTime: 8.5,
        completionRate: 78.9,
        topTopics: [
          { topic: 'Stimulasi Bayi 0-12 Bulan', count: 890, percentage: 15.7 },
          { topic: 'Gizi Seimbang Anak', count: 670, percentage: 11.8 },
          { topic: 'Deteksi Dini Tumbuh Kembang', count: 540, percentage: 9.5 },
          { topic: 'Tips Pengasuhan', count: 420, percentage: 7.4 },
          { topic: 'Masalah Perilaku', count: 380, percentage: 6.7 }
        ],
        dailySessions: generateDailyData(200, 100),
        monthlySessions: generateDailyData(5000, 2000)
      }
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}j ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor penggunaan website, chatbot, dan pengasuhan AI</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { id: 'week', label: '7 Hari Terakhir' },
              { id: 'month', label: '30 Hari Terakhir' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Website Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-600" />
              Website Analytics
            </h2>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString('id-ID')}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Kunjungan</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analyticsData.website.totalVisits.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Pengunjung Unik</p>
                  <p className="text-2xl font-bold text-green-900">
                    {analyticsData.website.uniqueVisitors.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Halaman Dilihat</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {analyticsData.website.pageViews.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Durasi Rata-rata</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatDuration(analyticsData.website.averageSessionDuration)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kunjungan Harian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.website.dailyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Halaman Terpopuler</h3>
              <div className="space-y-3">
                {analyticsData.website.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-gray-700 truncate max-w-32">{page.page}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{page.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-green-600" />
              Chatbot Analytics
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Percakapan</p>
                  <p className="text-2xl font-bold text-green-900">
                    {analyticsData.chatbot.totalConversations.toLocaleString()}
                  </p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Pengguna Aktif</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analyticsData.chatbot.activeUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Waktu Respons</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {analyticsData.chatbot.averageResponseTime}s
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Kepuasan</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {analyticsData.chatbot.satisfactionRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Penggunaan Harian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.chatbot.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pertanyaan Terpopuler</h3>
              <div className="space-y-3">
                {analyticsData.chatbot.topQuestions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-gray-700 truncate max-w-40">{question.question}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{question.count.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{question.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pengasuhan AI Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-600" />
              Pengasuhan AI Analytics
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Sesi</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {analyticsData.pengasuhanAI.totalSessions.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Pengguna Unik</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analyticsData.pengasuhanAI.uniqueUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Waktu Sesi</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatDuration(analyticsData.pengasuhanAI.averageSessionTime)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Tingkat Penyelesaian</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {analyticsData.pengasuhanAI.completionRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sesi Harian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.pengasuhanAI.dailySessions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Topik Terpopuler</h3>
              <div className="space-y-3">
                {analyticsData.pengasuhanAI.topTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-gray-700 truncate max-w-40">{topic.topic}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{topic.count.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{topic.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
