import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../../utils/apiService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("❌ useAuth must be used within AuthProvider");
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("🔧 AuthProvider initialized");

  // 🔐 Computed property untuk isAuthenticated
  const isAuthenticated = !!user;

  // 🔐 Helper functions untuk RBAC
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === "string") roles = [roles];
    // Map admin_kl ke kl_operator agar konsisten
    let userRole = user.role;
    if (userRole === "admin_kl") userRole = "kl_operator";
    return roles.includes(userRole);
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    // super_admin dan admin_kl (kl_operator) bisa akses sesuai permission
    if (user.role === "super_admin") return true;
    let userRole = user.role;
    if (userRole === "admin_kl") userRole = "kl_operator";
    // Cek permission object (bukan array)
    if (user.permissions && typeof user.permissions === "object") {
      if (user.permissions[module] && user.permissions[module][action]) {
        return true;
      }
    }
    // Fallback ke array lama jika ada
    if (Array.isArray(user.permissions)) {
      return user.permissions.some(
        (perm) => perm.module === module && perm.actions?.includes(action)
      );
    }
    return false;
  };

  const canAccessKL = (klId) => {
    if (!user) return false;
    let userRole = user.role;
    if (userRole === "admin_kl") userRole = "kl_operator";
    if (["super_admin", "admin"].includes(userRole)) return true;
    if (userRole === "kl_operator") return user.klId === klId;
    return false;
  };

  const canWriteKL = (klId = null) => {
    if (!user) return false;
    let userRole = user.role;
    if (userRole === "admin_kl") userRole = "kl_operator";
    if (["super_admin", "admin"].includes(userRole)) return true;
    if (userRole === "kl_operator") return !klId || klId === user.klId;
    return false;
  };

  const getAccessibleModules = () => {
    if (!user) return [];
    let userRole = user.role;
    if (userRole === "admin_kl") userRole = "kl_operator";
    const moduleAccess = {
      super_admin: [
        "dashboard",
        "ran-paud",
        "news",
        "faq",
        "pembelajaran",
        "users",
      ],
      admin: ["dashboard", "ran-paud", "news", "faq", "pembelajaran"],
      kl_operator: ["dashboard", "ran-paud"],
      viewer: ["dashboard", "ran-paud", "news", "faq", "pembelajaran"],
    };
    return moduleAccess[userRole] || [];
  };

  const getUserCapabilities = () => {
    if (!user) return {};

    return {
      role: user.role,
      klId: user.klId,
      klName: user.klName,
      isAdmin: ["super_admin", "admin"].includes(user.role),
      isSuperAdmin: user.role === "super_admin",
      isKLOperator: user.role === "kl_operator",
      isViewer: user.role === "viewer",
      canManagePengguna: user.role === "super_admin",
      canImportData: ["super_admin", "admin"].includes(user.role),
      canExportData: true,
      canBulkOperation: ["super_admin", "admin"].includes(user.role),
      canViewAllKL: ["super_admin", "admin", "viewer"].includes(user.role),
      canEditAllKL: ["super_admin", "admin"].includes(user.role),
      dataScope: user.role === "kl_operator" ? "own_kl" : "all_kl",
      accessibleModules: getAccessibleModules(),
    };
  };

  // ✅ Init user from localStorage - PERBAIKAN
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔧 Initializing auth...");
        const token = localStorage.getItem("authToken");
        console.log("🔧 Token found:", !!token);

        if (!token) {
          console.log("🔧 No token found, setting loading to false");
          setLoading(false);
          return;
        }

        // Set token di apiService dulu
        apiService.setToken(token);

        console.log("🔧 Verifying token...");
        const response = await apiService.request("/auth/verify");
        console.log("🔧 Token verified, user:", response.user);
        setUser(response.user);
      } catch (error) {
        console.log("❌ Token verification failed:", error.message);
        localStorage.removeItem("authToken");
        apiService.setToken(null);
        setUser(null);
        setError("Session expired. Please login again.");
      } finally {
        console.log("🔧 Setting loading to false");
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Login TANPA auto-redirect (biarkan LoginForm yang handle)
  const login = async (email, password) => {
    try {
      console.log("🔧 Login attempt for:", email);
      setLoading(true);
      setError(null);

      const response = await apiService.login(email, password);

      // ✅ Set user dulu, baru return success
      console.log("🔧 Login successful, setting user:", response.user);
      setUser(response.user);

      console.log(
        "✅ Login successful:",
        response.user.email,
        `(${response.user.role})`
      );

      // ✅ TIDAK ada navigate() di sini, biarkan LoginForm yang handle
      return { success: true, user: response.user };
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      console.error("❌ Login failed:", errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("🔧 Logout attempt");
      await apiService.logout();
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      console.log("🔧 Clearing user data");
      setUser(null);
      localStorage.removeItem("authToken");
      apiService.setToken(null);
      console.log("👋 User logged out");
      // ✅ Remove navigate() from here, let components handle redirect
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await apiService.request("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(profileData),
      });

      setUser((prev) => ({ ...prev, ...response.user }));
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await apiService.request("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,

    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
    setUser,

    hasRole,
    hasPermission,
    canAccessKL,
    canWriteKL,
    getAccessibleModules,
    getUserCapabilities,

    isAdmin: hasRole(["super_admin", "admin"]),
    isSuperAdmin: hasRole("super_admin"),
    isKLOperator: hasRole("kl_operator"),
    isViewer: hasRole("viewer"),

    capabilities: getUserCapabilities(),
  };

  console.log(
    "🔧 AuthProvider render - user:",
    user?.email,
    "loading:",
    loading,
    "isAuthenticated:",
    !!user
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
