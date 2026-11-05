// routes/news.js - Updated for SISMONEV PAUD HI
const express = require("express");
const News = require("../models/News");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// ==================== SISMONEV PAUD HI NEWS ROUTES ====================

// Helper: normalize image input (supports JSON string/object/relative/filename)
const normalizeImageInput = (raw) => {
  if (!raw) return null;
  let value = raw;
  if (typeof value === 'string') {
    // Try parse JSON string
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && parsed.url) {
        value = parsed.url;
      }
    } catch (_) {
      // not JSON, keep as is
    }
  } else if (typeof value === 'object') {
    if (value.url) value = value.url;
    else if (value.relativePath) value = value.relativePath;
    else if (value.filename) value = value.filename;
    else value = null;
  }
  if (!value) return null;
  return String(value);
};

// Helper: build full URL from possibly relative/filename
const toFullImageUrl = (baseUrl, imageValue) => {
  if (!imageValue) return null;
  const v = String(imageValue);
  if (v.startsWith('http')) return v;
  if (v.startsWith('/uploads/')) return `${baseUrl}${v}`;
  if (v.startsWith('uploads/')) return `${baseUrl}/${v}`;
  return `${baseUrl}/uploads/news/${v}`;
};

// GET /api/news/admin - Get all news for admin (including drafts and published)
router.get("/admin", authenticate, authorize(["super_admin"]), async (req, res) => {
  try {
    console.log("📰 Admin News GET request received");
    console.log("👤 Admin:", `${req.user.role} (${req.user.email})`);
    
    const { status, page = 1, limit = 50, search } = req.query;
    
    let query = { isActive: true };
    
    // Admin can filter by status
    if (status && status !== "all") {
      query.status = status;
      console.log(`🔍 Filtering by status: ${status}`);
    } else {
      console.log("👑 Admin viewing all statuses (draft, publish)");
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
      console.log(`🔍 Search applied for: "${search}"`);
    }

    console.log("📋 Final admin query:", JSON.stringify(query, null, 2));

    let news = await News.find(query)
      .populate("author", "fullName email klName klId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(query);

    // Count by status for admin dashboard
    const statusCounts = await News.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    console.log(`✅ Admin found ${news.length} news items (${total} total)`);
    console.log("📊 Status counts:", statusCounts);

    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error("❌ Admin News GET error:", error);
    res.status(500).json({
      success: false,
      message: "Error saat mengambil data berita admin",
      error: error.message,
    });
  }
});

// GET /api/news - Get news with flexible status filtering

router.get("/", optionalAuth, async (req, res) => {
  try {
    console.log("📰 News GET request received");
    console.log("👤 User:", req.user ? `${req.user.role} (${req.user.email})` : 'Public user');
    console.log("🔍 Query params:", req.query);
    console.log("🔐 Authentication status:", req.user ? 'Authenticated' : 'Not authenticated');
    console.log("👑 User role:", req.user?.role || 'No role');
    
    const { page = 1, limit = 50, search, category, status } = req.query;
    
    // Build query based on user role and status filter
    let query = { isActive: true };
    
    // Handle status filtering
    if (status && status !== "all") {
      // Specific status filter
      query.status = status;
      console.log(`🔍 Filtering by specific status: ${status}`);
    } else if (status === "all" || status === undefined) {
      // Show all statuses for admin users
      if (req.user && req.user.role === "super_admin") {
        console.log("👑 Super admin - showing all statuses (draft + publish)");
        // Don't add status filter - show all
      } else if (req.user && req.user.role === "admin_kl") {
        console.log("👤 K/L Admin - showing all statuses (draft + publish)");
        // Don't add status filter - show all
      } else {
        // Public users can only see published news
        query.status = 'publish';
        console.log("🔒 Public user - showing only published news");
      }
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
      console.log(`🔍 Search applied for: "${search}"`);
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
      console.log(`🔍 Filtering by category: ${category}`);
    }

    console.log("📋 Final query:", JSON.stringify(query, null, 2));
    console.log("🔍 Query explanation:");
    console.log(`   - isActive: ${query.isActive}`);
    console.log(`   - status filter: ${query.status || 'ALL STATUSES'}`);
    console.log(`   - search filter: ${query.$or ? 'Applied' : 'None'}`);
    console.log(`   - category filter: ${query.category || 'All categories'}`);

    // Debug: Check database directly
    console.log("🔍 Checking database directly...");
    const allNews = await News.find({});
    console.log(`📊 Total news in database: ${allNews.length}`);
    allNews.forEach((item, index) => {
      console.log(`   📰 News ${index + 1}: ID=${item._id}, Title="${item.title}", Status=${item.status}, isActive=${item.isActive}`);
    });

    let news = await News.find(query)
      .populate("author", "fullName email klName klId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await News.countDocuments(query);

    // Normalize image URLs in response without mutating DB
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    news = news.map((doc) => {
      const n = doc.toObject({ virtuals: true });
      if (n.image) {
        if (typeof n.image === 'string') {
          if (n.image.startsWith('http')) {
            // ok
          } else if (n.image.startsWith('/uploads/')) {
            n.image = `${baseUrl}${n.image}`;
          } else if (n.image.startsWith('uploads/')) {
            n.image = `${baseUrl}/${n.image}`;
          } else {
            n.image = `${baseUrl}/uploads/news/${n.image}`;
          }
        } else if (n.image && typeof n.image === 'object' && n.image.url) {
          const url = n.image.url;
          if (url.startsWith('http')) {
            n.image = url;
          } else if (url.startsWith('/uploads/')) {
            n.image = `${baseUrl}${url}`;
          } else {
            n.image = `${baseUrl}/${url.replace(/^\//,'')}`;
          }
        }
      }
      return n;
    });

    console.log(`✅ Found ${news.length} news items (${total} total)`);
    if (news.length > 0) {
      console.log("📰 News titles:", news.map(n => `${n.title} (${n.status})`));
    }

    res.json({
      success: true,
      data: news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ News GET error:", error);
    res.status(500).json({
      success: false,
      message: "Error saat mengambil data berita",
      error: error.message,
    });
  }
});

// POST /api/news - Create news (auto-set to draft for K/L operators)
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    console.log("📰 News POST request received");
    console.log("📋 Request body:", req.body);
    console.log("📁 File:", req.file);
    console.log("👤 User:", req.user);
    console.log("🔍 Available fields:", Object.keys(req.body));
    console.log("📝 Content field value:", req.body.content);
    console.log("📝 Title field value:", req.body.title);
    console.log("📝 Excerpt field value:", req.body.excerpt);
    
    // Debug: Log semua field values
    Object.keys(req.body).forEach(key => {
      console.log(`🔍 Field ${key}:`, {
        value: req.body[key],
        type: typeof req.body[key],
        length: req.body[key] ? req.body[key].length : 0
      });
    });
    
    // Prepare news data with standardized field handling
    const newsData = {
      title: req.body.title || '',
      content: req.body.content || '', // Use only content field
      excerpt: req.body.excerpt || '',
      status: req.body.status || 'draft',
      category: req.body.category || 'general',
      author: req.user._id,
      isActive: true
    };
    
    // Add image if uploaded - save full URL for consistency
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      newsData.image = `${baseUrl}/uploads/news/${req.file.filename}`;
      console.log("🖼️ Image field saved:", {
        filename: req.file.filename,
        fullUrl: newsData.image,
        imageType: typeof newsData.image,
        baseUrl: baseUrl,
        envBaseUrl: process.env.BASE_URL
      });
    } else if (req.body.image) {
      // Accept image as string URL, relative path, filename, or JSON object/string
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const normalized = normalizeImageInput(req.body.image);
      newsData.image = toFullImageUrl(baseUrl, normalized);
      console.log("🖼️ Image field from body (normalized):", {
        input: req.body.image,
        normalized,
        fullUrl: newsData.image
      });
    }
    
    console.log("📋 Final news data:", newsData);
    console.log("🖼️ Image field details:", {
      hasFile: !!req.file,
      filename: req.file?.filename,
      imageType: typeof newsData.image,
      imageValue: newsData.image
    });
    
    // Validate required fields with better error messages
    if (!newsData.title || typeof newsData.title !== 'string' || !newsData.title.trim()) {
      console.log("❌ Title validation failed:", { 
        hasValue: !!newsData.title, 
        type: typeof newsData.title, 
        value: newsData.title,
        trimmed: newsData.title ? newsData.title.trim() : null
      });
      return res.status(400).json({
        success: false,
        message: "Judul berita tidak boleh kosong"
      });
    }
    
    if (!newsData.content || typeof newsData.content !== 'string' || !newsData.content.trim()) {
      console.log("❌ Content validation failed:", { 
        hasValue: !!newsData.content, 
        type: typeof newsData.content, 
        value: newsData.content,
        trimmed: newsData.content ? newsData.content.trim() : null
      });
      return res.status(400).json({
        success: false,
        message: "Konten berita tidak boleh kosong"
      });
    }
    
    if (!newsData.excerpt || typeof newsData.excerpt !== 'string' || !newsData.excerpt.trim()) {
      console.log("❌ Excerpt validation failed:", { 
        hasValue: !!newsData.excerpt, 
        type: typeof newsData.excerpt, 
        value: newsData.excerpt,
        trimmed: newsData.excerpt ? newsData.excerpt.trim() : null
      });
      return res.status(400).json({
        success: false,
        message: "Ringkasan berita tidak boleh kosong"
      });
    }
    
    console.log("✅ All validations passed, saving to database...");
    const news = new News(newsData);
    await news.save();

    console.log("✅ News saved, populating author...");
    const populatedNews = await news.populate("author", "fullName email klName klId");
    
    console.log("✅ News created successfully:", populatedNews._id);

    res.status(201).json({
      success: true,
      message: "Berita berhasil dibuat (status: draft, menunggu approval superadmin)",
      data: populatedNews,
    });
  } catch (err) {
    console.error("❌ News POST error:", err);
    console.error("❌ Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validasi data gagal",
        errors: validationErrors
      });
    }
    
    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: "Database error saat membuat berita",
        error: err.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error saat membuat berita",
      error: err.message,
    });
  }
});

// PUT /api/news/:id - Update news (only author or superadmin)
router.put("/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📰 News PUT request for ID: ${id}`);
    console.log("📋 Update data:", req.body);
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }
    
    // Check ownership or superadmin access
    if (news.author.toString() !== req.user._id.toString() && 
        req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengedit berita ini",
      });
    }
    
    // Only superadmin can change status to publish
    if (req.body.status === "publish" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Hanya superadmin yang dapat mengubah status berita menjadi publish",
      });
    }
    
    // Process update data
    const updateData = { ...req.body };

    // Handle image update - save full URL for consistency
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      updateData.image = `${baseUrl}/uploads/news/${req.file.filename}`;
      console.log("🖼️ Image updated:", {
        filename: req.file.filename,
        fullUrl: updateData.image,
        imageType: typeof updateData.image
      });
    } else if (updateData.image) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const normalized = normalizeImageInput(updateData.image);
      updateData.image = toFullImageUrl(baseUrl, normalized);
      console.log("🖼️ Image updated from body (normalized):", {
        input: req.body.image,
        normalized,
        fullUrl: updateData.image
      });
    }
    
    // Standardize content field - use only content
    if (updateData.fullContent && !updateData.content) {
      updateData.content = String(updateData.fullContent);
    }
    
    // Remove fullContent field to avoid confusion
    delete updateData.fullContent;
    
    // Ensure content field is string
    if (updateData.content) {
      updateData.content = String(updateData.content);
    }
    if (updateData.title) {
      updateData.title = String(updateData.title);
    }
    if (updateData.excerpt) {
      updateData.excerpt = String(updateData.excerpt);
    }
    
    // Validate required fields before update
    if (updateData.title && (typeof updateData.title !== 'string' || !updateData.title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Judul berita tidak boleh kosong"
      });
    }
    
    if (updateData.content && (typeof updateData.content !== 'string' || !updateData.content.trim())) {
      return res.status(400).json({
        success: false,
        message: "Konten berita tidak boleh kosong"
      });
    }
    
    console.log("📝 Final update data:", updateData);
    
    const updatedNews = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "fullName email klName klId");

    res.json({
      success: true,
      message: "Berita berhasil diupdate",
      data: updatedNews,
    });
  } catch (error) {
    console.error("❌ News PUT error:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validasi data gagal",
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error saat mengupdate berita",
      error: error.message,
    });
  }
});

// POST /api/news/:id/publish - Publish news (superadmin only)
router.post("/:id/publish", authenticate, authorize(["super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📰 Publish news request for ID: ${id}`);
    console.log("👤 Superadmin:", `${req.user.role} (${req.user.email})`);
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan"
      });
    }
    
    if (news.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: "Berita harus dalam status draft untuk dapat dipublish"
      });
    }
    
    // Publish the news
    await news.publish(req.user._id);
    
    console.log(`✅ News published: ${news.title}`);
    
    res.json({
      success: true,
      message: "Berita berhasil dipublish",
      data: news
    });
  } catch (error) {
    console.error("❌ Error publishing news:", error);
    res.status(500).json({
      success: false,
      message: "Error saat publish berita",
      error: error.message
    });
  }
});

// POST /api/news/:id/return-draft - Return news to draft (superadmin only)
router.post("/:id/return-draft", authenticate, authorize(["super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📰 Return to draft request for news ID: ${id}`);
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan"
      });
    }
    
    await news.returnToDraft();
    
    res.json({
      success: true,
      message: "Berita berhasil dikembalikan ke draft",
      data: news
    });
  } catch (error) {
    console.error("❌ Error returning news to draft:", error);
    res.status(500).json({
      success: false,
      message: "Error saat mengembalikan berita ke draft",
      error: error.message
    });
  }
});

// DELETE /api/news/:id - Delete news (only author or superadmin)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📰 News DELETE request for ID: ${id}`);
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }
    
    // Check ownership or superadmin access
    if (news.author.toString() !== req.user._id.toString() && 
        req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk menghapus berita ini",
      });
    }
    
    await News.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: "Berita berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ News DELETE error:", error);
    res.status(500).json({
      success: false,
      message: "Error saat hapus berita",
      error: error.message,
    });
  }
});

// GET /api/news/:id - Get news by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📰 News detail request for ID: ${id}`);
    
    const news = await News.findById(id).populate("author", "fullName email klName klId");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan",
      });
    }
    
    // For public access, only show published news
    if (!req.user || req.user.role !== "super_admin") {
      if (news.status !== "publish") {
        return res.status(404).json({
          success: false,
          message: "Berita tidak ditemukan",
        });
      }
    }
    
    // Increment views
    news.views += 1;
    await news.save();
    
    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("❌ News detail error:", error);
    res.status(500).json({
      success: false,
      message: "Error saat mengambil detail berita",
      error: error.message,
    });
  }
});

module.exports = router;
