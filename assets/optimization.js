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
