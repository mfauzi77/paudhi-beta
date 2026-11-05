const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

test('CERIA sidebar requests never call a provider on either cache hit or cache miss', async () => {
    let handler, stored = null, providerCalls = 0;
    const router = { use() {}, post(path, fn) { handler = fn; } };
    const context = {
        module: { exports: {} }, console: { log() {}, warn() {}, error() {} }, process: { env: {} }, setInterval() {},
        require(name) {
            if (name === 'express') return { Router: () => router };
            if (name === '@google/genai') return { GoogleGenAI: class { constructor() { providerCalls++; throw new Error('Provider must not run'); } } };
            if (name === '../dbPostgres') return { query: async () => ({ rows: [] }) };
            if (name === '../middleware/appSource') return () => {};
            if (name === '../services/ceriaAnalysisStore') return { createAnalysisStore: () => ({ get: async () => stored }) };
            if (name === 'crypto') return require('node:crypto');
            throw new Error(`Unexpected dependency ${name}`);
        }
    };
    vm.runInNewContext(readFileSync(require.resolve('../routes/ai'), 'utf8'), context);
    const request = { body: { contents: { parts: [{ text: 'Pendidikan 2025' }] }, cacheOnly: true }, aiConfig: { appSource: 'CERIA', apiKey: 'test', model: 'gemini-2.5-flash' } };
    const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
    const miss = response();
    await handler(request, miss);
    assert.equal(miss.code, 503);
    assert.equal(miss.body.error, 'Analysis not prepared');
    stored = { text: 'Saved analysis', cached: true, cacheSource: 'database' };
    const hit = response();
    await handler(request, hit);
    assert.equal(hit.body.text, 'Saved analysis');
    assert.equal(providerCalls, 0);
});
