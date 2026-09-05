# May transport composition and adoption

Verified read-only against the full `单票碳排放统计表_20260902235506 (1).xlsx` export on 2026-09-05. Reproduce the source-category totals and unique coverage counts with `scripts/audit_transport_mix.py`. The script prints anonymous aggregates only.

## Boundary

May 2026, Shanghai origin, Beijing destination, SF Standard Express, all waybill types within the account-linked export. Composition uses only `运输` rows, not pick-up, delivery or packaging. Every transport row is assigned once. Sum reported WTW emissions and tonne-km; percentages use their respective whole-lane transport totals. This differs from the former full-chain shipment-cohort comparison and the retained road-waybill-only intensity benchmarks.

| Exclusive source group | Transport work (tonne-km) | WTW (kgCO₂e) |
| --- | ---: | ---: |
| Fuel vehicle (unspecified) | 17,613.6221 | 13,667.9579 |
| 30T diesel | 17,979.5366 | 1,571.0033 |
| Other diesel | 3,304.7826 | 546.7817 |
| Rail | 26,602.3975 | 923.1632 |
| Other transport | 1,501.3676 | 567.0628 |
| Total | 67,001.7064 | 17,275.9689 |

`Fuel vehicle (unspecified)` maps exactly to source `燃油车`, energy `未知（平均）`. It is not a measured vehicle-size group and not the sum of all fuel vehicles. Other diesel contains 1T, 1.5T, 3T, 5T, 7T, 14T. Rail maps to `高铁/普列`. Other transport includes electric vehicles, 1.5T gasoline and freighter activity. Categories retain the source system's reported emissions and factor mapping; the high generic-category contribution does not by itself demonstrate inefficient physical operation. Factor mapping, route, loading, cost and service must be checked before deployment.

Transport WTW 17.2759689 tCO₂e plus non-transport/non-packaging WTW 0.0950974 tCO₂e reconciles to the unchanged full-chain lane baseline 17.3710663 tCO₂e. The first card no longer compares 365.5 g/kg for the whole lane with 841.7 g/kg for its generic-fuel shipment subset.

## Four-category presentation update

The table above preserves the source aggregates. For the client charts, combine unspecified fuel-vehicle records, other diesel and gasoline into `Fuel-road (excluding 30T diesel)`. Gasoline (1.5964 tonne-km, 0.3875 kgCO₂e) moves out of Other transport and is counted once in Fuel-road. Explicit 30T diesel records remain separate; vehicle size within unspecified records is not inferred.

| Display category | Tonne-km | WTW kgCO₂e | Work share | Emission share |
| --- | ---: | ---: | ---: | ---: |
| Fuel-road (excluding 30T diesel) | 20,920.0011 | 14,215.1271 | 31.2% | 82.3% |
| 30T diesel | 17,979.5366 | 1,571.0033 | 26.8% | 9.1% |
| Rail | 26,602.3975 | 923.1632 | 39.7% | 5.3% |
| Other transport: electric and air | 1,499.7712 | 566.6753 | 2.2% | 3.3% |

Merged component values remain in the data file for reconciliation. Scope, totals, current coverage and the two candidate scenarios are unchanged. The grouped priority describes the combined recorded footprint, not an assertion that every included vehicle is inefficient.

## Current coverage and scenarios

- Unique lane waybills: 45,888.
- At least one rail transport record: 17,772 / 45,888 = 38.7291%.
- At least one 30T diesel transport record: 14,191 / 45,888 = 30.9253%.
- Rail and 30T overlap in this export: zero unique waybills; coverage remains separately defined, not a universal mutually exclusive shipment classification.
- 30T work share of all lane transport: 26.8344%; transport emission share: 9.0936%. These use the same denominator as the new first card, not the former fuel-road-only denominator.
- Retained candidates: 13,879 rail-screened waybills and 13,843 30T-screened waybills. They are evaluation pools, not approved capacity. Existing 30T counts in the old road-waybill subset and the new complete lane need not be identical.
- Rail control still selects whole waybills using recorded activity. Scenario coverage = (current rail waybills + selected candidate waybills) / 45,888. Candidates exclude existing rail.
- 30T control still applies a uniform share to candidate transport work and its baseline emissions. It is now labeled as a work share, not a waybill share. Scenario 30T work share = (current whole-lane 30T tonne-km + selected candidate tonne-km) / whole-lane transport tonne-km. This assumes constant replacement transport work, matching the existing scenario model. No future 30T shipment count is inferred from the work percentage.
- Both reductions remain conditional individual scenario estimates. Their candidate pools can overlap, so reductions are not additive. Neither scenario is labeled best value or cheapest without operational cost and service evidence.

Display percentages are rounded to one decimal; underlying composition totals each equal 100%. No raw account or waybill identifiers are published.
