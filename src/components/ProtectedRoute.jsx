import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../pages/contexts/AuthContext";

const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = "/login",
  fallbackComponent = null,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 🔄 Tampilkan loading screen saat verifikasi auth
  if (loading) {
    return (
      fallbackComponent || (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Memverifikasi Akses
            </h2>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </div>
        </div>
      )
    );
  }

  // 🔒 Jika belum login, redirect ke halaman login
  if (!isAuthenticated || !user || user.isActive === false) {
    console.log("🔒 Pengguna tidak terautentikasi, sedang dialihkan ke halaman masuk");
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 🔐 Cek apakah user punya role yang dibutuhkan
  if (requiredRoles.length > 0 && user) {
    let userRole = user.role;

    // 🪄 Perlakukan admin_kl dan admin_daerah seperti admin biasa (override untuk fleksibilitas)
    if ((userRole === "admin_kl" || userRole === "admin_daerah") && requiredRoles.includes("admin")) {
      userRole = "admin"; // anggap admin_kl & admin_daerah valid untuk role admin
    }
    // 🪄 Perlakukan admin_utama seperti super_admin (legacy support)
    if (userRole === "admin_utama" && requiredRoles.includes("super_admin")) {
      userRole = "super_admin";
    }

    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      console.log(
        `🚫 User ${user.email} (${
          user.role
        }) does not have required roles: ${requiredRoles.join(", ")}`
      );

      // 🔁 Redirect berdasarkan role
      let redirectPath = "/"; // An unauthorized user must not loop back to this route.

      switch (user.role) {
        case "super_admin":
        case "admin":
        case "admin_kl":
        case "admin_daerah":
        case "kl_operator":
        case "viewer":
          redirectPath = "/";
          break;
        default:
          redirectPath = "/";
          break;
      }

      return <Navigate to={redirectPath} replace />;
    }
  }

  // ✅ Jika lolos semua pengecekan, tampilkan child component
  return children;
};

export default ProtectedRoute;
