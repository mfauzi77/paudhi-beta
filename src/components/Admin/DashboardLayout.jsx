// components/Admin/DashboardLayout.jsx

import React from "react";
import { useAuth } from "../../pages/contexts/AuthContext";

const DashboardLayout = ({ children, pageTitle }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="text-sm text-gray-600">
                Selamat datang, {user?.fullName || 'User'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.role === 'super_admin' && 'Super Admin'}
                  {user?.role === 'admin' && 'Admin'}
                  {user?.role === 'admin_kl' && `${user?.klName || 'K/L'} Admin`}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
