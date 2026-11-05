import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
function worker() {
  const listeners = {};
  const deleted = [];
  const context = {
    URL, Response, console,
    self: { addEventListener: (name, handler) => { listeners[name] = handler; }, clients: { claim: async () => {} } },
    caches: {
      keys: async () => ['paud-hi-static-v1.0.2', 'paud-hi-dynamic-v1.0.2', 'paud-hi-static-v1.0.3'],
      delete: async name => { deleted.push(name); return true; },
      match: async () => new Response('cached image'),
    },
  };
  vm.runInNewContext(source, context);
  return { listeners, deleted };
}

for (const [name, url, options] of [
  ['public API', '/api/news', {}],
  ['private API', '/api/auth/profile', { headers: { Authorization: 'Bearer fixture' } }],
  ['authenticated asset', '/uploads/private.png', { headers: { Authorization: 'Bearer fixture' } }],
  ['write request', '/api/news', { method: 'POST' }],
]) {
  test(`${name} bypasses service worker cache`, () => {
    const { listeners } = worker();
    let intercepted = false;
    listeners.fetch({ request: new Request('https://example.test' + url, options), respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false);
  });
}

test('public static assets still use cache', async () => {
  const { listeners } = worker();
  let response;
  listeners.fetch({ request: new Request('https://example.test/logo.png'), respondWith: value => { response = value; } });
  assert.equal(await (await response).text(), 'cached image');
});

test('activation removes caches containing old API responses', async () => {
  const { listeners, deleted } = worker();
  let activation;
  listeners.activate({ waitUntil: value => { activation = value; } });
  await activation;
  assert.deepEqual(deleted, ['paud-hi-static-v1.0.2', 'paud-hi-dynamic-v1.0.2']);
});
