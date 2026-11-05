const express = require("express");
const pool = require("../dbPostgres");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// POST /api/db/test-connection
// Body: none
// Only super_admin may run this
router.post(
  "/test-connection",
  authenticate,
  authorize(["super_admin"]),
  async (req, res) => {
    const startedAt = Date.now();
    try {
      const result = await pool.query('SELECT NOW() as now, version()');
      const elapsedMs = Date.now() - startedAt;

      return res.status(200).json({
        success: true,
        message: "Koneksi PostgreSQL berhasil",
        elapsedMs,
        serverTime: result.rows[0].now,
        version: result.rows[0].version
      });
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      return res.status(500).json({
        success: false,
        message: "Gagal konek ke PostgreSQL",
        elapsedMs,
        error: error.message
      });
    }
  }
);

module.exports = router;
