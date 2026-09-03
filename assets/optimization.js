// Only the selected Fuel vehicle transport rows change; all other emissions stay in the baseline.
function calculateRailShift(model, share) {
  const scenario = model.railScenario;
  const fraction = Math.max(0, Math.min(100, Number(share) || 0)) / 100;
  const activatedTonneKm = scenario.targetRoadActivityTonneKm * fraction;
  const replacedRoadKg = scenario.targetRoadEmissionsKg * fraction;
  const replacementRailKg = activatedTonneKm * scenario.railDistanceRatio * scenario.railIntensityKgPerTonneKm;
  const reductionTonnes = (replacedRoadKg - replacementRailKg) / 1000;
  const unchangedFootprintTonnes = model.actualFootprintTonnes - replacedRoadKg / 1000;
  return {
    activatedTonneKm,
    reductionTonnes,
    unchangedFootprintTonnes,
    replacementRailTonnes: replacementRailKg / 1000,
    optimizedFootprintTonnes: unchangedFootprintTonnes + replacementRailKg / 1000,
    reductionPercent: reductionTonnes / model.actualFootprintTonnes * 100,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const slider = document.querySelector("#candidate-share");
  const presetButtons = [...document.querySelectorAll("[data-share]")];
  if (!model?.railScenario || !slider) return;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  const number = (value) => value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  setText("#rail-waybills", number(model.railScenario.observedRailWaybills));
  setText("#rail-chain-intensity", number(model.railScenario.observedRailChainIntensityGPerKg));
  setText("#target-total-activity", number(model.railScenario.targetRoadActivityTonneKm));

  const render = () => {
    const share = Number(slider.value);
    const result = calculateRailShift(model, share);
    const sliderProgress = (share - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100;

    slider.style.setProperty("--range-progress", `${sliderProgress}%`);
    slider.setAttribute("aria-valuetext", `${share}% of targeted road transport work shifted to rail, ${number(result.activatedTonneKm)} tonne-kilometres`);
    setText("#share-output", `${share}%`);
    setText("#activated-activity", number(result.activatedTonneKm));
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
});
