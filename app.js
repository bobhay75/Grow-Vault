'use strict';
const $ = selector => document.querySelector(selector);
const engine = GrowVault;
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw new Error('Storage unavailable'); } }; }
const loaded = engine.load(storage);
let state = loaded.state;
let blocked = Boolean(loaded.error);
const money = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
function message(value, error = false) { $('#status').textContent = value; $('#status').className = error ? 'fine audit' : 'fine'; }
function render() {
  const goal = Math.max(1, Number($('#goal').value) || 1000);
  const rate = Number($('#rate').value) / 100;
  const budget = Math.max(1, Number($('#guard').value) || 100);
  const monthly = Math.max(1, Number($('#monthly').value) || 2000);
  const runway = Math.round(state.vaulted / monthly * 3000) / 100;
  const spent = state.tx.filter(item => item.type === 'Purchase').reduce((sum, item) => sum + engine.cents(item.gross), 0) / 100;
  const remaining = Math.round((budget - spent) * 100) / 100;
  $('#spendable').textContent = money(state.spendable);
  $('#vaulted').textContent = money(state.vaulted);
  $('#runway').textContent = runway < 1 ? 'Less than 1 day' : `${runway} ${runway === 1 ? 'day' : 'days'}`;
  $('#goalLabel').textContent = money(goal);
  $('#goalBar').style.width = Math.min(100, Math.max(0, state.vaulted / goal * 100)) + '%';
  $('#projection').textContent = state.vaulted >= goal ? 'Milestone reached. Set the next target.' : rate > 0 ? `At the current ${Math.round(rate * 100)}% rule, about ${money((goal - state.vaulted) / rate)} of future rule-triggering dollars would fully fund this goal.` : 'Choose a Vault Rule above 0% to see a projection.';
  const guard = $('#guardStatus');
  guard.className = 'guard ' + (remaining < 0 ? 'over' : remaining <= budget * .2 ? 'near' : '');
  guard.textContent = `${remaining <= 0 ? 'Budget reached' : money(remaining) + ' remaining'}. ${money(spent)} simulated discretionary spending against your ${money(budget)} self-set boundary.`;
  const ledger = $('#ledger');
  ledger.replaceChildren();
  for (const item of state.tx.slice(-8).reverse()) {
    const row = document.createElement('div'); row.className = 'tx';
    const detail = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = item.type;
    const date = document.createElement('small'); date.textContent = new Date(item.time).toLocaleString();
    detail.append(title, document.createElement('br'), date);
    if (item.type === 'Purchase' && item.vault > 0) { const allocation = document.createElement('small'); allocation.textContent = `${money(item.gross)} purchase + ${money(item.vault)} vaulted`; detail.append(document.createElement('br'), allocation); }
    if (item.note) { const note = document.createElement('small'); note.textContent = item.note; detail.append(document.createElement('br'), note); }
    const amount = document.createElement('div'); amount.textContent = item.type === 'Deposit' ? money(item.gross) : '-' + money(item.spend);
    const audit = document.createElement('div'); audit.className = 'good'; audit.textContent = 'Math reconciled';
    row.append(detail, amount, audit); ledger.append(row);
  }
  if (!state.tx.length) ledger.textContent = 'No transactions yet. Run your first deposit.';
  $('#add').disabled = blocked;
  $('#spend').disabled = blocked;
}
function syncLabels() { $('#depositValue').textContent = money(Number($('#depositCustom').value) || 0); $('#rateValue').textContent = $('#rate').value + '%'; render(); }
function record(type) {
  if (blocked) return;
  try {
    const trigger = $('#trigger').value;
    if (!['both', 'deposit', 'spend'].includes(trigger)) throw new Error('Choose a valid rule trigger.');
    const applies = trigger === 'both' || trigger === (type === 'Deposit' ? 'deposit' : 'spend');
    const next = engine.apply(state, { type, gross: $(type === 'Deposit' ? '#depositCustom' : '#purchase').value, percent: applies ? $('#rate').value : 0, note: $('#note').value });
    try { state = engine.save(storage, next); } catch { throw new Error('This transaction was not saved. Device storage may be unavailable or full. Your balances have not changed. Export your records before clearing storage.'); }
    message('Simulation transaction saved on this device.'); render();
  } catch (error) { message(error.message, true); }
}
$('#deposit').oninput = () => { $('#depositCustom').value = $('#deposit').value; syncLabels(); };
$('#depositCustom').oninput = syncLabels; $('#rate').oninput = syncLabels;
for (const id of ['goal', 'trigger', 'guard', 'monthly']) $('#' + id).onchange = render;
$('#add').onclick = () => record('Deposit'); $('#spend').onclick = () => record('Purchase');
$('#reset').onclick = () => {
  if (!window.confirm('Delete the saved simulation and start again? Export your records first if you need a copy.')) return;
  try { state = engine.save(storage, engine.emptyState()); blocked = false; message('Simulation reset.'); render(); }
  catch { message('Reset could not be saved. Your existing records have not been changed.', true); }
};
$('#export').onclick = () => {
  try {
    const raw = blocked ? storage.getItem(engine.KEY) : JSON.stringify(state, null, 2);
    if (raw === null) throw new Error('There is no saved data to export.');
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'grow-vault-simulation.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('Simulation export prepared. Keep it private if notes include personal information.');
  } catch { message('Saved data could not be exported from this browser.', true); }
};
window.addEventListener('storage', event => {
  if (event.key !== engine.KEY && event.key !== null) return;
  const fresh = engine.load(storage); state = fresh.state; blocked = Boolean(fresh.error);
  message(fresh.error || 'Loaded the simulation changed in another tab.', blocked); render();
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
syncLabels(); if (loaded.error) message(loaded.error, true);
