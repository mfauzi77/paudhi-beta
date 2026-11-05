const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const upload = require('../middleware/upload');
const { authenticate, requireRole } = require('../middleware/auth');
const router = express.Router();
const mainAdmin = user => ['admin', 'super_admin'].includes(user.role);
router.use(authenticate, requireRole(['admin', 'super_admin', 'admin_kl', 'admin_daerah', 'editor']));
const info = file => ({ filename: file.filename, originalName: file.originalname, url: `/uploads/news/${file.filename}`, relativePath: `/uploads/news/${file.filename}`, size: file.size, mimetype: file.mimetype });
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Gambar diperlukan.' });
  const image = { ...info(req.file), alt: String(req.body.alt || ''), caption: String(req.body.caption || '') };
  res.status(201).json({ success: true, image, imageUrl: image.url, filename: image.filename });
});
router.post('/multiple', upload.uploadMultiple.array('images', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'Gambar diperlukan.' });
  const images = req.files.map(info);
  res.status(201).json({ success: true, images, count: images.length });
});
async function resolveFile(req, res, next) {
  try {
    let filename = req.body?.filename || req.query.filename;
    const url = req.body?.imageUrl || req.query.url;
    if (!filename && typeof url === 'string') {
      const pathname = decodeURIComponent(new URL(url, 'http://upload.local').pathname);
      if (!pathname.startsWith('/uploads/news/')) throw new Error('Invalid path');
      filename = pathname.slice('/uploads/news/'.length);
    }
    if (typeof filename !== 'string' || !/^[a-zA-Z0-9_-]+\.(?:jpe?g|png|gif|webp)$/i.test(filename)) return res.status(400).json({ success: false, message: 'Nama file tidak valid.' });
    if (!mainAdmin(req.user) && !filename.startsWith(upload.ownerPrefix(req.user) + '-')) return res.status(403).json({ success: false, message: 'Anda hanya dapat mengelola unggahan sendiri.' });
    const filePath = path.resolve(upload.uploadRoot, filename);
    if (path.dirname(filePath) !== upload.uploadRoot) throw new Error('Invalid path');
    const stat = await fs.lstat(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid file');
    req.uploadedFile = { filename, filePath, stat };
    next();
  } catch (err) { res.status(err.code === 'ENOENT' ? 404 : 400).json({ success: false, message: 'File tidak ditemukan atau tidak valid.' }); }
}
router.delete('/image', resolveFile, async (req, res, next) => {
  try { await fs.unlink(req.uploadedFile.filePath); res.json({ success: true, deletedFile: req.uploadedFile.filename }); } catch (error) { next(error); }
});
router.get('/image/metadata', resolveFile, (req, res) => {
  const { filename, stat } = req.uploadedFile;
  res.json({ success: true, metadata: { ...info({ filename, size: stat.size }), created: stat.birthtime, modified: stat.mtime, exists: true } });
});
router.get('/list', async (req, res, next) => {
  try {
    if (req.query.category && req.query.category !== 'news') return res.status(400).json({ success: false, message: 'Kategori tidak valid.' });
    const limit = Number(req.query.limit || 50);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ success: false, message: 'Limit harus antara 1 dan 100.' });
    const entries = await fs.readdir(upload.uploadRoot, { withFileTypes: true }).catch(err => { if (err.code === 'ENOENT') return []; throw err; });
    const files = entries.filter(entry => entry.isFile() && /^[a-zA-Z0-9_-]+\.(?:jpe?g|png|gif|webp)$/i.test(entry.name) && (mainAdmin(req.user) || entry.name.startsWith(upload.ownerPrefix(req.user) + '-'))).slice(0, limit);
    const images = await Promise.all(files.map(async entry => {
      const stat = await fs.stat(path.join(upload.uploadRoot, entry.name));
      return { ...info({ filename: entry.name, size: stat.size }), created: stat.birthtime, modified: stat.mtime };
    }));
    res.json({ success: true, images, count: images.length, category: 'news' });
  } catch (error) { next(error); }
});
router.use((error, req, res, next) => { console.error('Upload operation failed:', error.code || 'INTERNAL_ERROR'); res.status(500).json({ success: false, message: 'Pengelolaan gambar gagal. Silakan coba kembali.' }); });
module.exports = router;
