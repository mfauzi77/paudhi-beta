const express = require('express');
const pool = require('../dbPostgres');
const { authenticate, requireRole } = require('../middleware/auth');
const { ensureSchema, syncDaycareSheet } = require('../services/daycareSheetSync');

const router = express.Router();

router.post('/sync', authenticate, requireRole(['admin', 'super_admin', 'admin_utama']), async (req, res) => {
  try {
    const result = await syncDaycareSheet();
    res.json({
      success: true,
      message: 'Data daycare berhasil disinkronkan.',
      data: result,
      sync: { lastSyncedAt: new Date().toISOString() },
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: 'Sinkronisasi gagal. Periksa koneksi backend dan akses spreadsheet.',
    });
  }
});

router.get('/locations', async (req, res) => {
  try {
    await ensureSchema();
    const [locationsResult, summaryResult, stateResult] = await Promise.all([
      pool.query(`
        SELECT source_row, sheet_no, location_name, address, kelurahan, kecamatan,
               kabupaten, provinsi, izin_usaha, izin_operasional, jenis_izin,
               coordinate_raw, latitude, longitude
        FROM daycare_locations
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY source_row ASC
      `),
      pool.query(`
        SELECT COUNT(*)::int AS total_rows,
               COUNT(*) FILTER (WHERE coordinate_status = 'mapped')::int AS mapped_rows,
               COUNT(*) FILTER (WHERE coordinate_status = 'formula')::int AS formula_rows,
               COUNT(*) FILTER (WHERE coordinate_status = 'invalid')::int AS invalid_rows,
               COUNT(*) FILTER (WHERE coordinate_status = 'missing')::int AS missing_rows
        FROM daycare_locations
      `),
      pool.query(`
        SELECT last_synced_at, last_error
        FROM daycare_sheet_sync_state
        WHERE id = 1
      `),
    ]);

    const summary = summaryResult.rows[0];
    const syncState = stateResult.rows[0] || null;
    res.json({
      data: locationsResult.rows,
      summary,
      sync: {
        status: syncState?.last_error ? 'error' : syncState?.last_synced_at ? 'success' : 'pending',
        lastSyncedAt: syncState?.last_synced_at || null,
      },
    });
  } catch (error) {
    console.error('Daycare locations API error:', error.message);
    res.status(503).json({ message: 'Data peta belum tersedia. Silakan coba kembali.' });
  }
});

module.exports = router;
