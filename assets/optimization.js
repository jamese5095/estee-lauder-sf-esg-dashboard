document.addEventListener("DOMContentLoaded", () => {
  const model = window.ESTEE_DASHBOARD_DATA?.optimizationCase;
  const slider = document.querySelector("#eligible-share");
  const strategyButtons = [...document.querySelectorAll("[data-strategy]")];
  const presetButtons = [...document.querySelectorAll("[data-share]")];
  if (!model || !slider || !strategyButtons.length) return;

  let activeStrategy = "road";

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  const calculateReduction = (share, strategy) => {
    const intensityDelta =
      model.fuelRoad.chainIntensityGPerKg -
      strategy.targetChainIntensityGPerKg;
    return model.fuelRoad.weightKg * share / 100 * intensityDelta / 1_000_000;
  };

  const render = () => {
    const share = Number(slider.value);
    const strategy = model.strategies[activeStrategy];
    const reduction = calculateReduction(share, strategy);
    const sliderProgress =
      (share - Number(slider.min)) /
      (Number(slider.max) - Number(slider.min)) *
      100;

    slider.style.setProperty("--range-progress", `${sliderProgress}%`);
    slider.setAttribute(
      "aria-valuetext",
      `${share}% eligible share, ${reduction.toFixed(2)} tonnes of estimated WTW reduction`,
    );

    setText("#scenario-strategy", strategy.name);
    setText("#share-output", `${share}%`);
    setText("#selected-reduction", reduction.toFixed(2));

    model.scenarioShares.forEach((referenceShare) => {
      setText(
        `#scenario-${referenceShare}`,
        calculateReduction(referenceShare, strategy).toFixed(2),
      );
    });

    strategyButtons.forEach((button) => {
      const active = button.dataset.strategy === activeStrategy;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    presetButtons.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.share) === share);
    });
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
