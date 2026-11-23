const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function worker() {
  const scope = 'https://example.test/Grow-Vault/';
  const prefix = 'grow-vault:' + encodeURIComponent(scope) + ':';
  const otherPrefix = 'grow-vault:' + encodeURIComponent('https://example.test/staging/Grow-Vault/') + ':';
  const handlers = {}, deleted = [], cached = [];
  const cache = { addAll: async urls => cached.push(...urls), match: async () => undefined, put: async () => {} };
  const context = { URL, Set, Promise, Response, self: { registration: { scope: 'https://example.test/Grow-Vault/' }, addEventListener: (event, fn) => { handlers[event] = fn; }, skipWaiting: async () => {}, clients: { claim: async () => {} } }, caches: { open: async () => cache, keys: async () => ['other-app-v1', 'grow-vault-v5', prefix + 'v5', prefix + 'v6', otherPrefix + 'v5'], delete: async key => { deleted.push(key); } }, fetch: async () => { throw new Error('offline'); } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../sw.js'), 'utf8'), context);
  return { handlers, deleted, cached, prefix, otherPrefix };
}
test('offline install includes the exact versioned scripts requested by HTML', async () => {
  const { handlers, cached } = worker(); await new Promise((resolve, reject) => handlers.install({ waitUntil: p => p.then(resolve, reject) }));
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  for (const [, path] of html.matchAll(/<script src="([^"]+)"/g)) assert.ok(cached.includes(new URL(path, 'https://example.test/Grow-Vault/').href));
});
test('cache cleanup leaves unrelated apps alone', async () => {
  const { handlers, deleted, prefix } = worker(); await new Promise((resolve, reject) => handlers.activate({ waitUntil: p => p.then(resolve, reject) }));
  assert.deepEqual(deleted, [prefix + 'v5']);
});
test('offline worker does not replace APIs, neighboring apps, or external responses with HTML', () => {
  const { handlers } = worker();
  for (const url of ['https://other.test/data', 'https://example.test/api', 'https://example.test/Grow-Vault/?private=1', 'https://example.test/Other/index.html']) {
    handlers.fetch({ request: { method: 'GET', url }, respondWith: () => assert.fail('unrelated request intercepted') });
  }
});

test('two Grow Vault deployments on one origin retain separate caches', async () => {
  const { handlers, deleted, otherPrefix } = worker();
  await new Promise((resolve, reject) => handlers.activate({ waitUntil: p => p.then(resolve, reject) }));
  assert.ok(!deleted.some(key => key.startsWith(otherPrefix)));
  assert.ok(!deleted.includes('grow-vault-v5'), 'unscoped legacy caches have ambiguous ownership');
});
