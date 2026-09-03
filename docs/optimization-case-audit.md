# Shanghai–Beijing Optimization Case Audit

## Source scope

- Source workbook: `单票碳排放统计表_20260902235506 (1).xlsx`
- Full source size: 408,204 data rows plus one header row
- Case filter: May 2026, Shanghai origin, Beijing destination, SF Standard Express
- Account inclusion rule: waybills recorded under the identified Estée Lauder monthly billing account IDs
- Lane-emission boundary: WTW emissions from pick-up, transport and delivery rows; packaging rows excluded
- Waybill weight is counted once per unique waybill

## May lane baseline

| Metric | Verified result | Dashboard display |
| --- | ---: | ---: |
| Unique waybills | 45,888 | 45,888 |
| Shipment weight | 47,525.447 kg | 47.53 tonnes |
| WTW emissions | 17,371.0663 kgCO₂e | 17.37 tCO₂e |
| Shipment intensity | 365.5108 gCO₂e/kg | not displayed on Optimization |

## Fuel-road cohort

The cohort contains May land waybills with a `Fuel vehicle` source recorded on a transport leg. Its footprint includes each selected waybill's complete non-packaging chain.

| Metric | Verified result | Dashboard display |
| --- | ---: | ---: |
| Unique waybills | 16,149 | 16,149 |
| Shipment weight | 16,698.423 kg | 16.70 tonnes |
| Full-chain WTW emissions | 14,055.2260 kgCO₂e | 14.06 tCO₂e |
| Share of lane weight | 35.1358% | 35.1% |
| Share of lane WTW emissions | 80.9117% | 80.9% |

## Transport-source mix inside the cohort

This view uses transport rows belonging to the cohort. WTW share is each source's portion of the cohort's transport-leg WTW emissions. Intensity is calculated as:

`transport WTW kgCO₂e ÷ tonne-km × 1,000 = gCO₂e/t·km`.

| Recorded source | Transport WTW share | WTW intensity |
| --- | ---: | ---: |
| Main fuel-road leg | 96.4267% | 775.99 gCO₂e/t·km |
| Diesel 30T | 1.8721% | 87.38 gCO₂e/t·km |
| Diesel 14T | 0.7811% | 143.97 gCO₂e/t·km |
| Electric 1.5T | 0.6060% | 219.35 gCO₂e/t·km |
| Diesel 1.5T | 0.2082% | 349.42 gCO₂e/t·km |

The five displayed sources represent 99.8941% of the cohort's transport WTW emissions. Display values are rounded for client readability.

## Planning scenario

The estimate applies an eligible share to the May main fuel-road transport activity:

- Observed activity: `17,423.449 tonne-km`
- Observed fuel-road intensity: `0.7759879 kgCO₂e/t·km`
- Consolidated 30T-road intensity: `0.0873773 kgCO₂e/t·km`
- Scheduled-rail intensity: `0.0347023 kgCO₂e/t·km`
- Reduction: `observed activity × eligible share × (fuel-road intensity − selected-path intensity) ÷ 1,000`

### Verified dashboard outputs

| Eligible share | Consolidated 30T road | Scheduled rail |
| --- | ---: | ---: |
| 5% | 0.5999 tCO₂e | 0.6458 tCO₂e |
| 10% | 1.1998 tCO₂e | 1.2916 tCO₂e |
| 20% | 2.3996 tCO₂e | 2.5832 tCO₂e |
| 30% | 3.5994 tCO₂e | 3.8747 tCO₂e |

The eligible share is a planning input: the portion of observed May fuel-road tonne-km that passes SLA, capacity and cost checks. The displayed output is therefore a technical WTW reduction estimate, not an implemented result.
