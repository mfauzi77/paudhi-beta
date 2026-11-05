const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAnalysisStore } = require('../services/ceriaAnalysisStore');
test('new store instance retrieves persisted results without mixing request keys', async () => {
    const rows = new Map();
    const pool = { async query(sql, params) {
        if (sql.startsWith('INSERT')) rows.set(params[0], { response: JSON.parse(params[1]), saved_at: '2026-09-22' });
        return { rows: sql.startsWith('SELECT') && rows.has(params[0]) ? [rows.get(params[0])] : [] };
    } };
    await createAnalysisStore(pool).set('2025-Aceh', { text: 'Saved', candidates: [{ sources: [] }] });
    const restarted = createAnalysisStore(pool);
    assert.equal((await restarted.get('2025-Aceh')).text, 'Saved');
    assert.equal((await restarted.get('2025-Aceh')).cacheSource, 'database');
    assert.equal(await restarted.get('2024-Aceh'), null);
});
