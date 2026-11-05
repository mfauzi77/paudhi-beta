const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const fs = require('fs/promises');
process.env.JWT_SECRET = 'upload-regression-only';
const poolPath = require.resolve('../dbPostgres');
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: { query: async (sql, [id]) => ({ rows: [{ id, role: id === 'other' ? 'admin_kl' : id, is_active: id !== 'disabled' }] }) } };
const upload = require('../middleware/upload');
const app = express();
app.use(express.json());
app.use('/upload', require('../routes/upload'));
let server, origin;
const saved = [];
before(async () => { server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); }); origin = 'http://127.0.0.1:' + server.address().port; });
after(async () => { await Promise.all(saved.map(file => fs.unlink(file).catch(() => {}))); await new Promise(resolve => server.close(resolve)); });
const auth = role => role ? { Authorization: 'Bearer ' + jwt.sign({ userId: role }, process.env.JWT_SECRET) } : {};
const json = (route, role, body, method = 'DELETE') => fetch(origin + route, { method, headers: { ...auth(role), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const post = (role, buffer, name = 'image.png', mime = 'image/png') => { const body = new FormData(); body.append('image', new Blob([buffer], { type: mime }), name); return fetch(origin + '/upload/image', { method: 'POST', headers: auth(role), body }); };
for (const [role,status] of [[undefined,401],['viewer',403],['disabled',401]]) test(`file operations reject ${role || 'guest'}`, async () => {
  assert.equal((await post(role, Buffer.from('bad'))).status,status);
  assert.equal((await json('/upload/image',role,{filename:'x.png'})).status,status);
  assert.equal((await fetch(origin + '/upload/list',{headers:auth(role)})).status,status);
});
test('reject traversal in deletion, metadata, and category', async () => {
  for (const filename of ['../outside.png','..\\outside.png','/outside.png','x.png:stream','%2e%2e%2foutside.png']) {
    assert.equal((await json('/upload/image','admin',{filename})).status,400);
    assert.equal((await fetch(origin + '/upload/image/metadata?filename=' + encodeURIComponent(filename),{headers:auth('admin')})).status,400);
  }
  assert.equal((await fetch(origin + '/upload/list?category=../../',{headers:auth('admin')})).status,400);
});
test('reject fake images and SVG despite image MIME', async () => {
  assert.equal((await post('admin',Buffer.from('<html>bad</html>'))).status,400);
  assert.equal((await post('admin',Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'))).status,400);
});
test('valid image re-encoded with safe name, private ownership enforced, owner can delete', async () => {
  const png = await sharp({create:{width:2,height:2,channels:3,background:'#ffffff'}}).png().toBuffer();
  const response = await post('admin_kl',png,'payload.html','image/png');
  assert.equal(response.status,201);
  const {image} = await response.json();
  const file = require('path').join(upload.uploadRoot,image.filename); saved.push(file);
  assert.match(image.filename,/^[a-f0-9]{24}-[a-f0-9-]+\.webp$/);
  assert.equal((await sharp(await fs.readFile(file)).metadata()).format,'webp');
  assert.equal((await json('/upload/image','other',{filename:image.filename})).status,403);
  assert.equal((await json('/upload/image','admin_kl',{imageUrl:image.url})).status,200);
  await assert.rejects(fs.stat(file),{code:'ENOENT'});
});
test('oversized uploads rejected', async () => { assert.equal((await post('admin',Buffer.alloc(5*1024*1024+1))).status,413); });
