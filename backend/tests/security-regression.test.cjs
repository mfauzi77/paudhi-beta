const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

// These HTTP tests use an isolated database double, never the configured database.
process.env.JWT_SECRET = 'local-regression-tests-only';
let queries = [];
let queryResult = () => ({ rows: [] });
const users = {
  admin: { id: 'admin', role: 'admin', is_active: true },
  super_admin: { id: 'super_admin', role: 'super_admin', is_active: true },
  user: { id: 'user', role: 'user', is_active: true },
  admin_kl: { id: 'admin_kl', role: 'admin_kl', is_active: true },
  admin_daerah: { id: 'admin_daerah', role: 'admin_daerah', is_active: true },
  disabled: { id: 'disabled', role: 'admin', is_active: false },
};
const poolPath = require.resolve('../dbPostgres');
require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: {
  query: async (sql, params = []) => {
    if (sql.includes('FROM users WHERE id = $1')) return { rows: users[params[0]] ? [users[params[0]]] : [] };
    queries.push({ sql, params });
    return queryResult(sql, params);
  },
} };

const app = express();
app.use(express.json());
app.use('/news', require('../routes/news.pg'));
app.use('/ran-paud', require('../routes/ranpaud'));
app.use('/auth', require('../routes/auth'));
let server;
let origin;
before(async () => {
  server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

const request = (path, role, method = 'GET', body) => fetch(origin + path, {
  method,
  headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: 'Bearer ' + jwt.sign({ userId: role }, process.env.JWT_SECRET) } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

for (const action of ['publish', 'return-draft']) {
  for (const role of [undefined, 'user', 'admin_kl', 'admin_daerah', 'disabled', 'admin', 'super_admin']) {
    test(`${action}: ${role || 'guest'} authorization`, async () => {
      queries = [];
      queryResult = () => ({ rows: [{ id: 'article', status: action === 'publish' ? 'publish' : 'draft' }] });
      const res = await request(`/news/article/${action}`, role, 'POST');
      const allowed = ['admin', 'super_admin'].includes(role);
      assert.equal(res.status, allowed ? 200 : (!role || role === 'disabled' ? 401 : 403));
      assert.equal(queries.length, allowed ? 1 : 0, 'Denied requests must not modify news');
    });
  }
}

test('inactive token cannot read drafts through optional authentication', async () => {
  queries = [];
  const response = await request('/news?status=draft', 'disabled');
  assert.equal(response.status, 401);
  assert.equal(queries.length, 0);
});

for (const [method, path] of [['GET', '/profile'], ['PUT', '/profile'], ['POST', '/change-password']]) {
  test(`inactive token blocked on ${method} ${path}`, async () => {
    queries = [];
    assert.equal((await request('/auth' + path, 'disabled', method)).status, 401);
    assert.equal(queries.length, 0);
  });
}

test('multiword news search binds distinct parameters, including ownership filter', async () => {
  queryResult = () => ({ rows: [] });
  queries = [];
  assert.equal((await request('/news?status=draft&search=anak%20sehat', 'admin_kl')).status, 200);
  assert.deepEqual(queries[0].params, ['admin_kl', '%anak%', '%sehat%']);
  assert.match(queries[0].sql, /n\.title ILIKE \$2/);
  assert.match(queries[0].sql, /n\.title ILIKE \$3/);
});

test('public RAN detail filters unpublished records and returns 404', async () => {
  queryResult = (sql, params) => {
    assert.match(sql, /status IN \('publish', 'approved'\)/);
    assert.deepEqual(params, ['private-draft']);
    return { rows: [] };
  };
  assert.equal((await request('/ran-paud/private-draft/public')).status, 404);
});

test('published RAN detail remains accessible', async () => {
  queryResult = () => ({ rows: [{ id: 'published', status: 'publish', is_active: true, program: 'Program publik' }] });
  const response = await request('/ran-paud/published/public');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.program, 'Program publik');
});

test('KL mapping is handled by its own route, not the detail route', async () => {
  queryResult = (sql) => {
    assert.match(sql, /SELECT DISTINCT kl_id/);
    return { rows: [{ id: 'kl', name: 'Kementerian' }] };
  };
  const response = await request('/ran-paud/kl-mapping/public');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray((await response.json()).data));
});

test('public year list filters unpublished records', async () => {
  queryResult = sql => {
    assert.match(sql, /status IN \('publish', 'approved'\)/);
    return { rows: [{ year: 2025 }] };
  };
  assert.equal((await request('/ran-paud/years/public')).status, 200);
});

test('public aggregate excludes drafts and all-years counts valid year entries', async () => {
  queryResult = sql => {
    assert.match(sql, /status IN \('publish', 'approved'\)/);
    return { rows: [{ kl_name: 'Kementerian', jumlah_ro: 1, indikators: [{ tahunData: [
      { tahun: 2024, kategori: 'TERCAPAI' }, { tahun: 2025, kategori: 'TIDAK TERCAPAI' },
    ] }] }] };
  };
  const response = await request('/ran-paud/kl-statistics/all/public');
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data[0].tercapai, 1);
  assert.equal(data[0].tidakTercapai, 1);
  assert.equal((await request('/ran-paud/dashboard?year=2025')).status, 200);
});

// Authorization must run before the multipart parser writes a replacement image.
test('non-owner cannot upload a replacement image to another author news', async () => {
  queryResult = () => ({ rows: [{ author_id: 'someone-else' }] });
  const body = new FormData();
  body.append('image', new Blob(['not-an-image'], { type: 'image/png' }), 'fake.png');
  const response = await fetch(origin + '/news/existing-news', {
    method: 'PUT', body, headers: { Authorization: 'Bearer ' + jwt.sign({ userId: 'admin_kl' }, process.env.JWT_SECRET) },
  });
  assert.equal(response.status, 403);
});
