// routes/users.js
const express = require("express");
const pool = require('../dbPostgres');
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");
const { v4: uuidv4 } = require('uuid'); 
const regionData = require('../../src/data/dataprovkabkota.json');

const router = express.Router();

// Helper to generate ID
const generateId = () => {
    try {
        return require('crypto').randomUUID();
    } catch (e) {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};

// ================= CONSTANTS (From Mongoose Model) =================
const KL_LIST = [
    { id: "KEMENKO_PMK", name: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan" },
    { id: "KEMENDIKDASMEN", name: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi" },
    { id: "KEMENAG", name: "Kementerian Agama" },
    { id: "KEMENDES_PDTT", name: "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi" },
    { id: "KEMENKES", name: "Kementerian Kesehatan" },
    { id: "KEMENDUKBANGGA", name: "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional" },
    { id: "KEMENSOS", name: "Kementerian Sosial" },
    { id: "KEMENPPPA", name: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak" },
    { id: "KEMENDAGRI", name: "Kementerian Dalam Negeri" },
    { id: "BAPPENAS", name: "Badan Perencanaan Pembangunan Nasional" },
    { id: "BPS", name: "Badan Pusat Statistik" }
];

const REGION_LIST = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan", "Bengkulu",
    "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta", "Jawa Barat", "Banten",
    "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo",
    "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua Barat", "Papua", "Papua Selatan",
    "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
];
// ===================================================================

// Middleware to check if user is admin_utama or admin/super_admin
const requireAdminUtama = (req, res, next) => {
  if (!["admin_utama", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya Super Admin yang dapat mengakses fitur ini.",
    });
  }
  next();
};

// GET /api/users - Get all users (admin_utama only)
router.get("/", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `SELECT id, username, email, full_name, role, kl_id, kl_name, region_name, province, city, is_active, approval_status, last_login, created_at FROM users WHERE 1=1`;
    const params = [];
    let paramIdx = 1;

    if (search) {
      queryText += ` AND (username ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR full_name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (role && role !== "all") {
      queryText += ` AND role = $${paramIdx}`;
      params.push(role);
      paramIdx++;
    }

    if (status && status !== "all") {
      if (status === "pending") {
        queryText += ` AND approval_status = $${paramIdx}`;
        params.push("pending");
      } else {
        queryText += ` AND is_active = $${paramIdx} AND COALESCE(approval_status, 'approved') = 'approved'`;
        params.push(status === "active");
      }
      paramIdx++;
    }

    // Sort and Pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(limit, offset);

    // Count Total (separate query)
    let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
    const countParams = params.slice(0, paramIdx - 1); // remove limit/offset params
    
    // Re-construct count where clause (simplistic but works for this structure)
    // A more robust way would be to keep the WHERE clause separate variables.
    // For now, let's just re-apply the where logic for count:
    let whereClause = "";
    let countIdx = 1;
    if (search) { whereClause += ` AND (username ILIKE $${countIdx} OR email ILIKE $${countIdx} OR full_name ILIKE $${countIdx})`; countIdx++; }
    if (role && role !== "all") { whereClause += ` AND role = $${countIdx}`; countIdx++; }
    if (status && status !== "all") {
      if (status === "pending") { whereClause += ` AND approval_status = $${countIdx}`; }
      else { whereClause += ` AND is_active = $${countIdx} AND COALESCE(approval_status, 'approved') = 'approved'`; }
      countIdx++;
    }

    const usersResult = await pool.query(queryText, params);
    const countResult = await pool.query(countQuery + whereClause, countParams);

    const total = parseInt(countResult.rows[0].count);
    const users = usersResult.rows.map(u => ({
        // Map snake_case db to camelCase response
        id: u.id,
        _id: u.id, // Legacy compatibility
        username: u.username,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        klId: u.kl_id,
        klName: u.kl_name,
        regionName: u.region_name,
        province: u.province,
        city: u.city,
        isActive: u.is_active,
        approvalStatus: u.approval_status || "approved",
        lastLogin: u.last_login,
        createdAt: u.created_at
    }));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Users GET error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Super admin approves the role and scope supplied during self-registration.
router.patch("/:id/approve", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const pending = await pool.query("SELECT role, kl_id, province, city FROM users WHERE id = $1 AND approval_status = 'pending'", [req.params.id]);
    if (!pending.rows.length) return res.status(404).json({ success: false, message: "Permintaan menunggu persetujuan tidak ditemukan" });
    const account = pending.rows[0];
    if (!["admin_kl", "admin_daerah"].includes(account.role)) return res.status(400).json({ success: false, message: "Role pendaftaran tidak valid" });
    if (account.role === "admin_kl" && !KL_LIST.some(item => item.id === account.kl_id)) return res.status(400).json({ success: false, message: "K/L pada permintaan tidak valid" });
    if (account.role === "admin_daerah" && !REGION_LIST.includes(account.province)) return res.status(400).json({ success: false, message: "Provinsi pada permintaan tidak valid" });
    if (account.role === "admin_daerah" && account.city && !regionData.find(item => item.provinsi === account.province)?.kabupaten_kota.includes(account.city)) return res.status(400).json({ success: false, message: "Kabupaten/kota pada permintaan tidak sesuai dengan provinsi" });
    const result = await pool.query("UPDATE users SET is_active = true, approval_status = 'approved', updated_at = NOW() WHERE id = $1 AND approval_status = 'pending' RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Permintaan menunggu persetujuan tidak ditemukan" });
    res.json({ success: true, message: "Akun disetujui dan diaktifkan" });
  } catch (error) {
    console.error("User approval error:", error);
    res.status(500).json({ success: false, message: "Gagal menyetujui akun" });
  }
});

router.patch("/:id/reject", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 AND approval_status = 'pending' RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Permintaan menunggu persetujuan tidak ditemukan" });
    res.json({ success: true, message: "Permintaan registrasi ditolak" });
  } catch (error) {
    console.error("User rejection error:", error);
    res.status(500).json({ success: false, message: "Gagal menolak permintaan" });
  }
});

// GET /api/users/:id
router.get("/:id", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    // Map to camelCase
    const userResponse = {
        id: user.id,
        _id: user.id, // Legacy compatibility
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
        permissions: user.permissions,
        lastLogin: user.last_login,
        createdAt: user.created_at
    };

    res.json({ success: true, data: userResponse });
  } catch (error) {
    console.error("❌ User GET error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users
router.post("/", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const body = req.body;
    const createdBy = req.user.email || "admin@paudhi.kemenko.go.id"; // Just for logging if needed, schema doesn't have createdBy column in users table currently (only dates)

    // Basic Validation
    if (!body.username || !body.email || !body.password || !body.fullName || !body.role) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    // Role Validation Logic
    if (body.role === "admin_kl") {
        if (!body.klId || !body.klName) {
            return res.status(400).json({ success: false, message: "Untuk role K/L, K/L wajib dipilih" });
        }
        body.province = null; body.city = null; body.regionName = null;
    } else if (body.role === "admin_daerah") {
        if (!body.province) {
            return res.status(400).json({ success: false, message: "Untuk admin daerah, Provinsi wajib" });
        }
        body.regionName = body.province; // Sync
        if (!REGION_LIST.includes(body.regionName)) {
            return res.status(400).json({ success: false, message: "Daerah tidak valid" });
        }
    } else {
        body.klId = null; body.klName = null;
        body.province = null; body.city = null; body.regionName = null;
    }

    // Check Duplicate
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [body.email.toLowerCase(), body.username]
    );
    if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Username atau email sudah ada" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const newId = generateId();

    const query = `
        INSERT INTO users (
            id, username, email, password, full_name, 
            role, kl_id, kl_name, region_name, province, city, 
            permissions, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING *
    `;
    
    // Default permissions logic (kept simple as per auth.js logic)
    const permissions = body.permissions && typeof body.permissions === 'object' && !Array.isArray(body.permissions) 
        ? JSON.stringify(body.permissions) 
        : '{}';

    const values = [
        newId, body.username, body.email.toLowerCase(), hashedPassword, body.fullName,
        body.role, body.klId, body.klName, body.regionName, body.province, body.city || null,
        permissions, true
    ];

    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    res.status(201).json({
        success: true,
        message: "User berhasil dibuat",
        data: { id: newUser.id, email: newUser.email, username: newUser.username }
    });

  } catch (error) {
    console.error("❌ User POST error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id
router.put("/:id", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Role Logic Validation
    if (body.role === "admin_kl") {
        if (!body.klId || !body.klName) return res.status(400).json({ success: false, message: "KL wajib" });
    }
    if (body.role === "admin_daerah") {
        if (!body.province || !body.regionName) return res.status(400).json({ success: false, message: "Daerah wajib" });
    }

    // Dynamic Update Query
    let fields = [];
    let values = [];
    let idx = 1;

    if (body.fullName) { fields.push(`full_name = $${idx++}`); values.push(body.fullName); }
    if (body.username) { fields.push(`username = $${idx++}`); values.push(body.username); }
    if (body.email) { fields.push(`email = $${idx++}`); values.push(body.email.toLowerCase()); }
    if (body.role) { fields.push(`role = $${idx++}`); values.push(body.role); }
    
    // Nullable fields logic is tricky in dynamic updates. 
    // Simplified: always update these if role changed, or if provided explicitly.
    // For robust logic, checking the role is essential.
    if (body.role === 'admin_kl') {
         fields.push(`kl_id = $${idx++}`); values.push(body.klId);
         fields.push(`kl_name = $${idx++}`); values.push(body.klName);
         fields.push(`region_name = NULL`); 
         fields.push(`province = NULL`);
         fields.push(`city = NULL`);
    } else if (body.role === 'admin_daerah') {
         fields.push(`kl_id = NULL`);
         fields.push(`kl_name = NULL`);
         fields.push(`region_name = $${idx++}`); values.push(body.regionName);
         fields.push(`province = $${idx++}`); values.push(body.province);
         fields.push(`city = $${idx++}`); values.push(body.city);
    } else if (body.role && body.role !== 'admin_kl' && body.role !== 'admin_daerah') {
         // Clear all special fields
         fields.push(`kl_id = NULL`); fields.push(`kl_name = NULL`);
         fields.push(`region_name = NULL`); fields.push(`province = NULL`); fields.push(`city = NULL`);
    }

    if (body.permissions) {
         fields.push(`permissions = $${idx++}`); 
         values.push(JSON.stringify(body.permissions));
    }
    
    if (body.password) {
         const salt = await bcrypt.genSalt(10);
         const hashed = await bcrypt.hash(body.password, salt);
         fields.push(`password = $${idx++}`);
         values.push(hashed);
    }

    fields.push(`updated_at = NOW()`);
    
    if (fields.length === 1) return res.json({ success: true, message: "Nothing to update" }); // Only updated_at

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
        success: true,
        message: "User berhasil diperbarui",
        data: result.rows[0]
    });

  } catch (error) {
    console.error("❌ User PUT error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", authenticate, requireAdminUtama, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User berhasil dihapus", data: { id: result.rows[0].id } });
  } catch (error) {
    console.error("❌ User DELETE error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/users/:id/toggle-status
router.patch("/:id/toggle-status", authenticate, requireAdminUtama, async (req, res) => {
  try {
     // First get current status
     const getCurrent = await pool.query('SELECT is_active FROM users WHERE id = $1', [req.params.id]);
     if (getCurrent.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
     
     const currentStatus = getCurrent.rows[0].is_active;
     const newStatus = !currentStatus;
     
     const result = await pool.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newStatus, req.params.id]);
     
     const user = result.rows[0];
     res.json({
        success: true,
        message: `User berhasil ${user.is_active ? "diaktifkan" : "dinonaktifkan"}`,
        data: { id: user.id, isActive: user.is_active }
     });
  } catch (error) {
    console.error("❌ User Toggle error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/kl-list
router.get("/kl-list", authenticate, requireAdminUtama, (req, res) => {
    res.json({ success: true, data: KL_LIST });
});

// GET /api/users/region-list
router.get("/region-list", authenticate, requireAdminUtama, (req, res) => {
    res.json({ success: true, data: REGION_LIST });
});

module.exports = router;
