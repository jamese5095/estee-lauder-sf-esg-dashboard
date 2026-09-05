const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data/transport-mix.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/transport-mix.js'), 'utf8'), context);
const mix = context.window.ESTEE_TRANSPORT_MIX;

test('both transport composition columns reconcile to the audited full-lane totals', () => {
  assert.equal(mix.totalActivityTonneKm, 67001.7064);
  assert.ok(Math.abs(mix.totalWtwKg - 17275.9689) < 0.0001);
  const shares = context.transportMixShares(mix);
  for (const field of ['workShare', 'carbonShare']) {
    assert.ok(Math.abs(shares.reduce((total, row) => total + row[field], 0) - 100) < 1e-10);
  }
  assert.equal(shares.find(row => row.id === 'fuel-road').carbonShare.toFixed(1), '82.3');
  assert.equal(shares.find(row => row.id === 'fuel-road').workShare.toFixed(1), '31.2');
  const merged = mix.categories.find(row => row.id === 'fuel-road');
  for (const field of ['activityTonneKm', 'wtwKg']) {
    assert.ok(Math.abs(merged.components.reduce((sum, item) => sum + item[field], 0) - merged[field]) < 0.0001);
  }
  const other = mix.categories.find(row => row.id === 'other');
  assert.ok(Math.abs(other.activityTonneKm + merged.components[2].activityTonneKm - 1501.3676) < 0.0001);
  assert.ok(Math.abs(other.wtwKg + merged.components[2].wtwKg - 567.0628) < 0.0001);
});

test('coverage uses deduplicated lane waybills, not emissions or activity', () => {
  assert.equal(mix.waybills, 45888);
  assert.equal(mix.railWaybills, 17772);
  assert.equal(mix.thirtyTWaybills, 14191);
  assert.equal((mix.railWaybills / mix.waybills * 100).toFixed(1), '38.7');
  assert.equal((mix.thirtyTWaybills / mix.waybills * 100).toFixed(1), '30.9');
});

test('missing category activity cannot be silently normalized to 100 percent', () => {
  const incomplete = { ...mix, categories: mix.categories.slice(1) };
  assert.throws(() => context.transportMixShares(incomplete), /do not reconcile/);
});
