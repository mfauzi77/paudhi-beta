// routes/feedback.js — Simple feedback API
const express = require('express');
const pool = require('../dbPostgres');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ─── Multer config for screenshot uploads ───
const feedbackUploadDir = path.join(__dirname, '..', 'uploads', 'feedback');
if (!fs.existsSync(feedbackUploadDir)) {
  fs.mkdirSync(feedbackUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, feedbackUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `feedback-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── POST /api/feedback — Submit feedback (public) ───
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { category, title, message, page_url, browser, device_type, user_agent } = req.body;

    // Validation
    if (!category || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Kategori, judul, dan pesan wajib diisi.',
      });
    }

    const screenshotUrl = req.file ? `/uploads/feedback/${req.file.filename}` : null;

    const query = `
      INSERT INTO feedback (category, title, message, screenshot_url, page_url, browser, device_type, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      category,
      title.substring(0, 200),
      message,
      screenshotUrl,
      page_url || null,
      browser || null,
      device_type || null,
      user_agent || null,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Feedback berhasil dikirim. Terima kasih atas masukan Anda!',
      feedback: result.rows[0],
    });
  } catch (error) {
    console.error('Submit feedback error:', error);

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File terlalu besar. Maksimal 5MB.' });
      }
    }

    res.status(500).json({ success: false, message: 'Gagal mengirim feedback.', error: error.message });
  }
});

// ─── GET /api/feedback — List feedback (for future admin) ───
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];
    let idx = 1;

    if (category && category !== 'all') {
      query += ` AND category = $${idx++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (title ILIKE $${idx} OR message ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Fetch paginated
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat feedback.' });
  }
});

// ─── DELETE /api/feedback/:id — Delete feedback ───
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM feedback WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Feedback berhasil dihapus.' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus feedback.' });
  }
});

module.exports = router;
