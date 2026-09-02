document.addEventListener("DOMContentLoaded", () => {
  const data = window.ESTEE_DASHBOARD_DATA;
  const signalList = document.querySelector("#signal-list");
  const leverTabs = document.querySelector("#lever-tabs");
  const methodList = document.querySelector("#method-list");
  if (!data || !signalList || !leverTabs || !methodList) return;

  const findMethod = (methodId) => {
    for (const lever of data.levers) {
      const method = lever.methods.find((item) => item.id === methodId);
      if (method) return { lever, method };
    }
    return null;
  };

  const requestedMethod = new URLSearchParams(window.location.search).get("method");
  const initial = findMethod(requestedMethod) || findMethod("m2");
  let activeMethodId = initial.method.id;
  let activeLeverId = initial.lever.id;
  let activeSignalId = initial.method.signalId;

  function renderSignals() {
    signalList.replaceChildren();
    data.signals.forEach((signal) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "signal-button";
      button.setAttribute("aria-pressed", String(signal.id === activeSignalId));
      button.innerHTML = `<span class="signal-code">${signal.code}</span>
        <span class="signal-copy"><strong>${signal.title}</strong><span>${signal.note}</span></span>
        <span class="signal-value">${signal.value}</span>`;
      button.addEventListener("click", () => selectMethod(signal.methodId, signal.id));
      signalList.appendChild(button);
    });
  }

  function renderLevers() {
    leverTabs.replaceChildren();
    data.levers.forEach((lever) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lever-button";
      button.setAttribute("aria-pressed", String(lever.id === activeLeverId));
      button.innerHTML = `<span>${lever.range}</span>${lever.short}`;
      button.addEventListener("click", () => selectMethod(lever.methods[0].id, lever.methods[0].signalId));
      leverTabs.appendChild(button);
    });
  }

  function renderMethods() {
    const lever = data.levers.find((item) => item.id === activeLeverId);
    methodList.replaceChildren();
    lever.methods.forEach((method) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "method-button";
      button.setAttribute("aria-pressed", String(method.id === activeMethodId));
      button.innerHTML = `<span class="method-number">${method.number}</span>
        <span class="method-copy"><strong>${method.name}</strong><span>${method.summary}</span></span>
        <span class="method-stage">${method.stage}</span>`;
      button.addEventListener("click", () => selectMethod(method.id, method.signalId));
      methodList.appendChild(button);
    });
    document.querySelector("#method-count").textContent = `${lever.range} of 15`;
  }

  function renderOpportunity() {
    const selection = findMethod(activeMethodId);
    if (!selection) return;
    const { lever, method } = selection;
    document.querySelector("#model-status").textContent = method.stage;
    document.querySelector("#opportunity-number").textContent = method.number;
    document.querySelector("#opportunity-lever").textContent = lever.name;
    document.querySelector("#opportunity-name").textContent = method.name;
    document.querySelector("#evidence-value").textContent = method.evidenceValue;
    document.querySelector("#evidence-text").textContent = method.evidenceText;
    document.querySelector("#logic-line").textContent = method.logic;
    document.querySelector("#input-chips").innerHTML = method.inputs.map((item) => `<span>${item}</span>`).join("");
    document.querySelector("#outcome-grid").innerHTML = method.outcomes.map((item) => `<div class="outcome-item"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("");
    try {
      window.history.replaceState({}, "", `${window.location.pathname}?method=${method.id}`);
    } catch (_) {
      // Some local file viewers do not allow URL replacement; the interaction still works.
    }
  }

  function renderEngine() {
    renderSignals();
    renderLevers();
    renderMethods();
    renderOpportunity();
  }

  function selectMethod(methodId, signalId) {
    const selection = findMethod(methodId);
    if (!selection) return;
    activeMethodId = methodId;
    activeLeverId = selection.lever.id;
    activeSignalId = signalId || selection.method.signalId;
    renderEngine();
  }

  renderEngine();
});
