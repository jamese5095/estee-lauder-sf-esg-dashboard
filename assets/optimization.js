document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const strategyButtons = [...document.querySelectorAll("[data-strategy]")];
  if (!model || !strategyButtons.length) return;

  let activeStrategy = "road";

  const render = () => {
    const strategy = model.strategies[activeStrategy];
    const intensityDelta =
      model.fuelRoad.baselineIntensityKgPerTonneKm -
      strategy.targetIntensityKgPerTonneKm;

    const title = document.querySelector("#scenario-strategy");
    if (title) title.textContent = strategy.name;

    model.scenarioShares.forEach((share) => {
      const assessedTonneKm = model.fuelRoad.transportTonneKm * share / 100;
      const reductionTonnes = assessedTonneKm * intensityDelta / 1000;
      const output = document.querySelector(`#scenario-${share}`);
      if (output) output.textContent = reductionTonnes.toFixed(2);
    });

    strategyButtons.forEach((button) => {
      const active = button.dataset.strategy === activeStrategy;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  strategyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStrategy = button.dataset.strategy;
      render();
    });
  });

  render();
});
