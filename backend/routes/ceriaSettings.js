const express = require('express');
const router = express.Router();
const pool = require('../dbPostgres');
const { authenticate, authorize } = require('../middleware/auth');
const axios = require('axios');
const https = require('https');

// Create an instance of https agent to ignore SSL certificate errors
// BPS API often has certificate chain issues
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

// GET /api/ceria-settings/settings - Get all BPS API Integrations
router.get('/settings', authenticate, authorize(['admin_utama', 'admin', 'super_admin', 'admin_kl', 'admin_daerah']), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ceria_bps_settings ORDER BY category ASC, id ASC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching BPS settings:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/ceria-settings/settings - Update a specific integration
router.post('/settings', authenticate, authorize(['admin_utama', 'admin', 'super_admin', 'admin_kl', 'admin_daerah']), async (req, res) => {
    try {
        let { id, api_key, base_url, variable_id, name } = req.body;
        console.log(`[CERIA Settings] Update Request for ID ${id}:`, { base_url: base_url?.substring(0, 50) + '...', api_key: api_key ? 'PRESENT' : 'MISSING' });
        
        // Auto-extract from base_url if it's a BPS link AND variable_id is not manually provided
        if (!variable_id && base_url && base_url.toLowerCase().includes('bps.go.id')) {
            console.log(`[CERIA Settings] BPS link detected, attempting auto-extraction...`);
            
            // 1. Extract variable_id from /var/XXX/ or /id/XXX/ (SIMDASI)
            if (base_url.includes('/var/')) {
                variable_id = base_url.split('/var/')[1].split('/')[0];
            } else if (base_url.includes('/id/')) {
                // For SIMDASI links, /id/ is the variable ID
                variable_id = base_url.split('/id/')[1].split('/')[0];
            }
            
            if (variable_id) console.log(`[CERIA Settings] Extracted variable_id: ${variable_id}`);

            // 2. Extract api_key from /key/XXX
            if (base_url.includes('/key/')) {
                const keyPart = base_url.split('/key/')[1].split('/')[0].trim();
                if (keyPart && !api_key) {
                    api_key = keyPart;
                    console.log(`[CERIA Settings] Extracted api_key: ${api_key.substring(0, 5)}...`);
                }
            }
        }

        // Fallback sanitization for api_key if it's still a raw link
        if (api_key && api_key.includes('/key/')) {
            const parts = api_key.split('/key/');
            api_key = parts[parts.length - 1].split('/')[0].trim();
        }

        // Final check: COALESCE ensures we don't wipe out existing IDs if one isn't provided/extracted
        const result = await pool.query(
            'UPDATE ceria_bps_settings SET api_key = COALESCE($1, api_key), base_url = $2, variable_id = COALESCE($3, variable_id), name = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [api_key?.trim() || null, base_url?.trim() || null, variable_id?.trim() || null, name, id]
        );
        
        console.log(`[CERIA Settings] Updated ID ${id} result:`, { 
            api_key: result.rows[0].api_key ? 'SET' : 'MISSING', 
            var_id: result.rows[0].variable_id ? 'SET' : 'MISSING' 
        });

        res.json({ success: true, message: 'Settings updated successfully', data: result.rows[0] });
    } catch (err) {
        console.error('Error updating BPS settings:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/ceria-settings/sync-bps - Fetch data from BPS for a specific integration
router.post('/sync-bps', authenticate, authorize(['admin_utama', 'admin', 'super_admin', 'admin_kl', 'admin_daerah']), async (req, res) => {
    try {
        const { id, year_id } = req.body; // year_id: 125 (2025 in BPS platform)
        console.log(`[CERIA Sync] Start sync for ID: ${id}, Year: ${year_id}`);
        
        // 1. Get Integration Info
        const settingsRes = await pool.query('SELECT * FROM ceria_bps_settings WHERE id = $1', [id]);
        const setting = settingsRes.rows[0];
        
        if (!setting) {
            console.error(`[CERIA Sync] Failed: Integration ID ${id} not found in database.`);
            return res.status(404).json({ success: false, message: 'Integration not found' });
        }
        
        let apiKey = setting.api_key?.trim();
        let var_id = setting.variable_id?.trim();

        if (!apiKey) {
            return res.status(400).json({ success: false, message: 'Token API belum tersimpan. Silakan isi API Key lalu klik SAVE.' });
        }
        if (!var_id) {
            return res.status(400).json({ success: false, message: 'ID Variabel belum terdeteksi. Silakan input ID secara manual atau perbaiki Link BPS, lalu klik SAVE.' });
        }

        // 2. Fetch from BPS
        // URL building logic
        let url = setting.base_url || `https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/${var_id}/th/${year_id}/key/${apiKey}`;
        
        if (setting.base_url) {
            // Ensure year is correct
            if (url.includes('/th/')) {
                url = url.replace(/\/th\/[^\/]+/, `/th/${year_id}`);
            } else if (url.includes('/tahun/')) {
                const realYear = parseInt(year_id) > 1000 ? year_id : (1900 + parseInt(year_id));
                url = url.replace(/\/tahun\/[^\/]+/, `/tahun/${realYear}`);
            }

            // Ensure API key is correct
            if (url.includes('/key/')) {
                const parts = url.split('/key/');
                url = parts[0] + '/key/' + apiKey;
            } else {
                url = `${url.replace(/\/$/, '')}/key/${apiKey}`;
            }
        }

        console.log(`[CERIA Sync] Final Fetching URL: ${url.replace(apiKey, 'HIDDEN')}`);
        
        let bpsData;
        try {
            const bpsRes = await axios.get(url, { httpsAgent, timeout: 15000 });
            bpsData = bpsRes.data;
        } catch (fetchErr) {
            console.error('[CERIA Sync] Axios Fetch Error:', fetchErr.message);
            return res.status(500).json({ success: false, message: `Gagal menghubungi API BPS: ${fetchErr.message}` });
        }

        if (!bpsData) {
            return res.status(500).json({ success: false, message: 'API BPS mengembalikan respon kosong.' });
        }

        // BPS platform usually has status 'OK'. SIMDASI might not have this field.
        if (bpsData.status && bpsData.status !== 'OK') {
            console.error('[CERIA Sync] BPS API Error Status:', bpsData);
            await pool.query('UPDATE ceria_bps_settings SET last_status = $1 WHERE id = $2', [`Error: ${bpsData.message || 'Unknown Status Error'}`, id]);
            return res.status(500).json({ success: false, message: `BPS API Error: ${bpsData.message || 'Unknown Error'}` });
        }

        // Debug log (use console for safety, or a specific ignored path)
        console.log(`[CERIA Sync] Response Keys: ${Object.keys(bpsData).join(', ')}`);
        
        // 3. Extract Metadata and Data (Handle BPS vs SIMDASI)
        let regions = [];
        let years = [];
        let dataContent = {};
        let variable = { val: var_id, label: setting.name, unit: '', def: '' };

        // DETECT SIMDASI (format where data is an array with metadata at [0] and content at [1])
        const isSimdasi = Array.isArray(bpsData.data) && bpsData.data.length > 1 && bpsData.data[1].data;

        if (isSimdasi) {
            console.log('[CERIA Sync] SIMDASI format detected');
            const simdasiMeta = bpsData.data[1];
            years = [{ val: year_id, label: simdasiMeta.tahun_data || year_id }];
            regions = simdasiMeta.data.map(item => ({ val: item.kode_wilayah, label: item.label }));
            
            // For SIMDASI, we transform the array into a flat object structure for the loop below
            // OR we can just handle the insertion differently for SIMDASI. 
            // Let's use a flag to handle insertion separately if needed.
        } else {
            console.log('[CERIA Sync] Standard BPS format detected');
            variable = bpsData.var ? bpsData.var[0] : variable;
            regions = bpsData.vervar || [];
            years = bpsData.tahun || [];
            dataContent = bpsData.datacontent || bpsData.data || {};
        }

        // 4. Determine which year to sync
        let syncYearId = year_id;
        let syncYearLabel = years.find(y => y.val == year_id)?.label || (parseInt(year_id) > 1000 ? year_id : (1900 + parseInt(year_id)));

        if (!isSimdasi) {
            const hasDataForRequestedYear = Object.keys(dataContent).some(k => k.includes(String(year_id)) || k.includes(String(syncYearLabel)));
            if (!hasDataForRequestedYear && years.length > 0) {
                syncYearId = years[0].val;
                syncYearLabel = years[0].label;
                console.log(`[CERIA Sync] Fallback to latest standard year: ${syncYearLabel}`);
            }
        }

        // 5. Update/Insert Indicator
        const indicatorRes = await pool.query(
            `INSERT INTO ceria_bps_indicators (bps_var_id, label, unit, description, last_sync)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (bps_var_id) DO UPDATE 
             SET label = EXCLUDED.label, unit = EXCLUDED.unit, description = EXCLUDED.description, last_sync = NOW()
             RETURNING id`,
            [variable.val, variable.label, variable.unit, variable.def]
        );
        const indicatorId = indicatorRes.rows[0].id;

        // 6. Batch Insert Data
        const client = await pool.connect();
        let savedCount = 0;

        try {
            await client.query('BEGIN');
            
            if (isSimdasi) {
                const simdasiItems = bpsData.data[1].data;
                for (const item of simdasiItems) {
                    // Extract value from variables (usually only one variable in this context)
                    let valueRaw = undefined;
                    const varKeys = Object.keys(item.variables || {});
                    if (varKeys.length > 0) {
                        valueRaw = item.variables[varKeys[0]].value;
                    }

                    if (valueRaw !== undefined && valueRaw !== null) {
                        // Parse "82,48" -> 82.48
                        const valueParsed = parseFloat(String(valueRaw).replace(',', '.'));
                        if (!isNaN(valueParsed)) {
                            await client.query(
                                `INSERT INTO ceria_bps_data (indicator_id, region_id, region_name, value, period, period_year)
                                 VALUES ($1, $2, $3, $4, $5, $6)
                                 ON CONFLICT (indicator_id, region_id, period) DO UPDATE 
                                 SET value = EXCLUDED.value, region_name = EXCLUDED.region_name`,
                                [indicatorId, String(item.kode_wilayah), item.label, valueParsed, String(syncYearId), String(syncYearLabel)]
                            );
                            savedCount++;
                        }
                    }
                }
            } else {
                const varIdStr = String(variable.val);
                for (const region of regions) {
                    const possibleKeys = [
                        `${region.val}00${varIdStr}0${syncYearId}0`,
                        `${region.val}${varIdStr}0${syncYearId}0`,
                        `${region.val}0${varIdStr}0${syncYearId}0`
                    ];

                    let value = undefined;
                    for (const k of possibleKeys) {
                        if (dataContent[k] !== undefined) {
                            value = parseFloat(String(dataContent[k]).replace(',', '.'));
                            break;
                        }
                    }

                    if (value !== undefined && !isNaN(value)) {
                        await client.query(
                            `INSERT INTO ceria_bps_data (indicator_id, region_id, region_name, value, period, period_year)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             ON CONFLICT (indicator_id, region_id, period) DO UPDATE 
                             SET value = EXCLUDED.value, region_name = EXCLUDED.region_name`,
                            [indicatorId, String(region.val), region.label, value, String(syncYearId), String(syncYearLabel)]
                        );
                        savedCount++;
                    }
                }
            }
            
            await pool.query('UPDATE ceria_bps_settings SET last_status = $1, updated_at = NOW() WHERE id = $2', ['Success', id]);
            await client.query('COMMIT');
            console.log(`[CERIA Sync] Successfully saved ${savedCount} records for ID ${id}`);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        res.json({ success: true, message: `Berhasil sinkronisasi ${variable.label || setting.name} (${savedCount} data)` });

    } catch (err) {
        console.error('Error syncing BPS data:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/ceria-settings/bps-data - Fetch stored BPS data
router.get('/bps-data', authenticate, async (req, res) => {
    try {
        const { var_id, period } = req.query;
        let query = `
            SELECT d.*, i.label, i.unit 
            FROM ceria_bps_data d
            JOIN ceria_bps_indicators i ON d.indicator_id = i.id
            WHERE 1=1
        `;
        const params = [];
        let pIdx = 1;

        if (!var_id) {
            return res.json({ success: true, data: [], message: 'Variable ID required' });
        }

        query += ` AND i.bps_var_id = $${pIdx++}`;
        params.push(var_id);

        if (period) {
            query += ` AND d.period = $${pIdx++}`;
            params.push(period);
        }

        query += ` ORDER BY d.region_name ASC`;

        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching BPS data:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/ceria-settings/reset/:id - Clear configuration and associated data
router.delete('/reset/:id', authenticate, authorize(['admin_utama', 'admin', 'super_admin', 'admin_kl', 'admin_daerah']), async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // 1. Get variable_id before clearing
        const settingsRes = await client.query('SELECT variable_id FROM ceria_bps_settings WHERE id = $1', [id]);
        const var_id = settingsRes.rows[0]?.variable_id;

        if (var_id) {
            // Find indicator id
            const indicatorRes = await client.query('SELECT id FROM ceria_bps_indicators WHERE bps_var_id = $1', [var_id]);
            const indicatorId = indicatorRes.rows[0]?.id;

            if (indicatorId) {
                // Delete data records
                console.log(`[CERIA Reset] Deleting data for indicator ${indicatorId} (Var: ${var_id})`);
                await client.query('DELETE FROM ceria_bps_data WHERE indicator_id = $1', [indicatorId]);
            }
        }

        // 2. Reset the settings row
        await client.query(
            'UPDATE ceria_bps_settings SET api_key = NULL, base_url = NULL, variable_id = NULL, last_status = NULL, updated_at = NOW() WHERE id = $1',
            [id]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: 'Konfigurasi dan data berhasil direset.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error resetting BPS settings:', err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
