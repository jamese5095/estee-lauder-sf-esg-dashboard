document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const slider = document.querySelector("#candidate-share");
  const strategyButtons = [...document.querySelectorAll("[data-strategy]")];
  const presetButtons = [...document.querySelectorAll("[data-share]")];
  const sourceButtons = [...document.querySelectorAll("[data-source]")];
  if (!model || !slider || !strategyButtons.length) return;

  let activeStrategy = "road";

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  const formatNumber = (value, digits = 1) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  const renderScenario = () => {
    const share = Number(slider.value);
    const strategy = model.strategies[activeStrategy];
    const assessedTonneKm = model.fuelRoad.tonneKm * share / 100;
    const intensityDelta = model.fuelRoad.intensityKgPerTonneKm - strategy.targetIntensityKgPerTonneKm;
    const reductionTonnes = assessedTonneKm * intensityDelta / 1000;
    const remainingFootprint = model.actualFootprintTonnes - reductionTonnes;
    const footprintImprovement = reductionTonnes / model.actualFootprintTonnes * 100;
    const sliderProgress = (share - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100;

    slider.style.setProperty("--range-progress", `${sliderProgress}%`);
    slider.setAttribute(
      "aria-valuetext",
      `${share}% of observed fuel-road activity assessed, ${formatNumber(assessedTonneKm)} tonne-km`,
    );

    setText("#share-output", `${share}%`);
    setText("#candidate-total-tkm", `${formatNumber(model.fuelRoad.tonneKm)} tonne-km`);
    setText("#scenario-strategy", strategy.name);
    setText("#assessed-tkm", `${formatNumber(assessedTonneKm)} tonne-km`);
    setText("#impact-reduction", reductionTonnes.toFixed(2));
    setText("#impact-activity", `${formatNumber(assessedTonneKm)} t·km`);
    setText("#activity-share", `${share}% of actual fuel-road activity`);
    setText("#optimized-footprint", `${remainingFootprint.toFixed(2)} tCO₂e`);
    setText("#footprint-change", `${footprintImprovement.toFixed(1)}%`);
    setText("#baseline-intensity", Math.round(model.fuelRoad.intensityKgPerTonneKm * 1000));
    setText("#target-intensity", Math.round(strategy.targetIntensityKgPerTonneKm * 1000));
    setText("#intensity-delta", Math.round(intensityDelta * 1000));

    strategyButtons.forEach((button) => {
      const active = button.dataset.strategy === activeStrategy;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    presetButtons.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.share) === share);
    });
  };

  const renderSourceDetail = (sourceId) => {
    const source = model.transportSources.find((item) => item.id === sourceId);
    if (!source) return;
    const sourceCarbonTonnes = source.tonneKm * source.intensityKgPerTonneKm / 1000;

    setText("#source-detail-name", source.name);
    setText("#source-detail-intensity", `${Math.round(source.intensityKgPerTonneKm * 1000)} gCO₂e/t·km`);
    setText("#source-detail-records", new Intl.NumberFormat("en-US").format(source.records));
    setText("#source-detail-tkm", formatNumber(source.tonneKm));
    setText("#source-detail-carbon", sourceCarbonTonnes.toFixed(2));

    sourceButtons.forEach((button) => {
      const active = button.dataset.source === sourceId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  strategyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStrategy = button.dataset.strategy;
      renderScenario();
    });
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      slider.value = button.dataset.share;
      renderScenario();
    });
  });

  sourceButtons.forEach((button) => {
    button.addEventListener("click", () => renderSourceDetail(button.dataset.source));
  });

  slider.addEventListener("input", renderScenario);
  renderSourceDetail("fuel-road");
  renderScenario();
});
