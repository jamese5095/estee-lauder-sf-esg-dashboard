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

## Matched historical comparisons

Candidate and comparison waybills are grouped into exact shipment-date and shipment-weight strata. Each stratum contributes the smaller observation count from the two groups; group-average emissions and billed freight are used within the stratum to avoid arbitrary waybill selection. The 30T-road comparison uses mutually exclusive land waybills with a 30T diesel transport source and no generic fuel-vehicle source. The rail comparison uses rail waybills.

| Comparison | Matched pairs | Baseline intensity | Target intensity | Intensity improvement | Billed-freight delta |
| --- | ---: | ---: | ---: | ---: | ---: |
| 30T diesel road | 5,756 | 756.6214 gCO₂e/kg | 123.2361 gCO₂e/kg | 83.7123% | +0.0238% |
| Rail | 7,237 | 761.2846 gCO₂e/kg | 82.2912 gCO₂e/kg | 89.1905% | +0.0380% |

## Scenario unit check

- Activated weight: `candidate kg × selected share`
- WTW reduction: `activated kg × intensity delta gCO₂e/kg ÷ 1,000,000 = tCO₂e`
- Optimized footprint: `lane tCO₂e − modeled reduction tCO₂e`
- Optimized lane intensity: `optimized tCO₂e × 1,000,000 ÷ lane kg = gCO₂e/kg`

At the default 10% road scenario, 1.6698 tonnes of candidate weight produces a modeled 1.0577 tCO₂e reduction, a 16.3134 tCO₂e optimized footprint and 343.2564 gCO₂e/kg optimized lane intensity.
