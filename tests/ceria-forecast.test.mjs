import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/modules/ceria/services/forecast2025.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { buildForecastPairs, projectForecast, forecastChart } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
test('linear projection scales annual difference, clamps and uses realized change', () => {
  const pairs = [{ region:'Uji', domain:'Kesehatan & Gizi', indicators:['Uji'], previousRisk:20, currentRisk:32 }];
  assert.equal(projectForecast(pairs,'Kesehatan & Gizi',3)[0].predictedRisk,35);
  assert.equal(projectForecast(pairs,'Kesehatan & Gizi',6)[0].predictedRisk,38);
  assert.equal(projectForecast([{...pairs[0],previousRisk:0,currentRisk:99}],'Kesehatan & Gizi',6)[0].change,1);
  assert.equal(projectForecast([{...pairs[0],previousRisk:99,currentRisk:1}],'Kesehatan & Gizi',6)[0].predictedRisk,0);
  assert.deepEqual(forecastChart(pairs,'Pengasuhan',3),[]);
  assert.deepEqual(forecastChart(pairs,'Kesehatan & Gizi',6).map(p=>p.timeOffset),[0,12,18]);
});
test('only paired values enter both years; aliases and explicit zero are preserved', () => {
  const baseline={idl:{'Kep. Riau':'20,5',Aceh:'NA',Bali:0}};
  const datasets=[{entry:{id:'imunisasi'},data:{provinces:[{province:'Kepulauan Riau',total:30.5},{province:'Aceh',total:50},{province:'Bali',total:0}]}}];
  const pairs=buildForecastPairs(baseline,datasets);
  assert.equal(pairs.length,2);
  assert.equal(pairs[0].previousRisk,79.5);
  assert.equal(pairs[0].currentRisk,69.5);
  assert.equal(pairs[1].currentRisk,100);
});
test('actual files produce deterministic matched pairs without synthetic months', () => {
  const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8').replace(/^\uFEFF/,''));
  const datasets=read('../public/data/2025/mapping.json').entries.filter(e=>e.datasetUrl).map(entry=>({entry,data:read('../public'+entry.datasetUrl)}));
  const pairs=buildForecastPairs(read('../public/data/ceria_aggregated.json'),datasets);
  assert.ok(pairs.length>0);
  assert.ok(pairs.every(p=>['Kesehatan & Gizi','Perlindungan'].includes(p.domain)));
  assert.ok(!pairs.find(p=>p.region==='Papua Tengah' && p.domain==='Kesehatan & Gizi').indicators.includes('Kunjungan K4'));
  assert.deepEqual(projectForecast(pairs,'Perlindungan',3),projectForecast(pairs,'Perlindungan',3));
});
