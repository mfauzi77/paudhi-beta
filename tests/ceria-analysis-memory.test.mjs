import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/modules/ceria/services/analysisMemory.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const url = 'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64');
const { rememberAnalysis } = await import(url);
test('saved results survive module reload; different inputs and failures never reuse them', async () => {
    const storage = {};
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
        getItem: key => storage[key] ?? null,
        setItem: (key, value) => { storage[key] = value; },
        removeItem: key => { delete storage[key]; }
    } });
    const input = { year: 2025, region: 'Aceh', data: 24.02 };
    await rememberAnalysis(input, async () => ({ text: 'Analisis tersimpan' }));
    const reload = await import(url + '#reload');
    const offline = async () => { throw new Error('AI offline'); };
    assert.equal((await reload.rememberAnalysis(input, offline)).text, 'Analisis tersimpan');
    await assert.rejects(rememberAnalysis({ ...input, year: 2024 }, offline), /offline/);
    await assert.rejects(rememberAnalysis({ ...input, data: 30 }, offline), /offline/);
    await assert.rejects(rememberAnalysis({ ...input, region: 'Bali' }, async () => ({ text: '' })), /tidak lengkap/);
    await assert.rejects(rememberAnalysis({ ...input, region: 'Bali' }, offline), /offline/);
    const schema = { required: ['justification'], properties: { justification: { type: 'string' } } };
    await assert.rejects(rememberAnalysis('json', async () => ({ text: '{}' }), undefined, schema), /tidak lengkap/);
    const controller = new AbortController(); controller.abort();
    await assert.rejects(rememberAnalysis(input, offline, controller.signal), { name: 'AbortError' });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
    assert.equal((await rememberAnalysis(input, async () => ({ text: 'Fresh' }))).text, 'Fresh');
});
