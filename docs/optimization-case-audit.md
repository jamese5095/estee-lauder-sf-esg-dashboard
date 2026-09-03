# Shanghai–Beijing Optimization Case Audit

## Source scope

- Source workbook: `单票碳排放统计表_20260902235506 (1).xlsx`
- Source size: 408,204 data rows plus one header row
- Account inclusion rule: waybills recorded under the identified Estée Lauder monthly billing account IDs
- Case filter: May 2026, Shanghai origin, Beijing destination, SF Standard Express
- Emission boundary: WTW emissions from pick-up, transport and delivery rows; packaging rows excluded
- Waybill weight and billed freight are counted once per unique waybill

## Verified lane totals

| Metric | Source-unit result | Dashboard display |
| --- | ---: | ---: |
| Unique waybills | 45,888 | 45,888 |
| Shipment weight | 47,525.447 kg | 47.53 tonnes |
| WTW emissions | 17,371.0663 kgCO₂e | 17.37 tCO₂e |
| Weight-based WTW intensity | 365.5108 gCO₂e/kg | 365.5 gCO₂e/kg |

The intensity calculation is `17,371.0663 kgCO₂e ÷ 47,525.447 kg × 1,000`.

## Verified high-impact cohort

The cohort contains land waybills with a `Fuel vehicle` source recorded on a transport leg. Its WTW footprint includes the complete non-packaging transport chain for each selected waybill.

| Metric | Verified result |
| --- | ---: |
| Unique waybills | 16,149 |
| Shipment weight | 16,698.423 kg |
| WTW emissions | 14,055.2260 kgCO₂e |
| Share of lane weight | 35.1358% |
| Share of lane WTW emissions | 80.9117% |
| WTW intensity | 841.7098 gCO₂e/kg |

## Observed operating pathways

The client-facing page uses the observed full-chain WTW intensity of two operating pathways. Comparison-matching mechanics are retained outside the presentation layer.

| Operating pathway | Observed waybills | Shipment weight | WTW intensity |
| --- | ---: | ---: | ---: |
| High-capacity 30T road | 14,191 | 14,663.774 kg | 125.9253 gCO₂e/kg |
| Rail-supported routing | 17,772 | 18,470.778 kg | 82.3249 gCO₂e/kg |

## Scenario unit check

- Activated weight: `candidate kg × selected share`
- WTW reduction: `activated kg × (fuel-road cohort intensity − observed pathway intensity) ÷ 1,000,000 = tCO₂e`
- Optimized footprint: `lane tCO₂e − modeled reduction tCO₂e`
- Optimized lane intensity: `optimized tCO₂e × 1,000,000 ÷ lane kg = gCO₂e/kg`

At the default 10% road scenario, 1.6698 tonnes of candidate weight produces a modeled 1.1952 tCO₂e reduction, a 16.1758 tCO₂e optimized footprint and 340.3612 gCO₂e/kg optimized lane intensity.
