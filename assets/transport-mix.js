function transportMixShares(mix) {
  const total = mix.categories.reduce((sum, item) => ({
    work: sum.work + item.activityTonneKm, carbon: sum.carbon + item.wtwKg,
  }), { work: 0, carbon: 0 });
  if (!(total.work > 0 && total.carbon > 0) || Math.abs(total.work - mix.totalActivityTonneKm) > 0.001 || Math.abs(total.carbon - mix.totalWtwKg) > 0.001) {
    throw new Error("Transport categories do not reconcile to the lane totals");
  }
  return mix.categories.map(item => ({ ...item,
    workShare: item.activityTonneKm / total.work * 100,
    carbonShare: item.wtwKg / total.carbon * 100,
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  const mix = window.ESTEE_TRANSPORT_MIX;
  if (!mix || !document.querySelector("#mix-work")) return;
  const rows = transportMixShares(mix);
  const pct = value => `${value.toFixed(1)}%`;
  const number = value => value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const text = (selector, value) => { document.querySelector(selector).textContent = value; };
  const controls = [];
  let selectedCategory = null;
  const select = (id) => {
    if (selectedCategory === id) {
      selectedCategory = null;
      controls.forEach(button => {
        button.classList.remove("is-selected", "is-muted");
        button.setAttribute("aria-pressed", "false");
      });
      text("#mix-selection", "Select a category to highlight its share in both columns.");
      return;
    }
    selectedCategory = id;
    const row = rows.find(item => item.id === id);
    controls.forEach(button => {
      const active = button.dataset.category === id;
      button.classList.toggle("is-selected", active);
      button.classList.toggle("is-muted", !active);
      button.setAttribute("aria-pressed", String(active));
    });
    text("#mix-selection", `${row.label}: ${pct(row.workShare)} of transport work · ${pct(row.carbonShare)} of transport emissions. ${row.detail}`);
  };
  for (const [selector, field, unit, metric] of [["#mix-work", "workShare", "tonne-km", "activityTonneKm"], ["#mix-emissions", "carbonShare", "kgCO₂e", "wtwKg"]]) {
    const container = document.querySelector(selector);
    rows.forEach(row => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `mix-segment mix-${row.id}`;
      button.dataset.category = row.id;
      button.style.setProperty("--segment-color", row.color);
      button.style.height = `${row[field]}%`;
      const label = `${row.label}: ${pct(row[field])} · ${number(row[metric])} ${unit}`;
      button.setAttribute("aria-label", label);
      button.title = label;
      if (row[field] >= 8) button.textContent = pct(row[field]);
      button.addEventListener("click", () => select(row.id));
      controls.push(button);
      container.append(button);
    });
  }
  rows.forEach(row => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mix-legend-row";
    button.dataset.category = row.id;
    const label = document.createElement("span");
    const swatch = document.createElement("i");
    swatch.style.background = row.color;
    label.append(swatch, document.createTextNode(row.label));
    button.append(label);
    for (const value of [row.workShare, row.carbonShare]) {
      const cell = document.createElement("strong");
      cell.textContent = pct(value);
      button.append(cell);
    }
    button.addEventListener("click", () => select(row.id));
    controls.push(button);
    document.querySelector("#mix-legend-rows").append(button);
  });
  text("#mix-priority-carbon", pct(rows[0].carbonShare));
  text("#mix-priority-work", pct(rows[0].workShare));
  text("#rail-current-coverage", pct(mix.railWaybills / mix.waybills * 100));
  text("#rail-current-count", `${number(mix.railWaybills)} of ${number(mix.waybills)} lane waybills`);
  text("#road-current-coverage", pct(mix.thirtyTWaybills / mix.waybills * 100));
  text("#road-current-count", `${number(mix.thirtyTWaybills)} of ${number(mix.waybills)} lane waybills`);
  text("#road-current-work", pct(rows.find(row => row.id === "thirty").workShare));
  text("#road-current-carbon", pct(rows.find(row => row.id === "thirty").carbonShare));
  controls.forEach(button => button.setAttribute("aria-pressed", "false"));
});
