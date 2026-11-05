import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/modules/ceria/services/yearData.ts', import.meta.url), 'utf8').replace(/^import .*from '..\/types';/m, "const AlertLevel = { Critical: 'CRITICAL', High: 'HIGH' };");
const { outputText } = ts.transpileModule(source.replace(/^import .*forecast2025.*;$/m, ''), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { build2025, applyIndicatorComparisons } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
const mapping = read('../public/data/2025/mapping.json');
const datasets = [...mapping.entries, ...(mapping.supportingDatasets || [])].filter(e => e.datasetUrl).map(entry => ({ entry, data: read('../public' + entry.datasetUrl) }));

test('card comparison uses identical province cohorts, not the national headline', () => {
  const input = [{ entry: { id: 'imunisasi', proposedDomain: 'Kesehatan & Gizi', fieldPaths: ['total'] }, data: { title: 'IDL per Provinsi', unit: '%', national: { total: 99 }, provinces: [{ province: 'Aceh', total: 20 }, { province: 'Kepulauan Riau', total: 0 }, { province: 'Bali', total: 80 }] } }];
  const result = build2025(input);
  applyIndicatorComparisons(result, input, { idl: { Aceh: '10,0', 'Kep. Riau': 0, Bali: 'NA' } });
  const card = result.keyIndicatorsByDomain.Semua[0];
  assert.equal(card.value, '99%');
  assert.deepEqual(card.comparison, { previous: 5, current: 10, change: 5, provinceCount: 2 });
});

test('actual comparisons exclude gizi and APK/APM with incompatible years or definitions', () => {
  const result = build2025(datasets);
  applyIndicatorComparisons(result, datasets, read('../public/data/ceria_aggregated.json'));
  const cards = result.keyIndicatorsByDomain.Semua;
  assert.equal(cards.filter(c => c.comparison).length, 7);
  assert.equal(cards.find(c => c.label.includes('Akta')).comparison.provinceCount, 38);
  assert.equal(cards.find(c => c.label === 'Stunting').comparison, undefined);
  assert.equal(cards.find(c => c.label.includes('APK PAUD')).comparison, undefined);
});
test('2025 adapter uses supplied values and leaves unsupported histories empty', () => {
  const data = build2025(datasets);
  assert.equal(Object.keys(data.regionsDetails).length, 38);
  assert.equal(data.getRegionDetails('aceh').population, 434794);
  assert.equal(data.getRegionDetails('aceh').populationAgeGroup, '3–6 tahun');
  assert.equal(data.getRegionDetails('aceh').populationDetails.countAge5To6, 221206);
  const papua = data.getRegionDetails('papua-tengah');
  assert.equal(papua.domains['Kesehatan & Gizi'].metrics.find(m => m.label.includes('K4')).value, 'Belum tersedia');
  assert.equal(papua.domains.Pengasuhan.metrics.length, 0);
  assert.equal(data.keyIndicatorsByDomain.Perlindungan.find(m => m.label.includes('Akta')).value, '89,33%');
  assert.equal(data.keyIndicatorsByDomain.Pendidikan.find(m => m.label.includes('APK PAUD')).value, '46,65%');
  assert.equal(data.keyIndicatorsByDomain.Pendidikan.find(m => m.label.includes('APM PAUD')).value, '62,47%');
  assert.ok(data.keyIndicatorsByDomain.Pendidikan.find(m => m.label.includes('APK PAUD')).label.includes('2025/2026'));
  assert.ok(!data.keyIndicatorsByDomain.Pendidikan.some(m => m.label.includes('APK SD')));
  assert.equal(papua.domains.Pendidikan.metrics.find(m => m.label.includes('APM PAUD')).riskEligible, false);
  assert.deepEqual(data.nationalHistoricalRisk, []);
  assert.deepEqual(data.regionalForecastData, []);
  assert.ok(data.keyIndicatorsByDomain.Semua.every(m => m.trendUnavailable));
  assert.ok(Object.values(data.regionsDetails).every(r => r.year === 2025 && Number.isFinite(r.overallRisk)));
  assert.deepEqual(build2025(datasets).regionalRiskScores, data.regionalRiskScores);
});

