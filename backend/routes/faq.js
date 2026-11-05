// routes/faq.js
const express = require('express');
const pool = require('../dbPostgres');
const { auth, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const generateId = () => {
    try {
        return require('crypto').randomUUID();
    } catch (e) {
        return Math.random().toString(36).substring(2, 15);
    }
};

// GET /api/faq - Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = `
        SELECT f.*, 
               u.full_name as author_name, 
               u.username as author_username 
        FROM faqs f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE f.is_active = true
    `;
    const params = [];
    let idx = 1;

    if (category && category !== 'all') {
      query += ` AND f.category = $${idx++}`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (f.question ILIKE $${idx} OR f.answer ILIKE $${idx} OR $${idx} = ANY(f.tags))`;
      params.push(`%${search}%`);
      idx++;
    }
    
    query += ` ORDER BY f."order" ASC, f.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    // Transform snake_case to camelCase
    const faqs = result.rows.map(row => ({
        id: row.id,
        _id: row.id, // Legacy compatibility
        question: row.question,
        answer: row.answer,
        category: row.category,
        tags: row.tags || [],
        isActive: row.is_active,
        order: row.order,
        createdBy: {
            fullName: row.author_name,
            username: row.author_username
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }));
    
    res.json(faqs);
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/faq/all - Admin/Editor
router.get('/all',
  auth, 
  requireRole(['admin', 'editor']), 
  async (req, res) => {
    try {
      const { category, search, isActive } = req.query;
      
      let query = `
        SELECT f.*, 
               u.full_name as author_name, 
               u.username as author_username 
        FROM faqs f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;
      
      if (category && category !== 'all') {
        query += ` AND f.category = $${idx++}`;
        params.push(category);
      }
      
      if (isActive !== undefined) {
        query += ` AND f.is_active = $${idx++}`;
        params.push(isActive === 'true');
      }
      
      if (search) {
        query += ` AND (f.question ILIKE $${idx} OR f.answer ILIKE $${idx} OR $${idx} = ANY(f.tags))`;
        params.push(`%${search}%`);
        idx++;
      }
      
      query += ` ORDER BY f."order" ASC, f.created_at DESC`;

      const result = await pool.query(query, params);
      
      const faqs = result.rows.map(row => ({
        id: row.id,
        _id: row.id, // Legacy compatibility
        question: row.question,
        answer: row.answer,
        category: row.category,
        tags: row.tags || [],
        isActive: row.is_active,
        order: row.order,
        createdBy: {
            fullName: row.author_name,
            username: row.author_username
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      res.json(faqs);
    } catch (error) {
      console.error('Get all FAQ error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// GET /api/faq/:id
router.get('/:id', async (req, res) => {
  try {
    const query = `
        SELECT f.*, 
               u.full_name as author_name, 
               u.username as author_username 
        FROM faqs f
        LEFT JOIN users u ON f.created_by = u.id
        WHERE f.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    const row = result.rows[0];
    
    if (!row) return res.status(404).json({ message: 'FAQ tidak ditemukan' });
    
    // Auth check for inactive logic
    if (!row.is_active) {
         // This logic is tricky without middleware on public route. 
         // Assuming client handles it or sends token if available.
         // If generic public access, we might deny content. 
         // But the requirement said "check headers" which implies manual check or just rely on public list not returning it.
         // Let's implement basic check:
         const authHeader = req.headers.authorization;
         if (!authHeader) return res.status(404).json({ message: 'FAQ tidak ditemukan' });
    }
    
    const faq = {
        id: row.id,
        _id: row.id, // Legacy compatibility
        question: row.question,
        answer: row.answer,
        category: row.category,
        tags: row.tags || [],
        isActive: row.is_active,
        order: row.order,
        createdBy: {
            fullName: row.author_name,
            username: row.author_username
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
    
    res.json(faq);
  } catch (error) {
    console.error('Get FAQ by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/faq
router.post('/', 
  auth, 
  requireRole(['admin', 'editor']), 
  async (req, res) => {
    try {
      const { question, answer, category, tags } = req.body;
      if(!question || !answer || !category) return res.status(400).json({message: "Field required"});

      const newId = generateId();
      
      // Handle Tags
      let finalTags = [];
      if (Array.isArray(tags)) finalTags = tags;
      else if (typeof tags === 'string') finalTags = tags.split(',').map(t => t.trim()).filter(Boolean);

      const query = `
        INSERT INTO faqs (id, question, answer, category, tags, created_by, is_active, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `;
      const values = [
        newId, question, answer, category, finalTags, 
        req.user.userId, true, 0
      ];

      const result = await pool.query(query, values);
      const row = result.rows[0];
      
      // Fetch user info for consistent response
      const userRes = await pool.query('SELECT full_name, username FROM users WHERE id = $1', [req.user.userId]);
      const user = userRes.rows[0];

      res.status(201).json({
        message: 'FAQ berhasil dibuat',
        faq: {
            id: row.id,
            question: row.question,
            answer: row.answer,
            category: row.category,
            tags: row.tags,
            isActive: row.is_active,
            createdBy: { fullName: user.full_name, username: user.username },
            createdAt: row.created_at
        }
      });
    } catch (error) {
      console.error('Create FAQ error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// PUT /api/faq/:id
router.put('/:id',
  auth, 
  requireRole(['admin', 'editor']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check existence & ownership
      const check = await pool.query('SELECT created_by FROM faqs WHERE id = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ message: 'FAQ tidak ditemukan' });
      
      const currentOwner = check.rows[0].created_by;
      if (req.user.role !== 'admin' && currentOwner !== req.user.userId) {
          return res.status(403).json({ message: 'Tidak memiliki akses' });
      }

      const { question, answer, category, tags } = req.body;
      
      let fields = [];
      let values = [];
      let idx = 1;
      
      if (question) { fields.push(`question = $${idx++}`); values.push(question); }
      if (answer) { fields.push(`answer = $${idx++}`); values.push(answer); }
      if (category) { fields.push(`category = $${idx++}`); values.push(category); }
      if (tags) {
           let finalTags = [];
           if (Array.isArray(tags)) finalTags = tags;
           else if (typeof tags === 'string') finalTags = tags.split(',').map(t => t.trim()).filter(Boolean);
           fields.push(`tags = $${idx++}`); values.push(finalTags);
      }
      
      fields.push(`updated_at = NOW()`);
      
      values.push(id);
      const query = `UPDATE faqs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      
      const result = await pool.query(query, values);
      const row = result.rows[0];
      
      res.json({
        message: 'FAQ berhasil diupdate',
        faq: {
            id: row.id,
            question: row.question,
            answer: row.answer,
            tags: row.tags,
            category: row.category,
            isActive: row.is_active
        }
      });
    } catch (error) {
      console.error('Update FAQ error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// DELETE /api/faq/:id
router.delete('/:id',
  auth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM faqs WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ message: 'FAQ tidak ditemukan' });
      
      res.json({ message: 'FAQ berhasil dihapus' });
    } catch (error) {
      console.error('Delete FAQ error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// PATCH /api/faq/:id/toggle
router.patch('/:id/toggle',
  auth, 
  requireRole(['admin', 'editor']), 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const check = await pool.query('SELECT is_active, created_by FROM faqs WHERE id = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ message: 'FAQ tidak ditemukan' });
      
      const row = check.rows[0];
      if (req.user.role !== 'admin' && row.created_by !== req.user.userId) {
          return res.status(403).json({ message: 'Tidak memiliki akses' });
      }

      const newStatus = !row.is_active;
      const result = await pool.query('UPDATE faqs SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newStatus, id]);
      const updated = result.rows[0];

      res.json({
        message: `FAQ berhasil ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
        faq: { id: updated.id, isActive: updated.is_active }
      });
    } catch (error) {
      console.error('Toggle FAQ status error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// PUT /api/faq/reorder
router.put('/reorder',
  auth, 
  requireRole(['admin']), 
  async (req, res) => {
    try {
      const { faqIds } = req.body;
      if (!Array.isArray(faqIds)) return res.status(400).json({ message: 'FAQ IDs harus array' });

      // Transaction for safety
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (let i = 0; i < faqIds.length; i++) {
            await client.query('UPDATE faqs SET "order" = $1 WHERE id = $2', [i + 1, faqIds[i]]);
        }
        
        await client.query('COMMIT');
        res.json({ message: 'Urutan FAQ berhasil diupdate' });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Reorder FAQ error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;
