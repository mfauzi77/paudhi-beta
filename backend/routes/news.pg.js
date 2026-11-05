const express = require('express');
const router = express.Router();
const pool = require('../dbPostgres');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const newsWriters = requireRole(['super_admin', 'admin', 'admin_kl', 'admin_daerah', 'editor']);

/**
 * Helper to map DB row to frontend object
 */
const mapNewsRow = (row) => {
  const { authorFullName, authorKLName, ...newsData } = row;
  return {
    ...newsData,
    author: {
      fullName: authorFullName,
      klName: authorKLName
    }
  };
};

/**
 * GET semua news dari PostgreSQL
 * URL: /api/news
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const params = [];
    
    // Start with a base that we will refine
    let whereClauses = [];
    
    // 1. Status Filtering Logic
    if (status === 'publish') {
        // Strict publish filter (Public View)
        whereClauses.push("n.status = 'publish'");
    } else if (status === 'draft') {
        // Drafts only (Admin View)
        whereClauses.push("n.status = 'draft'");
        // Enforce ownership/role for drafts
        if (!req.user) {
             return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!['super_admin', 'admin'].includes(req.user.role)) {
             whereClauses.push(`n.author_id = $${params.length + 1}`);
             params.push(req.user.id);
        }
    } else if (status === 'all' || !status) {
         // All status (Admin Dashboard default) OR Unspecified
         // If user is logged in, show what they are allowed to see
         if (req.user) {
             if (['super_admin', 'admin'].includes(req.user.role)) {
                 // Main admins see everything: no extra filter needed
             } else {
                 // Regional admins: Publish + Own Drafts
                 whereClauses.push(`(n.status = 'publish' OR n.author_id = $${params.length + 1})`);
                 params.push(req.user.id);
             }
         } else {
             // Public/Guest: Only publish
             whereClauses.push("n.status = 'publish'");
         }
    } else {
        // Unknown status param -> default to publish
        whereClauses.push("n.status = 'publish'");
    }

    let queryText = `
      SELECT n.id as "_id", n.title, n.content, n.excerpt, n.image, n.category, n.status, n.source, n.author_id, 
             n.news_date as "newsDate", n.created_at as "createdAt", n.updated_at as "updatedAt",
             u.full_name as "authorFullName", u.kl_name as "authorKLName"
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
    `;
    
    if (whereClauses.length > 0) {
        queryText += ` WHERE ${whereClauses.join(' AND ')} `;
    }

    if (search) {
      // Basic support for multiple keywords
      const keywords = search.trim().split(/\s+/);
      const searchClauses = keywords.map((k, i) => `(n.title ILIKE $${params.length + i + 1} OR n.content ILIKE $${params.length + i + 1})`);
      
      if (whereClauses.length > 0) {
          queryText += ` AND (${searchClauses.join(' AND ')}) `;
      } else {
          queryText += ` WHERE (${searchClauses.join(' AND ')}) `;
      }
      
      keywords.forEach(k => params.push(`%${k}%`));
    }

    queryText += ` ORDER BY n.news_date DESC, n.created_at DESC`;

    const result = await pool.query(queryText, params);
    res.json({ success: true, data: result.rows.map(mapNewsRow) });
  } catch (err) {
    console.error('Error fetching news:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET satu news berdasarkan ID
 * URL: /api/news/:id
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT n.id as "_id", n.title, n.content, n.excerpt, n.image, n.category, n.status, n.source, n.author_id, 
             n.news_date as "newsDate", n.created_at as "createdAt", n.updated_at as "updatedAt",
             u.full_name as "authorFullName", u.kl_name as "authorKLName"
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }
    const row = result.rows[0];

    // Visibility Check
    if (row.status !== 'publish') {
        const canView = req.user && (
            ['super_admin', 'admin'].includes(req.user.role) || 
            req.user.id === row.author_id
        );
        
        if (!canView) {
             return res.status(404).json({ success: false, message: 'Berita tidak ditemukan (atau sedang draft)' });
        }
    }

    res.json({ success: true, data: mapNewsRow(row) });
  } catch (err) {
    console.error('Error fetching single news:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST news baru ke PostgreSQL
 */
router.post('/', authenticate, newsWriters, upload.single('image'), async (req, res) => {
  let { title, content, excerpt, category, status, source, newsDate } = req.body;
  
  // Force draft if not main admin
  if (req.user && !['super_admin', 'admin'].includes(req.user.role)) {
      status = 'draft';
  }
  
  // Prioritize file upload, fallback to body image string (for 2-step uploads)
  let image = req.body.image || null;
  if (req.file) {
      image = `/uploads/news/${req.file.filename}`;
  }

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  try {
    const queryText = `
      INSERT INTO news 
      (title, content, excerpt, image, category, status, source, author_id, news_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`;
    
    const values = [
      title, content, excerpt || null, image, 
      category || 'General', status || 'draft', 
      source || 'original', req.user.id || req.user.userId,
      newsDate ? new Date(newsDate) : new Date()
    ];

    const result = await pool.query(queryText, values);
    const row = result.rows[0];
    
    // Add _id alias for frontend compatibility
    row._id = row.id;
    
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error('Error inserting news:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT update news berdasarkan ID
 * URL: /api/news/:id
 */
const authorizeNewsEdit = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT author_id FROM news WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    if (!['admin', 'super_admin'].includes(req.user.role) && result.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat mengedit berita sendiri.' });
    }
    next();
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal memeriksa akses berita.' }); }
};
router.put('/:id', authenticate, newsWriters, authorizeNewsEdit, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  let { title, content, excerpt, category, status, source, newsDate } = req.body;

  try {
      // 1. Check ownership BEFORE updating
      const checkQuery = 'SELECT author_id FROM news WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
          return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
      }

      const existingNews = checkResult.rows[0];
      const isMainAdmin = ['super_admin', 'admin'].includes(req.user.role);
      const isAuthor = existingNews.author_id === req.user.id;

      if (!isMainAdmin && !isAuthor) {
          return res.status(403).json({ success: false, message: "Anda hanya dapat mengedit berita anda sendiri." });
      }

      // 2. Prevent non-admin from publishing (Force Draft)
      if (!isMainAdmin) {
          status = 'draft';
      }

      // 3. Process Image
      let image = req.body.image; 
      if (req.file) {
          image = `/uploads/news/${req.file.filename}`;
      }

      // 4. Update DB
      // COALESCE digunakan agar jika nilai tidak dikirim, maka tetap menggunakan nilai lama di DB
      const queryText = `
        UPDATE news 
        SET 
          title = COALESCE($1, title), 
          content = COALESCE($2, content), 
          excerpt = COALESCE($3, excerpt), 
          image = COALESCE($4, image), 
          category = COALESCE($5, category), 
          status = COALESCE($6, status), 
          source = COALESCE($7, source),
          news_date = COALESCE($8, news_date),
          updated_at = NOW()
        WHERE id = $9 
        RETURNING *`;
      
      const values = [
        title, content, excerpt, image, category, status, source, 
        newsDate ? new Date(newsDate) : null, id
      ];
      const result = await pool.query(queryText, values);
      
      const row = result.rows[0];
      row._id = row.id;
  
      res.json({ success: true, data: row });

  } catch (err) {
    console.error('Error updating news:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST publish news berdasarkan ID
 * URL: /api/news/:id/publish
 */
router.post('/:id/publish', authenticate, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = `
      UPDATE news 
      SET 
        status = 'publish',
        published_at = NOW(),
        updated_at = NOW()
      WHERE id = $1 
      RETURNING *`;
    
    const result = await pool.query(queryText, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    const row = result.rows[0];
    row._id = row.id;

    res.json({ success: true, message: 'Berita berhasil dipublish', data: row });
  } catch (err) {
    console.error('Error publishing news:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST return news to draft berdasarkan ID
 * URL: /api/news/:id/return-draft
 */
router.post('/:id/return-draft', authenticate, requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const queryText = `
      UPDATE news 
      SET 
        status = 'draft',
        published_at = NULL,
        updated_at = NOW()
      WHERE id = $1 
      RETURNING *`;
    
    const result = await pool.query(queryText, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    const row = result.rows[0];
    row._id = row.id;

    res.json({ success: true, message: 'Berita berhasil dikembalikan ke draft', data: row });
  } catch (err) {
    console.error('Error returning news to draft:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE news berdasarkan ID
 * URL: /api/news/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Check ownership BEFORE deleting
    const checkQuery = 'SELECT author_id FROM news WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    const existingNews = checkResult.rows[0];
    const isMainAdmin = ['super_admin', 'admin'].includes(req.user.role);
    const isAuthor = existingNews.author_id === req.user.id;

    if (!isMainAdmin && !isAuthor) {
        return res.status(403).json({ success: false, message: "Anda hanya dapat menghapus berita anda sendiri." });
    }

    const queryText = 'DELETE FROM news WHERE id = $1 RETURNING *';
    const result = await pool.query(queryText, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
    }

    res.json({ success: true, message: 'Berita berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting news:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
