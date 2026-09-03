const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "data/dashboard-data.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "assets/optimization.js"), "utf8"), context);
const model = context.window.ESTEE_DASHBOARD_DATA.optimizationCase;
const calculate = context.calculateRailShift;
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

for (const [share, reduction, footprint] of [[5, "0.65", "16.73"], [10, "1.29", "16.08"], [17, "2.20", "15.18"], [20, "2.58", "14.79"], [30, "3.87", "13.50"]]) {
  test(`rail scenario at ${share}% preserves the source-unit calculation`, () => {
    const result = calculate(model, share);
    near(result.activatedTonneKm, 17423.449 * share / 100);
    const expected = (13520.4006 * share / 100 - result.activatedTonneKm * 0.0347023) / 1000;
    near(result.reductionTonnes, expected);
    assert.equal(result.reductionTonnes.toFixed(2), reduction);
    assert.equal(result.optimizedFootprintTonnes.toFixed(2), footprint);
    near(result.optimizedFootprintTonnes + result.reductionTonnes, model.actualFootprintTonnes);
  });
}

test("non-target emissions stay unchanged, even at 100% of targeted activity", () => {
  const result = calculate(model, 100);
  near(result.unchangedFootprintTonnes, model.actualFootprintTonnes - 13.5204006);
  near(result.optimizedFootprintTonnes, result.unchangedFootprintTonnes + result.replacementRailTonnes);
  assert.ok(result.unchangedFootprintTonnes > 0);
});

test("shipment-chain intensities do not drive transport-leg savings", () => {
  const changed = JSON.parse(JSON.stringify(model));
  changed.candidateIntensity = 10000;
  changed.railScenario.observedRailChainIntensityGPerKg = 1;
  near(calculate(changed, 10).reductionTonnes, calculate(model, 10).reductionTonnes);
});

test("a longer rail route increases replacement emissions", () => {
  const changed = JSON.parse(JSON.stringify(model));
  changed.railScenario.railDistanceRatio = 1.2;
  assert.ok(calculate(changed, 10).reductionTonnes < calculate(model, 10).reductionTonnes);
});

test("zero and out-of-range shares are bounded", () => {
  near(calculate(model, 0).reductionTonnes, 0);
  near(calculate(model, -10).reductionTonnes, 0);
  near(calculate(model, 110).reductionTonnes, calculate(model, 100).reductionTonnes);
});

test("client page presents one pathway and retains the manual slider", () => {
  const html = fs.readFileSync(path.join(root, "optimization.html"), "utf8");
  assert.doesNotMatch(html, /data-strategy|matched|comparison|30T|optimized-intensity/i);
  assert.match(html, /min="5" max="30" step="1"/);
  assert.match(html, /tonne-km selected/);
  assert.match(html, /Observed rail-chain intensity/);
});

test("rail pathway and controls share one module with one heading", () => {
  const html = fs.readFileSync(path.join(root, "optimization.html"), "utf8");
  const module = html.match(/<section class="rail-workbench rail-unified card"[\s\S]*?<\/section>/)?.[0];
  assert.ok(module);
  assert.equal((module.match(/<h2\b/g) || []).length, 1);
  assert.equal((module.match(/id="candidate-share"/g) || []).length, 1);
  assert.match(module, /id="impact-reduction"/);
  assert.match(module, /id="rail-waybills"/);
  assert.doesNotMatch(module, /<article\b|SF rail pathway|Interactive rail scenario|Scale the rail shift/);
});
