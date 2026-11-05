// components/Admin/DashboardOverview.jsx

import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Newspaper, BarChart3, Users } from 'lucide-react';

const StatCard = ({ icon, title, count, color }) => {
  const Icon = icon;
  return (
    <div className={`p-6 bg-white rounded-2xl shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  // Data ini nantinya akan diambil dari API
  const stats = {
    newsCount: 12,
    statsCount: 8,
    servicesCount: 25,
  };

  return (
    <DashboardLayout pageTitle="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Newspaper} title="Total Artikel Berita" count={stats.newsCount} color="border-blue-500" />
        <StatCard icon={BarChart3} title="Total Data Statistik" count={stats.statsCount} color="border-green-500" />
        <StatCard icon={Users} title="Total Layanan" count={stats.servicesCount} color="border-purple-500" />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Aktivitas Terakhir</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-600">Fitur log aktivitas akan segera hadir di sini.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;