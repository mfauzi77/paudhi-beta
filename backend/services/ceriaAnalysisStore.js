// Database-backed storage survives Node restarts and deployments using the same DB.
function createAnalysisStore(pool) {
    let ready;
    const ensure = () => ready || (ready = pool.query(`CREATE TABLE IF NOT EXISTS ceria_analysis_cache (
        cache_key TEXT PRIMARY KEY,
        response JSONB NOT NULL,
        saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`).catch(error => { ready = undefined; throw error; }));
    return {
        async get(key) {
            await ensure();
            const result = await pool.query('SELECT response, saved_at FROM ceria_analysis_cache WHERE cache_key = $1', [key]);
            const row = result.rows[0];
            return row ? { ...row.response, cached: true, cacheSource: 'database', savedAt: row.saved_at } : null;
        },
        async set(key, response) {
            await ensure();
            await pool.query(`INSERT INTO ceria_analysis_cache (cache_key, response) VALUES ($1, $2::jsonb)
                ON CONFLICT (cache_key) DO UPDATE SET response = EXCLUDED.response, saved_at = NOW()`, [key, JSON.stringify(response)]);
        }
    };
}
module.exports = { createAnalysisStore };
