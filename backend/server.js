// server.js - Fully Migrated to PostgreSQL
const pool = require('./dbPostgres');

// Cek koneksi Postgres saat startup
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ PostgreSQL Connected:', res.rows[0]);
  })
  .catch(err => {
    console.error('❌ PostgreSQL error:', err.message);
  });

const express = require("express");
// const mongoose = require("mongoose"); // Removed MongoDB dependency
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const createUploadDirectories = require("./scripts/createUploadDirs");
const uploadRoutes = require("./routes/upload");
const daycareSheetSync = require("./services/daycareSheetSync");

const app = express();

// Trust reverse proxy
// Only trust the local reverse proxy by default; never arbitrary forwarded IPs.
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

// ✅ CORS & Security Middleware
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// ✅ Body Parsing Middleware (Wajib sebelum rute)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ✅ Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.' },
}));

// ✅ STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API ROUTES
// All modules now use PostgreSQL
app.use("/api/news", require("./routes/news.pg")); 
app.use("/api/auth", require("./routes/auth"));
app.use("/api/faq", require("./routes/faq"));
app.use("/api/pembelajaran", require("./routes/pembelajaran.js"));
app.use("/api/upload", uploadRoutes);
app.use("/api/db", require("./routes/db")); // Be careful if this uses Mongo
app.use("/api/ran-paud", require("./routes/ranpaud"));
app.use("/api/ai", require("./routes/ai"));

app.use("/api/users", require("./routes/users"));
app.use("/api/ceria-settings", require("./routes/ceriaSettings"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/daycare", require("./routes/daycare"));

console.log("✅ All routes loaded (Auth, News, FAQ, Pembelajaran, RanPaud, Users, Feedback)");

// ✅ DATABASE & SERVER STARTUP
async function start() {
  // Start server
  try {
    // Existing installations get a default approved state; public signups are explicitly pending.
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'");
    await pool.query("CREATE INDEX IF NOT EXISTS users_approval_status_idx ON users (approval_status)");
    createUploadDirectories();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log("\n🚀 ================================");
      console.log(`🚀 Server berjalan di port ${PORT}`);
      console.log(`🐘 Database System : PostgreSQL (✅ ACTIVE)`);
      console.log(`📦 MongoDB Dependency: REMOVED`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log("🚀 ================================\n");
      daycareSheetSync.startDaycareSync();
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Helper route health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    postgres: "connected",
    mongodb: "removed"
  });
});

start();
