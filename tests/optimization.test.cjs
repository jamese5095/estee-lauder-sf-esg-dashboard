const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
for (const file of ["data/dashboard-data.js", "data/rail-candidates.js", "assets/optimization.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}
const model = context.window.ESTEE_DASHBOARD_DATA.optimizationCase;
const pool = context.window.ESTEE_RAIL_CANDIDATES;
const calculate = (share, m = model, p = pool) => context.calculateRailShift(m, p, share);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("screened candidates reconcile to the verified May export", () => {
  assert.equal(pool.candidateWaybills, 13879);
  assert.equal(pool.fuelRoadWaybills, 16149);
  assert.equal(pool.laneWaybills, 45888);
  assert.equal(pool.minimumRecordedFuelRoadKm, 1000);
  assert.equal(pool.excludeRecordedRail, true);
  assert.equal(pool.period, model.period);
  assert.equal(pool.lane, model.lane);
  near(pool.laneFootprintTonnes, model.actualFootprintTonnes);
  near(pool.candidateWeightKg, 14222.245);
  near(pool.candidateChainWtwKg, 13742.19);
  near(pool.targetRoadActivityTonneKm, 17410.2116);
  near(pool.targetRoadEmissionsKg, 13510.1328);
});

for (const [share, count, tkm, roadKg, reduction, footprint] of [
  [5, 694, 859.0891, 666.6444, "0.64", "16.73"],
  [10, 1388, 1745.4142, 1354.4224, "1.29", "16.08"],
  [17, 2359, 2961.523, 2298.1096, "2.20", "15.18"],
  [20, 2776, 3506.8885, 2721.3061, "2.60", "14.77"],
  [30, 4164, 5301.6739, 4114.0414, "3.93", "13.44"],
]) {
  test(`${share}% selects ${count} whole waybills and uses their recorded activity`, () => {
    const result = calculate(share);
    assert.equal(result.selectedWaybills, count);
    near(result.activatedTonneKm, tkm);
    near(result.replacedRoadKg, roadKg);
    near(result.reductionTonnes, (roadKg - tkm * 0.0347023) / 1000);
    assert.equal(result.reductionTonnes.toFixed(2), reduction);
    assert.equal(result.optimizedFootprintTonnes.toFixed(2), footprint);
    near(result.optimizedFootprintTonnes + result.reductionTonnes, model.actualFootprintTonnes);
  });
}

test("waybill percentage is not substituted for activity or emission percentage", () => {
  const result = calculate(30);
  assert.notEqual(result.activatedTonneKm, pool.targetRoadActivityTonneKm * 0.3);
  assert.notEqual(result.replacedRoadKg, pool.targetRoadEmissionsKg * 0.3);
});

test("all 101 points use integer waybill counts and nested cumulative sums", () => {
  assert.equal(pool.curve.length, 101);
  pool.curve.forEach((point, i) => {
    assert.equal(point.length, 4);
    assert.ok(point.every(Number.isFinite));
    assert.equal(point[0], i);
    assert.equal(point[1], Math.round(pool.candidateWaybills * i / 100));
    if (i) {
      assert.ok(point[1] - pool.curve[i - 1][1] >= 100, "No individual-level publication");
      assert.ok(point[2] > pool.curve[i - 1][2]);
      assert.ok(point[3] > pool.curve[i - 1][3]);
      assert.ok(calculate(i).reductionTonnes > calculate(i - 1).reductionTonnes);
    }
    near(calculate(i).optimizedFootprintTonnes + calculate(i).reductionTonnes, model.actualFootprintTonnes);
  });
  near(calculate(100).activatedTonneKm, pool.targetRoadActivityTonneKm);
  near(calculate(100).replacedRoadKg, pool.targetRoadEmissionsKg);
});

test("all non-target emissions remain in the baseline at full activation", () => {
  const result = calculate(100);
  near(result.unchangedFootprintTonnes, model.actualFootprintTonnes - 13.5101328);
  near(result.optimizedFootprintTonnes, result.unchangedFootprintTonnes + result.replacementRailTonnes);
  assert.ok(result.unchangedFootprintTonnes > 0);
});

test("full-chain intensities do not drive transport-record savings", () => {
  const changed = JSON.parse(JSON.stringify(model));
  changed.candidateIntensity = 10000;
  changed.actualIntensity = 1;
  near(calculate(10, changed).reductionTonnes, calculate(10).reductionTonnes);
});

test("a longer rail route raises replacement emissions without altering selected bills", () => {
  const changed = JSON.parse(JSON.stringify(model));
  changed.railScenario.railDistanceRatio = 1.2;
  assert.ok(calculate(10, changed).reductionTonnes < calculate(10).reductionTonnes);
  assert.equal(calculate(10, changed).selectedWaybills, calculate(10).selectedWaybills);
});

test("zero, invalid, fractional and out-of-range shares are safely bounded", () => {
  for (const share of [0, -10, NaN, undefined, "bad", Infinity]) {
    near(calculate(share).reductionTonnes, 0);
    assert.equal(calculate(share).selectedWaybills, 0);
  }
  near(calculate(110).reductionTonnes, calculate(100).reductionTonnes);
  near(calculate(17.4).reductionTonnes, calculate(17).reductionTonnes);
});

test("inconsistent scenario points cannot silently relabel the count denominator", () => {
  const changed = JSON.parse(JSON.stringify(pool));
  changed.curve[10][1] = 1777;
  assert.throws(() => calculate(10, model, changed), /Invalid waybill/);
});

test("public scenario inputs contain aggregates only", () => {
  assert.equal(pool.selectionMethod, "fixed-emission-blind-order-v1");
  assert.equal(Object.values(pool).filter(Array.isArray).length, 2);
  const source = fs.readFileSync(path.join(root, "data/rail-candidates.js"), "utf8");
  assert.doesNotMatch(source, /SF\d{8,}|月结|账号|waybillId|accountId|sourcePath/);
});

test("client page explains screening and keeps manual control", () => {
  const html = fs.readFileSync(path.join(root, "optimization.html"), "utf8");
  assert.doesNotMatch(html, /rail-chain intensity|tonne-km selected|target-total-activity/i);
  assert.match(html, /min="5" max="30" step="1"/);
  assert.match(html, /Potential rail-shift shipments/);
  assert.match(html, /≥1,000 km/);
  assert.match(html, /No rail transport recorded/);
  assert.match(html, /Case-specific screening rule/);
  assert.match(html, /Illustrative selection/);
  assert.match(html, /Delivery-window fit/);
  assert.match(html, /id="selected-waybills"/);
});

test("candidate screening, slider and result share one module", () => {
  const html = fs.readFileSync(path.join(root, "optimization.html"), "utf8");
  const module = html.match(/<section class="rail-workbench rail-unified card"[\s\S]*?<\/section>/)?.[0];
  assert.ok(module);
  assert.equal((module.match(/<h2\b/g) || []).length, 1);
  assert.equal((module.match(/id="candidate-share"/g) || []).length, 1);
  assert.match(module, /id="rail-candidate-count"/);
  assert.match(module, /id="impact-reduction"/);
  assert.doesNotMatch(module, /rail-observed|rail-journey/);
});

test("every page's local links and assets resolve", () => {
  for (const name of fs.readdirSync(root).filter(name => name.endsWith(".html"))) {
    const html = fs.readFileSync(path.join(root, name), "utf8");
    for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(https?:|#|mailto:|data:)/.test(url)) continue;
      const local = url.split(/[?#]/)[0];
      assert.ok(fs.existsSync(path.join(root, local)), `${name}: missing ${local}`);
    }
  }
});

test("30T consolidation case uses one transport-intensity basis", () => {
  const scenario = model.roadConsolidationScenario;
  assert.equal(scenario.screenedWaybills, 13843);
  assert.equal(scenario.excludedExistingThirtyTWaybills, 14187);
  near(scenario.fuelRoadCategoryIntensityGPerTonneKm, 416.0798);
  near(scenario.thirtyTIntensityGPerTonneKm, 87.3773);
  near(scenario.gasolineReferenceIntensityGPerTonneKm, 242.7337);
  near(scenario.middleReferenceIntensityGPerTonneKm, 143.9655);
  assert.ok(scenario.gasolineReferenceIntensityGPerTonneKm < scenario.fuelRoadCategoryIntensityGPerTonneKm);
  assert.ok(scenario.thirtyTIntensityGPerTonneKm < scenario.middleReferenceIntensityGPerTonneKm);
  assert.ok(scenario.thirtyTIntensityGPerTonneKm < scenario.fuelRoadCategoryIntensityGPerTonneKm);
  near(scenario.screenedActivityTonneKm, 18085.6460);
  near(scenario.screenedRoadActivityTonneKm, 36861.0215);
  near(scenario.existingThirtyTActivityTonneKm, 17979.5366);
  near(scenario.allFuelRoadWtwKg, 15337.1281);
  near(scenario.existingThirtyTWtwKg, 1571.0033);
  assert.equal(scenario.additionalVehicleReferences.length, 4);
  near(scenario.additionalVehicleReferences[1].intensityGPerTonneKm, 349.4210);
});

for (const [share, expected] of [[10, "1.20"], [20, "2.40"], [30, "3.61"]]) {
  test(`${share}% 30T consolidation returns a conditional estimate`, () => {
    const result = context.calculateRoadConsolidation(model, share);
    assert.equal(result.reductionTonnes.toFixed(2), expected);
    near(result.remainingFootprintTonnes + result.reductionTonnes, model.actualFootprintTonnes);
  });
}

test("30T card is separate from the rail workbench", () => {
  const html = fs.readFileSync(path.join(root, "optimization.html"), "utf8");
  assert.match(html, /Extend 30T diesel consolidation/);
  assert.match(html, /gCO₂e \/ tonne-km/);
  assert.match(html, /All fuel-road records/);
  assert.match(html, /weighted overall/);
  assert.match(html, /30T diesel reference/);
  assert.match(html, /1.5T gasoline reference/);
  assert.match(html, /14T diesel reference/);
  assert.doesNotMatch(html, /lowest in this comparison/);
  assert.match(html, /5T diesel reference/);
  assert.match(html, /1\.5T diesel reference/);
  assert.doesNotMatch(html, /additional-road-references/);
  assert.match(html, /30T diesel candidate waybills/);
  assert.match(html, /Long-haul <b>≥1,000 km<\/b>/);
  assert.doesNotMatch(html, /Share means the portion of this screened activity/);
  assert.match(html, /Substitution scenario/);
  assert.match(html, /30T diesel candidate pool/);
  assert.match(html, /Candidate transport work shifted to 30T diesel/);
  assert.match(html, /of candidate transport work · estimated WTW reduction/);
  assert.equal((html.match(/data-road-share=/g) || []).length, 4);
  assert.doesNotMatch(html, /data-road-reduction/);
  assert.match(html, /Compatible loads/);
  assert.equal((html.match(/class="road-consolidation card"/g) || []).length, 1);
});
