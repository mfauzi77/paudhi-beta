import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// ==================== KL PERFORMANCE CHART ====================
export const PAUDKLPerformanceChart = ({ data, className = '' }) => {
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Performa Kementerian/Lembaga
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tercapai" fill="#10B981" name="Tercapai" />
          <Bar dataKey="tidakTercapai" fill="#EF4444" name="Tidak Tercapai" />
          <Bar dataKey="belumLaporan" fill="#6B7280" name="Belum Laporan" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== PROGRESS PIE CHART ====================
export const PAUDProgressPieChart = ({ data, className = '' }) => {
  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Distribusi Status Program
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== YEARLY TREND CHART ====================
export const PAUDYearlyTrendChart = ({ data, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Tren Pencapaian Tahunan
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="tercapai" stroke="#10B981" strokeWidth={2} />
          <Line type="monotone" dataKey="tidakTercapai" stroke="#EF4444" strokeWidth={2} />
          <Line type="monotone" dataKey="belumLaporan" stroke="#6B7280" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== PROGRAM PROGRESS CHART ====================
export const PAUDProgramProgressChart = ({ data, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Progress Program per K/L
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="kl" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="progress" fill="#3B82F6" name="Progress (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== ACHIEVEMENT AREA CHART ====================
export const PAUDAchievementAreaChart = ({ data, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Area Pencapaian Target vs Realisasi
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="program" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="target" stackId="1" stroke="#8884d8" fill="#8884d8" />
          <Area type="monotone" dataKey="realisasi" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== DASHBOARD CHARTS CONTAINER ====================
export const PAUDDashboardCharts = ({ 
  chartData, 
  selectedYear,
  className = '' 
}) => {
  if (!chartData) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <p>Data chart sedang dimuat...</p>
        </div>
      </div>
    );
  }

  const { klData = [], programData = [], achievementData = [] } = chartData;

  // Validate klData is array and has data
  if (!Array.isArray(klData) || klData.length === 0) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <p>Data chart belum tersedia...</p>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Tercapai', value: klData.reduce((sum, kl) => sum + (kl.tercapai || 0), 0) },
    { name: 'Tidak Tercapai', value: klData.reduce((sum, kl) => sum + (kl.tidakTercapai || 0), 0) },
    { name: 'Belum Laporan', value: klData.reduce((sum, kl) => sum + (kl.belumLaporan || 0), 0) }
  ];

  // Prepare progress data
  const progressData = klData.map(kl => ({
    kl: kl.name || 'Unknown',
    progress: Math.round(((kl.tercapai || 0) / (kl.total || 1)) * 100) || 0
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* KL Performance Chart */}
      <PAUDKLPerformanceChart data={klData} />
      
      {/* Progress Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PAUDProgressPieChart data={pieData} />
        <PAUDProgramProgressChart data={progressData} />
      </div>
      
      {/* Achievement Area Chart */}
      {achievementData.length > 0 && (
        <PAUDAchievementAreaChart data={achievementData.slice(0, 10)} />
      )}
    </div>
  );
};

// ==================== MINI CHARTS ====================

// Mini progress chart untuk summary
export const PAUDMiniProgressChart = ({ progress, className = '' }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="80" height="80" className="transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={progress >= 80 ? "#10B981" : progress >= 60 ? "#F59E0B" : "#EF4444"}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-sm font-semibold">
        {progress}%
      </div>
    </div>
  );
};

// Mini bar chart untuk quick stats
export const PAUDMiniBarChart = ({ data, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PAUDDashboardCharts;
