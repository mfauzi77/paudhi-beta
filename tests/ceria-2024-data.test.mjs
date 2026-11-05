import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compile = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString('base64');
const common = readFileSync('src/modules/ceria/services/yearData.ts', 'utf8').replace(/^import .*from '..\/types';/m, "const AlertLevel = { Critical: 'CRITICAL', High: 'HIGH' };").replace(/^import .*forecast2025.*;$/m, '');
const adapter = readFileSync('src/modules/ceria/services/year2024.ts', 'utf8').replace("'./yearData'", JSON.stringify(compile(common)));
const { build2024 } = await import(compile(adapter));
const raw = JSON.parse(readFileSync('public/data/ceria_aggregated.json', 'utf8'));
test('2024 input is deterministic, preserves missing values, and contains no simulated history', () => {
 const random = Math.random; Math.random = () => { throw new Error('Random data prohibited'); };
 try {
  const data = build2024(raw);
  assert.equal(JSON.stringify(data), JSON.stringify(build2024(raw)));
  assert.equal(data.year, 2024);
  assert.equal(Object.keys(data.regionsDetails).length, 38);
  assert.equal(data.keyIndicatorsByDomain.Pengasuhan.length, 0);
  assert.deepEqual(data.forecastPairs, []);
  for (const region of Object.values(data.regionsDetails)) {
   assert.equal(region.year, 2024);
   assert.deepEqual(region.historicalRisk, []);
   assert.deepEqual(region.domains.Pengasuhan.metrics, []);
   assert.ok(region.domains['Kesehatan & Gizi'].metrics.every(m => Number.isNaN(m.nationalAverage)));
  }
  const papua = Object.values(data.regionsDetails).find(r => r.name === 'Papua Pegunungan');
  assert.equal(papua.domains['Kesehatan & Gizi'].metrics.find(m => m.label === 'Imunisasi Dasar Lengkap').value, 'Belum tersedia');
  const aceh = Object.values(data.regionsDetails).find(r => r.name === 'Aceh');
  assert.equal(aceh.domains.Perlindungan.metrics.find(m => m.label === 'Kepemilikan Akta Kelahiran').value, Number(raw.akta.Aceh.replace(',', '.')));
 } finally { Math.random = random; }
});
