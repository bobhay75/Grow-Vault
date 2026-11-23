/* Deterministic, simulation-only ledger. Money is calculated as integer cents. */
(function (root) {
  'use strict';
  const KEY = 'growvault-demo';
  const MAX_CENTS = 100_000_000_000;
  const MAX_TRANSACTIONS = 10_000;
  const emptyState = () => ({ version: 2, spendable: 0, vaulted: 0, tx: [] });
  function cents(value, allowZero = true) {
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') throw new Error('Enter a valid money amount.');
    const amount = Number(value);
    const result = Math.round((amount + Number.EPSILON) * 100);
    if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(result) || result > MAX_CENTS || (!allowZero && result === 0)) throw new Error('Use a positive amount up to $1 billion.');
    return result;
  }
  function percentage(value) {
    const rate = Number(value);
    if (!Number.isFinite(rate) || rate < 0 || rate > 50 || !Number.isInteger(rate)) throw new Error('Choose a whole-number Vault Rule from 0% to 50%.');
    return rate;
  }
  function apply(current, input) {
    if (!current || !Array.isArray(current.tx) || current.tx.length >= MAX_TRANSACTIONS) throw new Error('The simulation ledger is full. Export your records before resetting.');
    if (!['Deposit', 'Purchase'].includes(input.type)) throw new Error('Unknown transaction type.');
    const gross = cents(input.gross, false);
    const rate = percentage(input.percent);
    const vault = Math.round(gross * rate / 100);
    const spend = input.type === 'Deposit' ? gross - vault : gross + vault;
    let available = cents(current.spendable);
    let protectedCents = cents(current.vaulted);
    if (input.type === 'Purchase' && spend > available) throw new Error(`This purchase needs $${(spend / 100).toFixed(2)} available, including $${(vault / 100).toFixed(2)} for your Vault.`);
    available += input.type === 'Deposit' ? spend : -spend;
    protectedCents += vault;
    if (available > MAX_CENTS || protectedCents > MAX_CENTS) throw new Error('The simulation balance limit is $1 billion per balance.');
    const time = input.time ?? Date.now();
    if (!Number.isSafeInteger(time) || time < 0 || !Number.isFinite(new Date(time).getTime())) throw new Error('Invalid transaction date.');
    const entry = { type: input.type, gross: gross / 100, rate: rate / 100, vault: vault / 100, spend: spend / 100, time, audit: 'VERIFIED' };
    if (input.type === 'Purchase') { entry.amount = gross / 100; entry.note = String(input.note ?? '').slice(0, 80); }
    return { version: 2, spendable: available / 100, vaulted: protectedCents / 100, tx: [...current.tx, entry] };
  }
  function validate(parsed) {
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tx) || parsed.tx.length > MAX_TRANSACTIONS) throw new Error('Invalid saved ledger.');
    let restored = emptyState();
    for (const item of parsed.tx) {
      if (!item || typeof item !== 'object' || typeof item.rate !== 'number' || typeof item.time !== 'number') throw new Error('Invalid saved transaction.');
      const next = apply(restored, { type: item.type, gross: item.gross, percent: Math.round(item.rate * 100), note: item.note, time: item.time });
      const expected = next.tx[next.tx.length - 1];
      if (Math.abs(expected.rate - item.rate) > 1e-9 || cents(item.vault) !== cents(expected.vault) || cents(item.spend) !== cents(expected.spend)) throw new Error('The saved ledger does not reconcile.');
      restored = next;
    }
    if (cents(parsed.spendable) !== cents(restored.spendable) || cents(parsed.vaulted) !== cents(restored.vaulted)) throw new Error('Saved balances do not match the ledger.');
    return restored;
  }
  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      return { state: raw === null ? emptyState() : validate(JSON.parse(raw)), error: null };
    } catch {
      return { state: emptyState(), error: 'Saved data could not be loaded safely. It has been preserved. Export the saved data or reset this simulation to continue.' };
    }
  }
  function save(storage, next) {
    // Caller must not publish next to the UI before this write succeeds.
    storage.setItem(KEY, JSON.stringify(next));
    return next;
  }
  const api = { KEY, MAX_TRANSACTIONS, emptyState, cents, percentage, apply, validate, load, save };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GrowVault = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
