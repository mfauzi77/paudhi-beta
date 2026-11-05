const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require('../dbPostgres');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid'); // Fallback if not available, used crypto below
const regionData = require('../../src/data/dataprovkabkota.json');

// Helper to generate ID if uuid package missing
const generateId = () => {
    try {
        return require('crypto').randomUUID();
    } catch (e) {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};

// =================
// AUTHENTICATION ROUTES (PostgreSQL Version)
// =================

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password diperlukan" });
    }

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    if (user.approval_status === "pending") {
      return res.status(403).json({ success: false, message: "Permintaan akun Anda masih menunggu persetujuan super admin" });
    }

    // Check active
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: "Akun tidak aktif" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate Token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        klId: user.kl_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Prepare response (camelCase for frontend)
    const userResponse = {
      id: user.id,
      _id: user.id, // Legacy compatibility
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      klId: user.kl_id,
      klName: user.kl_name,
      isActive: user.is_active,
      lastLogin: new Date(), // Just updated
      permissions: user.permissions || {}
    };

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: userResponse,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat login" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, role, klId, klName, province, city } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }
    if (password.length < 8) return res.status(400).json({ success: false, message: "Kata sandi minimal 8 karakter" });
    if (!["admin_kl", "admin_daerah"].includes(role)) return res.status(400).json({ success: false, message: "Role pendaftaran tidak valid" });
    const klOptions = { KEMENKO_PMK: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan", KEMENDIKDASMEN: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi", KEMENAG: "Kementerian Agama", KEMENDES_PDTT: "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi", KEMENKES: "Kementerian Kesehatan", KEMENDUKBANGGA: "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional", KEMENSOS: "Kementerian Sosial", KEMENPPPA: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak", KEMENDAGRI: "Kementerian Dalam Negeri", BAPPENAS: "Badan Perencanaan Pembangunan Nasional", BPS: "Badan Pusat Statistik" };
    if (role === "admin_kl" && !klOptions[klId]) return res.status(400).json({ success: false, message: "K/L tidak valid" });
    if (role === "admin_daerah" && !regionData.some(item => item.provinsi === province)) return res.status(400).json({ success: false, message: "Provinsi tidak valid" });
    if (role === "admin_daerah" && city && !regionData.find(item => item.provinsi === province)?.kabupaten_kota.includes(city)) return res.status(400).json({ success: false, message: "Kabupaten/kota tidak sesuai dengan provinsi" });

    // Check existing
    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.trim().toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Email atau username sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const newId = generateId();
    const usernameBase = email.trim().toLowerCase().split("@")[0].replace(/[^a-z0-9._-]/g, "").slice(0, 180) || "pengguna";
    const username = `${usernameBase}-${newId.slice(0, 8)}`;

    // Default permissions logic could be here, but usually handled by frontend or admin panel. 
    // We'll insert basic structure or empty object, assuming 'user' role defaults.
    // For now, let's keep it simple or default to what schema says ('{}')

    const query = `INSERT INTO users (id, username, email, password, full_name, role, kl_id, kl_name, region_name, province, city, is_active, approval_status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, 'pending', NOW(), NOW()) RETURNING id`;
    const values = [
        newId, username, email.trim().toLowerCase(), hashedPassword, fullName.trim(),
        role, role === 'admin_kl' ? klId : null, role === 'admin_kl' ? klOptions[klId] : null,
        role === 'admin_daerah' ? province : null, role === 'admin_daerah' ? province : null, role === 'admin_daerah' ? (city || null) : null
    ];

    await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Permintaan registrasi berhasil dikirim dan menunggu persetujuan admin"
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat registrasi", error: error.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.status(200).json({ success: true, message: "Logout berhasil" });
});

// GET /api/auth/verify (also /profile often used similarly)
router.get("/verify", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Token tidak ditemukan" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        const user = result.rows[0];

        if (!user || !user.is_active) {
            return res.status(401).json({ success: false, message: "Token/User tidak valid" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                _id: user.id, // Legacy compatibility
                email: user.email,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
                klId: user.kl_id,
                klName: user.kl_name,
                isActive: user.is_active,
                permissions: user.permissions
            }
        });

    } catch (error) {
        res.status(401).json({ success: false, message: "Token tidak valid" });
    }
});

// GET /api/auth/profile
router.get("/profile", authenticate, async (req, res) => {
    // Same implementation as verify effectively
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Token tidak ditemukan" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                _id: user.id, // Legacy compatibility
                email: user.email,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
                klId: user.kl_id,
                isActive: user.is_active,
                permissions: user.permissions,
                createdAt: user.created_at
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// PUT /api/auth/profile
router.put("/profile", authenticate, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Token missing" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { fullName, username, email } = req.body;
        
        // Cek duplikasi email/username
        if (email || username) {
            const check = await pool.query(
                'SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3',
                [email ? email.toLowerCase() : null, username || null, decoded.userId]
            );
            if (check.rows.length > 0) {
                return res.status(400).json({ success: false, message: "Email atau username sudah terdaftar oleh pengguna lain" });
            }
        }

        // Dynamic update query
        let fields = [];
        let values = [];
        let idx = 1;

        if (fullName) { fields.push(`full_name = $${idx++}`); values.push(fullName); }
        if (username) { fields.push(`username = $${idx++}`); values.push(username); }
        if (email) { fields.push(`email = $${idx++}`); values.push(email.toLowerCase()); }
        
        if (fields.length === 0) return res.json({ success: true, message: "Nothing to update" });

        fields.push(`updated_at = NOW()`);
        
        // Add ID as last parameter
        values.push(decoded.userId);
        
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        
        const result = await pool.query(query, values);
        const updated = result.rows[0];

        res.json({
            success: true,
            user: {
                id: updated.id,
                _id: updated.id, // Legacy compatibility
                email: updated.email,
                username: updated.username,
                fullName: updated.full_name,
                // ... include other fields if needed for frontend state update
            }
        });

    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/auth/change-password
router.post("/change-password", authenticate, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { currentPassword, newPassword } = req.body;
        if(!currentPassword || !newPassword) return res.status(400).json({success:false, message: "Password required"});

        // Get current hash
        const resUser = await pool.query('SELECT password FROM users WHERE id = $1', [decoded.userId]);
        if (resUser.rows.length === 0) return res.status(404).json({success:false, message: "User not found"});
        
        const user = resUser.rows[0];
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({success:false, message: "Password lama salah"});

        const newHash = await bcrypt.hash(newPassword, 12);
        await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [newHash, decoded.userId]);

        res.json({ success: true, message: "Password updated" });

    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
