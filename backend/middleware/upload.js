const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID, createHash } = require('crypto');
const uploadRoot = path.resolve(__dirname, '../uploads/news');
const ownerPrefix = user => createHash('sha256').update(String(user.id || user.userId)).digest('hex').slice(0, 24);
const parser = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5, fields: 30, fieldSize: 1024 * 1024 } });
function handleMulterError(error, req, res, next) {
  if (!error) return next();
  const tooLarge = error.code === 'LIMIT_FILE_SIZE';
  res.status(tooLarge ? 413 : 400).json({ success: false, message: tooLarge ? 'File terlalu besar. Maksimal 5MB.' : 'Gambar tidak valid atau batas unggahan terlampaui. Gunakan JPEG, PNG, GIF, atau WebP.' });
}
function validatedUpload(parse) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Silakan masuk terlebih dahulu.' });
    parse(req, res, async error => {
      if (error) return handleMulterError(error, req, res, next);
      const files = req.files || (req.file ? [req.file] : []);
      const written = [];
      try {
        // Decode and re-encode before writing to the public directory. Client MIME and extension are untrusted.
        const images = await Promise.all(files.map(async file => {
          const image = sharp(file.buffer, { limitInputPixels: 25000000, failOn: 'warning' });
          const metadata = await image.metadata();
          if (!['jpeg', 'png', 'gif', 'webp'].includes(metadata.format)) throw new Error('Unsupported image');
          const buffer = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
          return { file, buffer };
        }));
        if (images.length) await fs.mkdir(uploadRoot, { recursive: true });
        for (const { file, buffer } of images) {
          const filename = `${ownerPrefix(req.user)}-${randomUUID()}.webp`;
          const filePath = path.join(uploadRoot, filename);
          await fs.writeFile(filePath, buffer, { flag: 'wx' });
          written.push(filePath);
          delete file.buffer;
          Object.assign(file, { filename, path: filePath, destination: uploadRoot, mimetype: 'image/webp', size: buffer.length });
        }
        next();
      } catch (err) {
        await Promise.all(written.map(file => fs.unlink(file).catch(() => {})));
        handleMulterError(err, req, res, next);
      }
    });
  };
}
module.exports = { single: field => validatedUpload(parser.single(field)), uploadMultiple: { array: (field, count) => validatedUpload(parser.array(field, count)) }, handleMulterError, uploadRoot, ownerPrefix };
