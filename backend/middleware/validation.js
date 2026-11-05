const Joi = require('joi');

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Format email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password minimal 6 karakter',
      'any.required': 'Password wajib diisi'
    })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validasi gagal', 
      errors: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateNews = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    excerpt: Joi.string().max(300).required(),
    fullContent: Joi.string().required(),
    author: Joi.string().default('Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan'),
    readTime: Joi.string().default('3 menit'),
    icon: Joi.string().default('fas fa-newspaper'),
    tags: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
    featured: Joi.boolean().default(false),
    imageAlt: Joi.string(),
    imageCaption: Joi.string()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validasi gagal', 
      errors: error.details.map(detail => detail.message) 
    });
  }
  next();
};

const validateFAQ = (req, res, next) => {
  const schema = Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    category: Joi.string().valid('dasar', 'daftar', 'praktis', 'masalah', 'teknis', 'pemerintah').required(),
    tags: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ),
    isActive: Joi.boolean().default(true),
    order: Joi.number().default(0)
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validasi gagal', 
      errors: error.details.map(detail => detail.message) 
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateNews,
  validateFAQ
};