// middleware/klAccessControl.js
const pool = require("../dbPostgres");

// =================
// K/L ACCESS CONTROL MIDDLEWARE
// =================

/**
 * Middleware untuk memastikan admin_kl hanya bisa akses data K/L mereka sendiri
 */
const restrictToOwnKL = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  // Super_admin dan admin bisa akses semua data
  if (req.user.role === "super_admin" || req.user.role === "admin") {
    return next();
  }

  // Admin_kl dan admin_daerah hanya bisa akses data K/L mereka sendiri (atau wilayahnya)
  if (req.user.role === "admin_kl" || req.user.role === "admin_daerah") {
    if (!req.user.klId) {
      return res.status(403).json({
        success: false,
        message: "K/L ID tidak ditemukan untuk user ini",
      });
    }

    // Cek klId dari berbagai sumber (body, params, query)
    const requestKLId = req.body.klId || req.params.klId || req.query.klId;
    
    if (requestKLId && requestKLId !== req.user.klId) {
      return res.status(403).json({
        success: false,
        message: `Tidak memiliki akses ke data K/L: ${requestKLId}. Anda hanya bisa mengakses data ${req.user.klName} (${req.user.klId})`,
      });
    }

    // Jika tidak ada klId di request, set default ke K/L user
    if (!requestKLId) {
      req.body.klId = req.user.klId;
      req.body.klName = req.user.klName;
    }
  }

  next();
};

/**
 * Middleware untuk filter query berdasarkan K/L user
 */
const filterByKL = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  // Super_admin dan admin bisa lihat semua data
  if (req.user.role === "super_admin" || req.user.role === "admin") {
    return next();
  }

  // Admin_kl dan admin_daerah hanya bisa lihat data K/L mereka sendiri
  if (req.user.role === "admin_kl" || req.user.role === "admin_daerah") {
    if (!req.user.klId) {
      return res.status(403).json({
        success: false,
        message: "K/L ID tidak ditemukan untuk user ini",
      });
    }

    // Set filter untuk query
    req.klFilter = { klId: req.user.klId };
  }

  next();
};

/**
 * Middleware untuk validasi akses ke data spesifik berdasarkan ID
 */
const validateDataAccess = (modelName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User tidak terautentikasi",
      });
    }

    // Super_admin dan admin bisa akses semua data
  if (req.user.role === "super_admin" || req.user.role === "admin") {
      return next();
    }

    // Admin_kl dan admin_daerah perlu validasi data ownership
    if (req.user.role === "admin_kl" || req.user.role === "admin_daerah") {
      if (!req.user.klId) {
        return res.status(403).json({
          success: false,
          message: "K/L ID tidak ditemukan untuk user ini",
        });
      }

      const dataId = req.params.id;
      if (!dataId) {
        return res.status(400).json({
          success: false,
          message: "ID data tidak ditemukan",
        });
      }

      try {
        let tableName = "";
        let klColumn = "";
        
        // Map modelName to table
        if (modelName === "Pembelajaran") {
             tableName = "pembelajaran";
             klColumn = "created_by_kl"; // Pembelajaran uses this
        } else if (modelName === "RanPaud") {
             tableName = "ran_paud";
             klColumn = "kl_id";
        } else {
             console.warn(`Unmapped modelName in validateDataAccess: ${modelName}`);
             return next(); // Skip if unknown or handle error
        }
        
        const query = `SELECT ${klColumn} as "klId" FROM ${tableName} WHERE id = $1`;
        const result = await pool.query(query, [dataId]);
        const data = result.rows[0];

        if (!data) {
          return res.status(404).json({
            success: false,
            message: "Data tidak ditemukan",
          });
        }

        // Cek apakah data milik K/L user
        if (data.klId !== req.user.klId) {
          return res.status(403).json({
            success: false,
            message: `Tidak memiliki akses ke data ini. Data milik K/L: ${data.klId}, Anda hanya bisa akses data ${req.user.klName} (${req.user.klId})`,
          });
        }
      } catch (error) {
        console.error("ValidateDataAccess Error:", error);
        return res.status(500).json({
          success: false,
          message: "Error validasi akses data",
        });
      }
    }

    next();
  };
};

/**
 * Middleware untuk validasi bulk operations berdasarkan K/L
 */
const validateBulkKLAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User tidak terautentikasi",
    });
  }

  // Super_admin dan admin bisa akses semua data
  if (req.user.role === "super_admin" || req.user.role === "admin") {
    return next();
  }

  // Admin_kl dan admin_daerah perlu validasi K/L untuk bulk operations
  if (req.user.role === "admin_kl" || req.user.role === "admin_daerah") {
    if (!req.user.klId) {
      return res.status(403).json({
        success: false,
        message: "K/L ID tidak ditemukan untuk user ini",
      });
    }

    // Cek apakah ada data dari K/L lain dalam bulk operation
    const bulkData = req.body.data || req.body.ids || [];
    
    // Note: This checks the REQUEST BODY. 
    // If the request contains data with klId that doesn't match, block it.
    for (const item of bulkData) {
      if (item.klId && item.klId !== req.user.klId) {
        return res.status(403).json({
          success: false,
          message: `Tidak bisa melakukan bulk operation pada data K/L: ${item.klId}. Anda hanya bisa mengakses data ${req.user.klName} (${req.user.klId})`,
        });
      }
    }
  }

  next();
};

/**
 * Helper function untuk mendapatkan filter berdasarkan role user
 */
const getKLFilter = (user) => {
  if (user.role === "super_admin" || user.role === "admin") {
    return {}; // Tidak ada filter, bisa akses semua
  }
  
  if ((user.role === "admin_kl" || user.role === "admin_daerah") && user.klId) {
    return { klId: user.klId };
  }
  
  return { klId: "INVALID" }; // Filter yang tidak akan return data
};

/**
 * Helper function untuk validasi permission berdasarkan module dan action
 */
const validatePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User tidak terautentikasi",
      });
    }

    // Super_admin memiliki semua permission
    if (req.user.role === "super_admin") {
      return next();
    }

    // Cek permission untuk admin dan admin_kl
    if (req.user.role === "admin" || req.user.role === "admin_kl") {
      // Use the helper attached in auth.js
      const hasPermission = req.user.hasPermission ? req.user.hasPermission(module, action) : false;
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Tidak memiliki permission ${action} untuk module ${module}`,
        });
      }
    }

    next();
  };
};

// =================
// EXPORTS
// =================

module.exports = {
  restrictToOwnKL,
  filterByKL,
  validateDataAccess,
  validateBulkKLAccess,
  getKLFilter,
  validatePermission,
};