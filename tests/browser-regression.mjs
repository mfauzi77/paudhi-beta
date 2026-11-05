import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';

const server = await createServer({
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/api') },
  server: { host: '127.0.0.1', port: 0, open: false },
});
let browser;
try {
  await server.listen();
  console.log('Local test server ready.');
  const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
  const executablePath = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    puppeteer.executablePath(),
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(candidate => candidate && existsSync(candidate));
  browser = await puppeteer.launch({ headless: true, executablePath });
  console.log('Isolated browser ready.');
  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) {
      let data = { success: true, data: [] };
      if (url.pathname === '/api/health') data = { status: 'OK' };
      if (url.pathname === '/api/news/security-fixture') data = { success: true, data: {
        id: 'security-fixture', title: 'Berita uji keamanan', category: 'PAUD', newsDate: '2025-01-01',
        content: '<p>Konten <strong>aman</strong></p><img src="/missing-image" onerror="window.__xss = true"><a href="javascript:window.__xss=true">Tautan</a><script>window.__xss=true</script>',
      } };
      return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(data), headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    // Keep regression tests independent of production services and external media.
    if (url.origin !== origin && ['http:', 'https:'].includes(url.protocol)) return request.abort();
    return request.continue();
  });

  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(origin, { waitUntil: 'networkidle0' });
  console.log('Home page loaded.');
  await page.waitForSelector('section h1');
  assert.match(await page.$eval('#hero-title', el => el.textContent), /Pantau layanan PAUD/);
  await new Promise(resolve => setTimeout(resolve, 9500));
  assert.ok(await page.$('#hero-title'), 'Value proposition remains visible after nine seconds');
  assert.ok(await page.$('a[href="#layanan"]'), 'Service CTA has a stable destination');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/home-desktop.png' });
  await page.setViewport({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal overflow on mobile');
  assert.equal(await page.$eval('input[aria-label="Cari berita, program, atau materi"]', el => el.getBoundingClientRect().width > 0), true);
  await page.screenshot({ path: 'test-results/home-mobile.png' });
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No overflow at ' + width);
  }

  await page.goto(origin + '/education', { waitUntil: 'networkidle0' });
  console.log('Education page loaded.');
  assert.ok(await page.$('main section'), 'Education route renders learning content');
  await page.goto(origin + '/missing-page-regression', { waitUntil: 'networkidle0' });
  assert.equal(await page.$eval('main h1', el => el.textContent), 'Halaman tidak ditemukan');
  await page.goto(origin + '/admin', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => location.pathname === '/login');

  await page.goto(origin + '/news/security-fixture', { waitUntil: 'networkidle0' });
  await page.waitForSelector('article h1');
  assert.equal(await page.title(), 'Berita uji keamanan | PAUD HI Kemenko PMK');
  assert.equal(await page.$eval('article strong', el => el.textContent), 'aman');
  assert.equal(await page.$('article [onerror], article script, article a[href^="javascript:"]'), null);
  assert.equal(await page.evaluate(() => Boolean(window.__xss)), false);
  const sanitation = await page.evaluate(async () => {
    const { sanitizeHtml } = await import('/src/utils/sanitizeHtml.ts');
    return sanitizeHtml('<svg onload="alert(1)"></svg><iframe srcdoc="bad"></iframe><p onclick="bad()" style="position:fixed">Teks <em>penting</em></p>');
  });
  assert.equal(sanitation, '<p>Teks <em>penting</em></p>');

  await page.goto(origin + '/faq', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#faq-umum');
  assert.ok(await page.$('#faq-umum'), 'FAQ content remains available');
  assert.deepEqual(errors, [], 'Pages must not produce uncaught JavaScript errors');
  console.log('Browser regression passed: desktop/mobile, hero, education, 404, login guard, HTML sanitation, FAQ.');
} finally {
  await browser?.close();
  await server.close();
}
