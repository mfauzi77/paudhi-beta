import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';

const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } });
let browser;
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const executablePath = [process.env.PUPPETEER_EXECUTABLE_PATH, puppeteer.executablePath(), 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => p && existsSync(p));
  browser = await puppeteer.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(90000);
  page.setDefaultTimeout(60000);
  const prompts = [];
  const errors = [];
  let alertCalls = 0;
  let educationCalls = 0;
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname === '/api/ai/generate') {
      const body = JSON.parse(request.postData());
      assert.equal(body.cacheOnly, true, 'Sidebar AI requests must only read prepared results');
      const prompt = JSON.stringify(body.contents);
      prompts.push(prompt);
      if (prompt.includes('Domain: Pendidikan.')) {
        educationCalls++;
        if (educationCalls === 1) return request.respond({ status: 500, contentType: 'application/json', body: '{"error":"Internal Server Error"}' });
        return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'Analisis Pendidikan tersimpan' }) });
      }
      if (prompt.includes('Alert Details:')) {
        alertCalls++;
        if (alertCalls === 1) return request.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Layanan AI sementara tidak tersedia' }) });
        return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: '```json\n' + JSON.stringify({ justification: `Analisis alert uji ${alertCalls}`, recommendations: '1. Verifikasi indikator.\n2. Koordinasi layanan.\n3. Evaluasi pelaksanaan.', projectedRiskScore: null }) + '\n```' }) });
      }
      if (prompt.includes('Analisis data peramalan')) {
        const raw = body.contents.parts[0].text;
        const selected = raw.match(/domain "([^"]+)" selama "([^"]+)"/);
        setTimeout(() => request.respond({ status:200, contentType:'application/json', body:JSON.stringify({text:`Forecast uji ${selected[1]} ${selected[2]}`}) }).catch(() => {}), 900);
        return;
      }
      return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: prompt.includes('Tahun data yang dipilih: 2025') ? 'Analisis uji tahun 2025' : 'Analisis uji tahun 2024' }) });
    }
    if (url.pathname.startsWith('/api/')) return request.respond({ status: 200, contentType: 'application/json', body: '{"success":true,"data":[]}' });
    if (url.origin !== origin && ['https:', 'http:'].includes(url.protocol)) return request.abort();
    return request.continue();
  });
  await page.goto(origin + '/ceria', { waitUntil: 'domcontentloaded' });
  const selector = 'select[aria-label="Tahun data analisis"]';
  await page.waitForSelector(selector, { timeout: 30000 });
  assert.equal(await page.$eval(selector, el => el.value), '2025');
  await page.waitForFunction(() => document.body.textContent.includes('Analisis uji tahun 2025'));
  assert.equal(prompts.some(p => p.includes('Tahun data yang dipilih: 2024')), false);
  await page.select(selector, '2024');
  await page.waitForFunction(() => document.body.textContent.includes('Analisis uji tahun 2024'));
  await page.select(selector, '2025');
  await page.waitForFunction(() => document.body.textContent.includes('Analisis uji tahun 2025'));
  assert.ok(await page.evaluate(() => document.body.textContent.includes('89,33')));
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('span')].filter(el => el.textContent.includes('poin persentase vs dataset 2024')).length), 7);
  assert.ok(await page.evaluate(() => document.body.textContent.includes('bukan tren nasional')));
  const prompt2025 = prompts.find(p => p.includes('Tahun data yang dipilih: 2025'));
  assert.ok(prompt2025.includes('Papua Pegunungan'));
  assert.ok(prompt2025.includes('layak_min_s1'));
  assert.ok(prompt2025.includes('missingValues'));
  assert.ok(prompt2025.includes('september'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Pendidikan').click());
  await page.waitForFunction(() => document.body.textContent.includes('Belum ada hasil tersimpan untuk pilihan data ini'));
  await page.click('button[aria-label="Mulai analisis"]');
  await page.waitForFunction(() => document.body.textContent.includes('Analisis Pendidikan tersimpan'));
  const educationPrompt = prompts.find(p => p.includes('Domain: Pendidikan.'));
  assert.ok(educationPrompt.includes('apk_paud'));
  assert.ok(!educationPrompt.includes('ispa_gejala'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Semua Domain').click());
  await page.waitForFunction(() => document.body.textContent.includes('Analisis uji tahun 2025'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Pendidikan').click());
  await page.waitForFunction(() => document.body.textContent.includes('Menyiapkan hasil analisis AI...'));
  await page.waitForFunction(() => document.body.textContent.includes('Analisis Pendidikan tersimpan'));
  assert.equal(educationCalls, 2);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Semua Domain').click());
  await page.waitForFunction(() => document.body.textContent.includes('Analisis uji tahun 2025'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Analisis AI').click());
  await page.waitForFunction(() => document.body.textContent.includes('Layanan AI sementara tidak tersedia'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Coba lagi').click());
  await page.waitForFunction(() => document.body.textContent.includes('Analisis alert uji 2'));
  assert.equal(await page.evaluate(() => document.body.textContent.includes('Estimasi Penurunan Skor Risiko:')), false);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Tutup').click());
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Analisis AI').click());
  await page.waitForFunction(() => document.body.textContent.includes('Analisis alert uji 2'));
  assert.equal(alertCalls, 2);
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Tutup').click());
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Pengasuhan').click());
  await page.waitForFunction(() => document.body.textContent.includes('Data Pengasuhan tahun 2025 belum tersedia'));
  assert.equal(await page.evaluate(() => document.body.textContent.includes('Analisis uji tahun 2025')), false);
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Data per Wilayah').click());
  await page.waitForFunction(() => document.body.textContent.includes('47.3'));
  assert.equal(await page.$eval(selector, el => el.value), '2025');
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Analisis per Bidang').click());
  await page.waitForFunction(() => document.body.textContent.includes('ISPA (Gejala)'));
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Forecasting & Prediction').click());
  await page.waitForSelector('select[aria-label="Select Domain"]');
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length > 0);
  assert.equal(await page.evaluate(() => document.body.textContent.includes('Rentang Keyakinan')), false);
  await page.waitForFunction(() => document.body.textContent.includes('Forecast uji Kesehatan & Gizi 3 Bulan'));
  const firstRows = await page.$eval('tbody', el => el.textContent);
  await page.select('select[aria-label="Select Domain"]', 'Perlindungan');
  await page.waitForFunction(() => document.body.textContent.includes('Forecast uji Perlindungan 3 Bulan'));
  assert.notEqual(await page.$eval('tbody', el => el.textContent), firstRows);
  await page.select('select[aria-label="Select Time Horizon"]', '6 Bulan');
  await page.waitForFunction(() => document.body.textContent.includes('Forecast uji Perlindungan 6 Bulan'));
  await page.select('select[aria-label="Select Domain"]', 'Kesehatan & Gizi');
  await page.select('select[aria-label="Select Domain"]', 'Perlindungan');
  await page.waitForFunction(() => document.body.textContent.includes('Forecast uji Perlindungan 6 Bulan'));
  await page.waitForFunction(() => document.body.textContent.includes('2025 + 6 bln'));
  await page.select('select[aria-label="Select Domain"]', 'Pengasuhan');
  await page.waitForFunction(() => document.body.textContent.includes('Proyeksi tidak dihitung'));
  assert.equal(await page.evaluate(() => document.querySelectorAll('tbody tr').length), 0);
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Resource Allocation').click());
  await page.waitForFunction(() => document.body.textContent.includes('Data pendukung untuk menu ini belum tersedia'));
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Reports & Analytics').click());
  await page.waitForSelector('select#type');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.textContent.includes('Laporan Analisis Mendalam Wilayah: Aceh (2025)'));
  await page.select('select#type', 'domain-comparison');
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => document.body.textContent.includes('Laporan Perbandingan Antar Domain Tahun 2025'));
  await page.evaluate(() => [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Dashboard').click());
  await page.select(selector, '2024');
  await page.waitForFunction(() => document.body.textContent.includes('Analisis uji tahun 2024'));
  assert.equal(await page.evaluate(() => document.body.textContent.includes('Analisis uji tahun 2025')), false);
  assert.deepEqual(errors, []);
  console.log('PASS: year switching, full 2025 payload, missing domain, isolated cached 2024 result, no runtime errors.');
} finally {
  await browser?.close();
  await server.close();
}


