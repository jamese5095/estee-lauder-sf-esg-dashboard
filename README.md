# Estée Lauder × SF Scope 3 Carbon Decision Platform

An English-language, multi-page static web project for presenting Estée Lauder's 2026 logistics carbon footprint and SF Supply Chain's decarbonization methodology.

## Live demo

[Open the GitHub Pages site](https://jamese5095.github.io/estee-lauder-sf-esg-dashboard/)

## Product structure

- `index.html` — client-facing project portal and decision journey.
- `overview.html` — interactive Jan–Jul SF transport footprint.
- `drivers.html` — source mix, city and transport-mode concentration analysis.
- `optimization.html` — single-path Shanghai-to-Beijing rail-shift case with an interactive carbon-impact scenario.
- `methodology.html` — formulae, SF data lineage, scenario requirements and the full method library.
- `assets/site.css` — shared Estée Lauder-inspired visual system and responsive layout.
- `assets/site.js` — shared navigation behavior.
- `assets/overview.js` — monthly metric and selected-month interaction.
- `assets/optimization.js` — whole-waybill rail-shift selection and interactive carbon-impact calculation.
- `assets/sf-logo.png` — local SF logo asset used by the Ecco dashboard project.
- `data/dashboard-data.js` — centralized 2026 dashboard data and fifteen-method model.
- `data/rail-candidates.js` — anonymous cumulative activity inputs for 13,879 screened May waybills.
- `scripts/build_rail_candidates.py` — read-only private-workbook extraction; outputs aggregate JSON only.
- `docs/` — source records plus the optimization data and emission-factor request.

## Data principles

- Only 2026 data are presented.
- The reporting population consists of SF waybills recorded under the identified Estée Lauder monthly billing account IDs.
- Origin and destination are attributed from the corresponding waybill fields; warehouse location does not determine inclusion.
- The Footprint view covers Jan–Jul 2026; Drivers retains the three-source mix for context.
- Actual/reported, calculated/derived and scenario/modeled values remain distinct.
- Optimization screens 13,879 unique May Shanghai–Beijing fuel-road waybills with recorded fuel-road distance ≥1,000 km and no recorded rail transport. This case-specific candidate screen is separate from operational approval.
- The slider selects whole waybills in a fixed emission-blind order, then sums their recorded targeted activity. Waybill share is not treated as activity or emission share.
- Only selected `Fuel vehicle` transport records change; existing 30T, other road, rail, pick-up and delivery emissions remain in the baseline. Rail replacement uses a transport-work emission factor and an explicit equal-distance planning assumption, not full-chain shipment intensity.
- The Footprint chart shows monthly actual emissions; selected-month detail retains carbon intensity and shipment volume for context.
- Missing 3PL and CN intensity data are shown as unavailable, not zero.
- Monthly SF values total 1,063.06 tCO₂e at two decimal places, while the source aggregate is 1,063.07 tCO₂e due to source rounding.

## Local preview

Run from this directory:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

The project has no runtime dependencies and is published directly from the `main` branch through GitHub Pages.

Run the rail scenario checks with `node --test tests/optimization.test.cjs`.
