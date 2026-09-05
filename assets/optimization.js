// Each curve point sums actual transport records for a whole-waybill selection.
// The count percentage is never applied directly to total emissions or tonne-km.
function calculateRailShift(model, candidates, share) {
  const numericShare = Number(share);
  const sharePercent = Math.round(Math.max(0, Math.min(100, Number.isFinite(numericShare) ? numericShare : 0)));
  const point = candidates.curve[sharePercent];
  if (!point || point.length !== 4 || !point.every(Number.isFinite) || point[2] < 0 || point[3] < 0 || point[0] !== sharePercent || point[1] !== Math.round(candidates.candidateWaybills * sharePercent / 100)) {
    throw new Error("Invalid waybill scenario inputs");
  }
  const [, selectedWaybills, activatedTonneKm, replacedRoadKg] = point;
  const scenario = model.railScenario;
  const replacementRailKg = activatedTonneKm * scenario.railDistanceRatio * scenario.railIntensityKgPerTonneKm;
  const reductionTonnes = (replacedRoadKg - replacementRailKg) / 1000;
  const unchangedFootprintTonnes = model.actualFootprintTonnes - replacedRoadKg / 1000;
  return {
    sharePercent,
    selectedWaybills,
    activatedTonneKm,
    replacedRoadKg,
    reductionTonnes,
    unchangedFootprintTonnes,
    replacementRailTonnes: replacementRailKg / 1000,
    optimizedFootprintTonnes: unchangedFootprintTonnes + replacementRailKg / 1000,
    reductionPercent: reductionTonnes / model.actualFootprintTonnes * 100,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const candidates = window.ESTEE_RAIL_CANDIDATES;
  const slider = document.querySelector("#candidate-share");
  const presetButtons = [...document.querySelectorAll("[data-share]")];
  if (!slider) return;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  if (!model?.railScenario || !candidates || candidates.schemaVersion !== 1 || candidates.period !== model.period || candidates.lane !== model.lane || candidates.laneFootprintTonnes !== model.actualFootprintTonnes || !Array.isArray(candidates.curve) || candidates.curve.length !== 101) {
    setText("#rail-scenario-basis", "Scenario unavailable. Refresh the page to try again.");
    return;
  }

  const number = (value) => value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  setText("#rail-candidate-count", number(candidates.candidateWaybills));
  setText("#candidate-total", number(candidates.candidateWaybills));

  const render = () => {
    const result = calculateRailShift(model, candidates, slider.value);
    const share = result.sharePercent;
    const sliderProgress = (share - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100;
    slider.style.setProperty("--range-progress", `${sliderProgress}%`);
    slider.setAttribute("aria-valuetext", `${share}% of candidate shipments: ${number(result.selectedWaybills)} of ${number(candidates.candidateWaybills)} waybills selected for the rail-shift scenario`);
    setText("#share-output", `${share}%`);
    setText("#selected-waybills", number(result.selectedWaybills));
    setText("#impact-reduction", result.reductionTonnes.toFixed(2));
    setText("#actual-footprint", model.actualFootprintTonnes.toFixed(2));
    setText("#optimized-footprint", result.optimizedFootprintTonnes.toFixed(2));
    setText("#footprint-change", `${result.reductionPercent.toFixed(1)}% reduction`);
    const mix = window.ESTEE_TRANSPORT_MIX;
    if (mix) {
      setText("#rail-coverage-after", `${(mix.railWaybills / mix.waybills * 100).toFixed(1)}% → ${((mix.railWaybills + result.selectedWaybills) / mix.waybills * 100).toFixed(1)}%`);
    }
    presetButtons.forEach((button) => {
      const active = Number(button.dataset.share) === share;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      slider.value = button.dataset.share;
      render();
    });
  });
  slider.addEventListener("input", render);
  render();
  slider.disabled = false;
  presetButtons.forEach((button) => { button.disabled = false; });
});

function calculateRoadConsolidation(model, share) {
  const scenario = model.roadConsolidationScenario;
  const fraction = Math.max(0, Math.min(100, Number(share) || 0)) / 100;
  const replacedRoadKg = scenario.screenedRoadWtwKg * fraction;
  const replacementThirtyTKg = scenario.screenedActivityTonneKm * fraction * scenario.thirtyTIntensityGPerTonneKm / 1000;
  const reductionTonnes = (replacedRoadKg - replacementThirtyTKg) / 1000;
  return { share: fraction * 100, reductionTonnes, remainingFootprintTonnes: model.actualFootprintTonnes - reductionTonnes, selectedActivityTonneKm: scenario.screenedActivityTonneKm * fraction };
}

document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const scenario = model?.roadConsolidationScenario;
  const options = [...document.querySelectorAll("[data-road-share]")];
  if (!scenario || !options.length) return;
  const number = (value) => value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
  setText("#fuel-road-intensity", scenario.fuelRoadCategoryIntensityGPerTonneKm.toFixed(1));
  setText("#gasoline-intensity", scenario.gasolineReferenceIntensityGPerTonneKm.toFixed(1));
  setText("#fourteen-t-intensity", scenario.middleReferenceIntensityGPerTonneKm.toFixed(1));
  setText("#thirty-t-intensity", scenario.thirtyTIntensityGPerTonneKm.toFixed(1));
  setText("#road-candidate-count", number(scenario.screenedWaybills));
  const referenceValue = (label) => scenario.additionalVehicleReferences?.find((item) => item.label === label)?.intensityGPerTonneKm;
  setText("#one-point-five-t-diesel-intensity", referenceValue("1.5T diesel")?.toFixed(1));
  setText("#five-t-intensity", referenceValue("5T diesel")?.toFixed(1));
  const render = (share) => {
    const result = calculateRoadConsolidation(model, share);
    setText("#road-output-label", `${result.share}% of candidate transport work · estimated WTW reduction`);
    setText("#road-reduction-output", result.reductionTonnes.toFixed(2));
    setText("#road-after-output", result.remainingFootprintTonnes.toFixed(2));
    const mix = window.ESTEE_TRANSPORT_MIX;
    const thirty = mix?.categories.find(item => item.id === "thirty");
    if (thirty) {
      setText("#road-work-share-after", `${(thirty.activityTonneKm / mix.totalActivityTonneKm * 100).toFixed(1)}% → ${((thirty.activityTonneKm + result.selectedActivityTonneKm) / mix.totalActivityTonneKm * 100).toFixed(1)}%`);
    }
    options.forEach((option) => { const active = Number(option.dataset.roadShare) === result.share; option.classList.toggle("active", active); option.setAttribute("aria-pressed", String(active)); });
  };
  options.forEach((option) => option.addEventListener("click", () => render(option.dataset.roadShare)));
  render(20);
});
