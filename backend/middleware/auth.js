const jwt = require("jsonwebtoken");
const pool = require("../dbPostgres");

// =================
// AUTHENTICATION MIDDLEWARE
// =================

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from PG
    const result = await pool.query(
        'SELECT id, username, email, full_name, role, kl_id, kl_name, region_name, province, city, permissions, is_active FROM users WHERE id = $1',
        [decoded.userId]
    );
    
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan atau akun tidak aktif",
      });
    }

    // Map to camelCase for compatibility with existing code
    req.user = {
        userId: user.id, // Keep generic userId
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        klId: user.kl_id,
        klName: user.kl_name,
        regionName: user.region_name,
        province: user.province,
        city: user.city,
        isActive: user.is_active,
        permissions: user.permissions || {}
    };
    
    // Helper for permissions if used
    req.user.hasPermission = (module, action) => {
        const perms = req.user.permissions;
        if (!perms) return false;
        // Logic depends on permission structure. Assuming generic checks:
        if (perms[module] && perms[module].includes(action)) return true;
        // Or if simple object module: true
        if (perms[module] === true || perms[module] === action) return true;
        return false;
    };

    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};

// Optional auth: populate req.user if token is present, but never block request
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
        'SELECT id, username, email, full_name, role, kl_id, kl_name, region_name, province, city, permissions, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );
      const user = result.rows[0];
      
      if (user && user.is_active) {
        req.user = {
            userId: user.id,
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            klId: user.kl_id,
            klName: user.kl_name,
            regionName: user.region_name,
            province: user.province,
            city: user.city,
            isActive: user.is_active,
            permissions: user.permissions || {}
        };
      }
    } catch (e) {
      // Ignore
    }
    return next();
  } catch (error) {
    return next();
  }
};

// =================
// AUTHORIZATION MIDDLEWARE
// =================

// Role-based authorization
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User tidak terautentikasi",
      });
    }

    // Support array or single string
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak - role tidak diizinkan",
      });
    }

    next();
  };
};

// =================
// RAN PAUD SPECIFIC MIDDLEWARE
// =================

// RAN PAUD module access check
const ranPaudAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  // Check if user has access to RAN PAUD module
  const allowedRoles = ["super_admin", "admin_kl", "admin_daerah", "admin", "super_admin"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "RAN PAUD module tidak tersedia",
    });
  }

  next();
};

// RAN PAUD write access (create, update, delete)
const ranPaudWriteAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  const writeRoles = ["super_admin", "admin_kl", "admin_daerah", "admin", "super_admin"];

  if (!writeRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Tidak memiliki akses write untuk RAN PAUD",
    });
  }

  next();
};

// RAN PAUD read access
const ranPaudReadAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  const readRoles = ["super_admin", "admin_kl", "admin_daerah", "admin", "super_admin"];

  if (!readRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Tidak memiliki akses read untuk RAN PAUD",
    });
  }

  next();
};

// High privilege operations (admin_utama only)
const ranPaudHighPrivilege = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  const highPrivilegeRoles = ["super_admin", "admin", "super_admin"];

  if (!highPrivilegeRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Tidak memiliki privilege tinggi untuk RAN PAUD",
    });
  }

  next();
};

// K/L specific access
const requireKLAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  // Super_admin dan admin bisa akses semua K/L
  if (req.user.role === "super_admin" || req.user.role === "admin") {
    return next();
  }

  // Admin_kl hanya bisa akses K/L mereka sendiri
  if (req.user.role === "admin_kl") {
    if (!req.user.klId) {
      return res.status(403).json({
        success: false,
        message: "K/L ID tidak ditemukan",
      });
    }

    // Jika ada klId di request body atau params, cek apakah sesuai
    const requestKLId = req.body.klId || req.params.klId;
    if (requestKLId && requestKLId !== req.user.klId) {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses ke K/L ini",
      });
    }
  }

  // Admin daerah: tidak memerlukan klId, akses akan dibatasi oleh UI, namun tetap melewati middleware ini
  if (req.user.role === "admin_daerah") {
    return next();
  }

  next();
};

// =================
// COMBINED MIDDLEWARE
// =================

// RAN PAUD access (read + write)
const ranPaudAccess = [verifyToken, ranPaudAuth];

// RAN PAUD read only access
const ranPaudReadOnly = [verifyToken, ranPaudReadAccess];

// RAN PAUD write access
const ranPaudWriteOnly = [verifyToken, ranPaudWriteAccess];

// RAN PAUD high privilege access
const ranPaudHighAccess = [verifyToken, ranPaudHighPrivilege];

// =================
// EXPORTS
// =================

module.exports = {
  // Basic authentication
  verifyToken,
  auth: verifyToken, // Alias untuk kompatibilitas
  optionalAuth,

  // Authorization
  requireRole,
  authorize: requireRole, // Alias untuk kompatibilitas

  // RAN PAUD specific
  ranPaudAuth,
  ranPaudWriteAccess,
  ranPaudReadAccess,
  ranPaudHighPrivilege,
  requireKLAccess,

  // Combined middleware
  ranPaudAccess,
  ranPaudReadOnly,
  ranPaudWriteOnly,
  ranPaudHighAccess,

  // Legacy aliases
  authenticate: verifyToken,
};
