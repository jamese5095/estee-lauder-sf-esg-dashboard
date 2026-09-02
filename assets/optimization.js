document.addEventListener("DOMContentLoaded", () => {
  const data = window.ESTEE_DASHBOARD_DATA;
  const priorityList = document.querySelector("#priority-list");
  if (!data || !priorityList || !data.optimizationPriorities) return;

  const findMethod = (methodId) => {
    for (const lever of data.levers) {
      const method = lever.methods.find((item) => item.id === methodId);
      if (method) return { lever, method };
    }
    return null;
  };

  const requestedMethod = new URLSearchParams(window.location.search).get("method");
  const requestedPriority = data.optimizationPriorities.find((item) => item.methodId === requestedMethod);
  let activeMethodId = (requestedPriority || data.optimizationPriorities[0]).methodId;

  function renderPriorities() {
    priorityList.replaceChildren();
    data.optimizationPriorities.forEach((priority) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "priority-button";
      button.setAttribute("aria-pressed", String(priority.methodId === activeMethodId));
      button.innerHTML = `<span class="priority-code">${priority.code}</span>
        <span class="priority-copy"><strong>${priority.title}</strong><small>${priority.signal}</small></span>
        <span class="priority-metric"><strong>${priority.metric}</strong><small>${priority.unit}</small></span>`;
      button.addEventListener("click", () => selectPriority(priority.methodId));
      priorityList.appendChild(button);
    });
  }

  function renderMatch() {
    const priority = data.optimizationPriorities.find((item) => item.methodId === activeMethodId);
    const selection = findMethod(activeMethodId);
    if (!priority || !selection) return;
    const { lever, method } = selection;
    const gauge = document.querySelector("#match-gauge");

    document.querySelector("#priority-title").textContent = priority.title;
    document.querySelector("#match-stage").textContent = method.stage;
    document.querySelector("#gauge-value").textContent = `${priority.share.toFixed(2)}%`;
    document.querySelector("#gauge-context").textContent = priority.shareContext;
    document.querySelector("#priority-signal").textContent = priority.signal;
    document.querySelector("#evidence-pool").textContent = `${priority.metric} ${priority.unit} visible pool`;
    document.querySelector("#match-lever").textContent = lever.name;
    document.querySelector("#match-method").textContent = `${method.number} · ${method.name}`;
    document.querySelector("#match-reason").textContent = priority.reason;
    document.querySelector("#next-step").textContent = priority.nextStep;
    document.querySelector("#validation-chips").innerHTML = priority.validation.map((item) => `<span>${item}</span>`).join("");
    document.querySelector("#outcome-grid").innerHTML = method.outcomes.map((item) => `<div class="outcome-item"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("");
    gauge.style.setProperty("--gauge-value", `${priority.share}%`);
    gauge.setAttribute("aria-label", `${priority.share.toFixed(2)}% ${priority.shareContext}`);
    try {
      window.history.replaceState({}, "", `${window.location.pathname}?method=${method.id}`);
    } catch (_) {
      // Some local file viewers do not allow URL replacement; the interaction still works.
    }
  }

  function renderEngine() {
    renderPriorities();
    renderMatch();
  }

  function selectPriority(methodId) {
    if (!data.optimizationPriorities.some((item) => item.methodId === methodId)) return;
    activeMethodId = methodId;
    renderEngine();
  }

  renderEngine();
});
