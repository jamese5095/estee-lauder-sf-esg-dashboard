document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const slider = document.querySelector("#candidate-share");
  const strategyButtons = [...document.querySelectorAll("[data-strategy]")];
  const presetButtons = [...document.querySelectorAll("[data-share]")];
  if (!model || !slider || !strategyButtons.length) return;

  let activeStrategy = "road";

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  const render = () => {
    const share = Number(slider.value);
    const strategy = model.strategies[activeStrategy];
    const activatedWeightKg = model.candidateWeightKg * share / 100;
    const intensityDelta = strategy.matchedBaselineIntensity - strategy.targetIntensity;
    const reductionTonnes = activatedWeightKg * intensityDelta / 1_000_000;
    const optimizedFootprint = model.actualFootprintTonnes - reductionTonnes;
    const optimizedIntensity = optimizedFootprint * 1_000_000 / model.totalWeightKg;
    const footprintImprovement = reductionTonnes / model.actualFootprintTonnes * 100;
    const sliderProgress = (share - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100;

    slider.style.setProperty("--range-progress", `${sliderProgress}%`);
    slider.setAttribute("aria-valuetext", `${share}% of candidate weight activated`);
    setText("#share-output", `${share}%`);
    setText("#scenario-strategy", strategy.name);
    setText("#impact-reduction", reductionTonnes.toFixed(2));
    document.querySelector("#impact-reduction")?.insertAdjacentHTML("beforeend", " <small>tCO₂e</small>");
    setText("#activated-weight", `${(activatedWeightKg / 1000).toFixed(2)} tonnes`);
    setText("#optimized-footprint", `${optimizedFootprint.toFixed(2)} tCO₂e`);
    setText("#footprint-change", `${footprintImprovement.toFixed(1)}% improvement`);
    setText("#optimized-intensity", `${optimizedIntensity.toFixed(1)} g/kg`);
    setText("#freight-delta", `${strategy.freightDeltaPercent >= 0 ? "+" : ""}${strategy.freightDeltaPercent.toFixed(2)}%`);
    setText("#matched-baseline", strategy.matchedBaselineIntensity.toFixed(1));
    setText("#target-intensity", strategy.targetIntensity.toFixed(1));
    setText("#intensity-delta", intensityDelta.toFixed(1));

    strategyButtons.forEach((button) => {
      const active = button.dataset.strategy === activeStrategy;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    presetButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.share) === share));
  };

  strategyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStrategy = button.dataset.strategy;
      render();
    });
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      slider.value = button.dataset.share;
      render();
    });
  });

  slider.addEventListener("input", render);
  render();
});
