// routes/pembelajaran.js - Backend Routes untuk Pembelajaran
const express = require("express");
const pool = require("../dbPostgres");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { v4: uuidv4 } = require('uuid'); 
const {
  restrictToOwnKL,
  filterByKL,
  validateDataAccess,
} = require("../middleware/klAccessControl");

const generateId = () => {
    try {
        return require('crypto').randomUUID();
    } catch (e) {
        return Math.random().toString(36).substring(2, 15);
    }
};

// ===== GET ALL PEMBELAJARAN =====
router.get("/", async (req, res) => {
  try {
    const {
      type,
      page = 1,
      limit = 10,
      search,
      category,
      aspect,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const offset = (page - 1) * limit;

    let queryText = `SELECT * FROM pembelajaran WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (type) {
      queryText += ` AND type = $${idx++}`;
      params.push(type);
    }
    
    if (category) {
      queryText += ` AND category ILIKE $${idx++}`;
      params.push(`%${category}%`);
    }

    if (aspect) {
      queryText += ` AND aspect = $${idx++}`;
      params.push(aspect);
    }

    if (search) {
      queryText += ` AND (title ILIKE $${idx} OR description ILIKE $${idx} OR $${idx} = ANY(tags))`;
      params.push(`%${search}%`);
      idx++;
    }

    // Sort
    const validSorts = ['created_at', 'views', 'downloads', 'likes', 'rating', 'title'];
    const safeSortBy = validSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    queryText += ` ORDER BY ${safeSortBy} ${safeOrder} LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    // Count Total
    let countQuery = `SELECT COUNT(*) FROM pembelajaran WHERE 1=1`;
    const countParams = params.slice(0, idx - 3); // remove limit/offset
    
    // Reconstruct where for count (simplistic)
    let whereClause = "";
    let cIdx = 1;
    if (type) { whereClause += ` AND type = $${cIdx++}`; }
    if (category) { whereClause += ` AND category ILIKE $${cIdx++}`; }
    if (aspect) { whereClause += ` AND aspect = $${cIdx++}`; }
    if (search) { whereClause += ` AND (title ILIKE $${cIdx} OR description ILIKE $${cIdx} OR $${cIdx} = ANY(tags))`; cIdx++; }

    const result = await pool.query(queryText, params);
    const countRes = await pool.query(countQuery + whereClause, countParams);
    
    const total = parseInt(countRes.rows[0].count);
    
    // Map snake_case keys to camelCase for frontend
    const data = result.rows.map(row => ({
        id: row.id,
        _id: row.id, // Legacy compatibility
        title: row.title,
        description: row.description,
        type: row.type,
        category: row.category,
        author: row.author,
        ageGroup: row.age_group,
        aspect: row.aspect,
        tags: row.tags,
        stakeholder: row.stakeholder,
        thumbnail: row.thumbnail,
        pdfUrl: row.pdf_url,
        youtubeId: row.youtube_id,
        duration: row.duration,
        format: row.format,
        features: row.features,
        usage: row.usage,
        pages: row.pages,
        views: row.views,
        downloads: row.downloads,
        likes: row.likes,
        rating: row.rating,
        isActive: row.is_active,
        publishDate: row.publish_date,
        createdBy: row.created_by,
        createdByFullName: row.created_by_fullname,
        createdByKL: row.created_by_kl,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }));

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get pembelajaran error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== GET PEMBELAJARAN BY ID =====
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pembelajaran WHERE id = $1', [req.params.id]);
    const row = result.rows[0];
    
    if (!row) return res.status(404).json({ message: "Pembelajaran tidak ditemukan" });

    // Map to camelCase
    const data = {
        id: row.id,
        _id: row.id, // Legacy compatibility
        title: row.title,
        description: row.description,
        type: row.type,
        category: row.category,
        author: row.author,
        ageGroup: row.age_group,
        aspect: row.aspect,
        tags: row.tags,
        stakeholder: row.stakeholder,
        thumbnail: row.thumbnail,
        pdfUrl: row.pdf_url,
        youtubeId: row.youtube_id,
        duration: row.duration,
        format: row.format,
        features: row.features,
        usage: row.usage,
        pages: row.pages,
        views: row.views,
        downloads: row.downloads,
        likes: row.likes,
        rating: row.rating,
        isActive: row.is_active,
        publishDate: row.publish_date,
        createdBy: row.created_by,
        createdByFullName: row.created_by_fullname,
        createdByKL: row.created_by_kl,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };

    res.json(data);
  } catch (error) {
    console.error("❌ Get pembelajaran by ID error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== CREATE PEMBELAJARAN =====
router.post("/", authenticate, restrictToOwnKL, async (req, res) => {
  try {
    const {
      title, description, type, category, author,
      ageGroup, aspect, tags, stakeholder, thumbnail,
      publishDate, isActive = true,
      pages, pdfUrl, youtubeId, duration, format, features, usage
    } = req.body;

    // Validation
    if (!title || !description || !type || !category || !author) {
      return res.status(400).json({ message: "Field wajib: title, description, type, category, author" });
    }

    // Type specific validation
    if (type === "panduan" && !pdfUrl) return res.status(400).json({ message: "PDF URL wajib untuk panduan" });
    if (type === "video" && !youtubeId) return res.status(400).json({ message: "YouTube ID wajib untuk video" });
    if (type === "tools" && !format) return res.status(400).json({ message: "Format wajib untuk tools" });

    const newId = generateId();
    const finalTags = Array.isArray(tags) ? tags : [];
    const finalFeatures = Array.isArray(features) ? features : [];
    
    const query = `
        INSERT INTO pembelajaran (
            id, title, description, type, category, author, age_group, aspect, tags, stakeholder, thumbnail,
            pdf_url, youtube_id, duration, format, features, usage, pages,
            views, downloads, likes, rating, is_active, publish_date,
            created_by, created_by_fullname, created_by_kl, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17, $18,
            0, 0, 0, 0, $19, $20,
            $21, $22, $23, NOW(), NOW()
        ) RETURNING *
    `;
    
    const values = [
        newId, title.trim(), description.trim(), type, category.trim(), author.trim(), ageGroup, aspect, finalTags, stakeholder, thumbnail,
        pdfUrl, youtubeId, duration, format, finalFeatures, usage, pages ? parseInt(pages) : null,
        isActive, publishDate || new Date(),
        req.user.id, req.user.fullName, req.user.klName
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    // Map back for response or just simple ok
    res.status(201).json({
      message: "Pembelajaran berhasil dibuat",
      pembelajaran: { id: row.id, title: row.title, type: row.type }
    });
  } catch (error) {
    console.error("❌ Create pembelajaran error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== UPDATE PEMBELAJARAN =====
router.put("/:id", authenticate, validateDataAccess("Pembelajaran"), restrictToOwnKL, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    // Dynamic Update
    let fields = [];
    let values = [];
    let idx = 1;

    const mapField = (jsField, dbField) => {
        if (body[jsField] !== undefined) {
             fields.push(`${dbField} = $${idx++}`);
             values.push(body[jsField]);
        }
    };
    
    // Mapping common fields
    mapField('title', 'title');
    mapField('description', 'description');
    mapField('category', 'category');
    mapField('author', 'author');
    mapField('ageGroup', 'age_group');
    mapField('aspect', 'aspect');
    mapField('stakeholder', 'stakeholder');
    mapField('thumbnail', 'thumbnail');
    mapField('isActive', 'is_active');
    mapField('publishDate', 'publish_date');
    
    // Type specific
    mapField('pages', 'pages');
    mapField('pdfUrl', 'pdf_url');
    mapField('youtubeId', 'youtube_id');
    mapField('duration', 'duration');
    mapField('format', 'format');
    mapField('usage', 'usage');

    if (body.tags !== undefined) {
        fields.push(`tags = $${idx++}`);
        values.push(Array.isArray(body.tags) ? body.tags : []);
    }
    if (body.features !== undefined) {
        fields.push(`features = $${idx++}`);
        values.push(Array.isArray(body.features) ? body.features : []);
    }
    
    fields.push(`updated_at = NOW()`);
    
    if (fields.length <= 1) return res.json({ message: "Nothing to update" }); // only updated_at

    values.push(id);
    const query = `UPDATE pembelajaran SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Pembelajaran tidak ditemukan" });

    res.json({
      message: "Pembelajaran berhasil diupdate",
      pembelajaran: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Update pembelajaran error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== DELETE PEMBELAJARAN =====
router.delete("/:id", authenticate, validateDataAccess("Pembelajaran"), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pembelajaran WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Pembelajaran tidak ditemukan" });
    res.json({ message: "Pembelajaran berhasil dihapus" });
  } catch (error) {
    console.error("❌ Delete pembelajaran error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== TOGGLE STATUS =====
router.patch("/:id/toggle", async (req, res) => {
  try {
    const result = await pool.query('SELECT is_active FROM pembelajaran WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Pembelajaran tidak ditemukan" });
    
    const newStatus = !result.rows[0].is_active;
    const update = await pool.query('UPDATE pembelajaran SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newStatus, req.params.id]);
    
    res.json({
      message: `Pembelajaran berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
      pembelajaran: { id: update.rows[0].id, isActive: update.rows[0].is_active }
    });
  } catch (error) {
    console.error("❌ Toggle status error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== BULK OPERATIONS =====
router.post("/bulk", async (req, res) => {
  try {
    const { type, ids } = req.body;
    if (!type || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Type dan IDs wajib diisi" });
    }

    let result;
    if (type === 'delete') {
         result = await pool.query('DELETE FROM pembelajaran WHERE id = ANY($1)', [ids]);
         res.json({ message: `${result.rowCount} pembelajaran berhasil dihapus`, deletedCount: result.rowCount });
    } else if (type === 'activate') {
         result = await pool.query('UPDATE pembelajaran SET is_active = true, updated_at = NOW() WHERE id = ANY($1)', [ids]);
         res.json({ message: `${result.rowCount} pembelajaran berhasil diaktifkan`, modifiedCount: result.rowCount });
    } else if (type === 'deactivate') {
         result = await pool.query('UPDATE pembelajaran SET is_active = false, updated_at = NOW() WHERE id = ANY($1)', [ids]);
         res.json({ message: `${result.rowCount} pembelajaran berhasil dinonaktifkan`, modifiedCount: result.rowCount });
    } else {
        res.status(400).json({ message: "Type tidak valid" });
    }
  } catch (error) {
    console.error("❌ Bulk operation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== UPDATE STATS (views, downloads, likes) =====
router.patch("/:id/stats", async (req, res) => {
  try {
    const { type } = req.body;
    let col = "";
    if (type === 'view') col = 'views';
    else if (type === 'download') col = 'downloads';
    else if (type === 'like') col = 'likes';
    else return res.status(400).json({ message: "Type stats tidak valid" });

    const result = await pool.query(`UPDATE pembelajaran SET ${col} = ${col} + 1, updated_at = NOW() WHERE id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Pembelajaran tidak ditemukan" });

    res.json({ message: `${type} berhasil diupdate`, pembelajaran: result.rows[0] });
  } catch (error) {
    console.error("❌ Update stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== GET POPULAR PEMBELAJARAN =====
router.get("/popular/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;

    const result = await pool.query(
        'SELECT * FROM pembelajaran WHERE type = $1 AND is_active = true ORDER BY views DESC LIMIT $2',
        [type, parseInt(limit)]
    );

    res.json({ data: result.rows, type, limit: parseInt(limit) });
  } catch (error) {
    console.error("❌ Get popular pembelajaran error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== SEARCH PEMBELAJARAN =====
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { type } = req.query;
    
    let sql = 'SELECT * FROM pembelajaran WHERE is_active = true AND (title ILIKE $1 OR description ILIKE $1)';
    const params = [`%${query}%`];
    
    if (type && type !== 'all') {
        sql += ` AND type = $2`;
        params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT 20';
    
    const result = await pool.query(sql, params);
    
    res.json({
      data: result.rows,
      query,
      type: type || "all",
      count: result.rows.length,
    });
  } catch (error) {
    console.error("❌ Search pembelajaran error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ===== GET STATS SUMMARY =====
router.get("/stats/summary", async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) as count FROM pembelajaran');
    const activeRes = await pool.query('SELECT COUNT(*) as count FROM pembelajaran WHERE is_active = true');
    
    const typeStatsRes = await pool.query(`
        SELECT type, COUNT(*) as count, SUM(views) as views, SUM(downloads) as downloads, SUM(likes) as likes 
        FROM pembelajaran 
        GROUP BY type
    `);
    
    const total = parseInt(totalRes.rows[0].count);
    const active = parseInt(activeRes.rows[0].count);
    
    const byType = {};
    typeStatsRes.rows.forEach(row => {
        byType[row.type] = {
            count: parseInt(row.count),
            views: parseInt(row.views || 0),
            downloads: parseInt(row.downloads || 0),
            likes: parseInt(row.likes || 0)
        };
    });

    res.json({
      total,
      active,
      inactive: total - active,
      byType
    });
  } catch (error) {
    console.error("❌ Get stats summary error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
