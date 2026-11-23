const { test } = require('node:test');
const assert = require('node:assert/strict');
const e = require('../engine.js');
function deposit(state, gross, percent = 10) { return e.apply(state, { type: 'Deposit', gross, percent, time: 1 }); }
test('deposit and purchase reconcile in integer cents', () => {
  let state = deposit(e.emptyState(), 100, 10);
  state = e.apply(state, { type: 'Purchase', gross: 40, percent: 10, time: 2 });
  assert.equal(state.spendable, 46); assert.equal(state.vaulted, 14);
  assert.deepEqual(e.validate(state), state);
});
test('purchase cannot consume protected funds and error uses actual total', () => {
  const state = deposit(e.emptyState(), 100, 50);
  assert.throws(() => e.apply(state, { type: 'Purchase', gross: 60, percent: 10 }), /66.00.*6.00/);
  assert.equal(state.spendable, 50); assert.equal(state.tx.length, 1);
});
test('repeated small deposits do not accumulate floating point drift', () => {
  let state = e.emptyState();
  for (let i = 0; i < 1000; i++) state = deposit(state, '.05', 10);
  assert.equal(state.vaulted, 10); assert.equal(state.spendable, 40);
});
test('invalid and hostile inputs never produce a balance change', () => {
  for (const gross of ['', NaN, Infinity, -1, '1e1000', null, true, {}, '0']) assert.throws(() => deposit(e.emptyState(), gross));
  for (const percent of [-1, 51, NaN, Infinity, 10.1]) assert.throws(() => deposit(e.emptyState(), 10, percent));
});
test('existing v5 entries migrate only when every balance and allocation reconciles', () => {
  const state = deposit(e.emptyState(), 500);
  delete state.version;
  assert.equal(e.validate(state).version, 2);
  for (const mutate of [s => s.spendable++, s => s.tx[0].vault++, s => s.tx[0].type = '<img src=x onerror=alert(1)>', s => s.tx[0].rate = 0.101]) {
    const broken = structuredClone(state); mutate(broken); assert.throws(() => e.validate(broken));
  }
});
test('untrusted audit labels are recomputed and notes remain text data', () => {
  let state = deposit(e.emptyState(), 500);
  state = e.apply(state, { type: 'Purchase', gross: 1, percent: 0, note: '<img onerror=alert(1)>', time: 2 });
  state.tx[0].audit = '<script>bad()</script>';
  const restored = e.validate(state);
  assert.equal(restored.tx[0].audit, 'VERIFIED'); assert.equal(restored.tx[1].note, '<img onerror=alert(1)>');
});
test('corrupt storage is preserved and write failure leaves original state untouched', () => {
  const original = deposit(e.emptyState(), 10);
  const store = { getItem: () => '{bad', setItem() { throw new Error('full'); } };
  assert.match(e.load(store).error, /preserved/); assert.equal(store.getItem(), '{bad');
  assert.throws(() => e.save(store, deposit(original, 1)), /full/);
  assert.equal(original.spendable, 9); assert.equal(original.tx.length, 1);
});
test('zero-percent rule and balance ceiling are enforced', () => {
  const state = deposit(e.emptyState(), 1_000_000_000, 0);
  assert.equal(state.spendable, 1_000_000_000); assert.equal(state.vaulted, 0);
  assert.throws(() => deposit(state, 1, 0), /limit/);
});
