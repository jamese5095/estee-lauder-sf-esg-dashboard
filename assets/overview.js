document.addEventListener("DOMContentLoaded", () => {
  const data = window.ESTEE_DASHBOARD_DATA;
  const chart = document.querySelector("#month-chart");
  const metricButtons = Array.from(document.querySelectorAll("[data-metric]"));
  if (!data || !chart || !metricButtons.length) return;

  let activeMetric = "actual";
  let selectedIndex = 4;

  const format = (value, digits = 2) => Number(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  function updateDetail(index) {
    selectedIndex = index;
    const row = data.months[index];
    const displayedTotal = data.months.reduce((sum, month) => sum + month.actual, 0);
    setText("#selected-month", `${row.month} 2026`);
    setText("#selected-actual", format(row.actual));
    setText("#selected-share", `${format(row.actual / displayedTotal * 100)}%`);
    setText("#selected-avoided", `${format(row.avoided)} t`);
    setText("#selected-intensity", `${format(row.intensity)} g/pcs`);
    setText("#selected-volume", `${format(row.volume)} k pcs`);
    chart.querySelectorAll(".month-button").forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
  }

  function renderChart() {
    const metric = data.metrics[activeMetric];
    const values = data.months.map((month) => month[metric.field]);
    const maximum = Math.max(...values);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    chart.replaceChildren();
    chart.style.setProperty("--average-position", `calc(31px + ${(average / maximum) * 72}%)`);
    setText("#chart-metric-label", `${metric.label} · ${metric.unit}`);
    setText("#chart-average", `2026 average ${format(average)} ${metric.unit}`);

    data.months.forEach((month, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "month-button";
      button.setAttribute("aria-pressed", String(index === selectedIndex));
      button.setAttribute("aria-label", `${month.month} 2026, ${metric.label} ${format(month[metric.field])} ${metric.unit}`);

      const zone = document.createElement("span");
      zone.className = "bar-zone";
      const bar = document.createElement("i");
      bar.className = "month-bar";
      bar.style.height = `${Math.max(4, month[metric.field] / maximum * 88)}%`;
      zone.appendChild(bar);

      const label = document.createElement("span");
      label.className = "month-label";
      label.textContent = month.month;
      button.append(zone, label);
      button.addEventListener("pointerenter", () => updateDetail(index));
      button.addEventListener("focus", () => updateDetail(index));
      button.addEventListener("click", () => updateDetail(index));
      chart.appendChild(button);
    });
  }

  metricButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeMetric = button.dataset.metric;
      metricButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderChart();
      updateDetail(selectedIndex);
    });
  });

  renderChart();
  updateDetail(selectedIndex);
});
