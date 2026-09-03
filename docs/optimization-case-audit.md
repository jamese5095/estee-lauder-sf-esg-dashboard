# Shanghai–Beijing Optimization Case Audit

## Source scope

- Source workbook: `单票碳排放统计表_20260902235506 (1).xlsx`
- Source size: 408,204 data rows plus one header row
- Account inclusion rule: waybills recorded under the identified Estée Lauder monthly billing account IDs
- Case filter: May 2026, Shanghai origin, Beijing destination, SF Standard Express
- Emission boundary: WTW emissions from pick-up, transport and delivery rows; packaging rows excluded
- Waybill counts are deduplicated; weight and billed freight are counted once per unique waybill.
- No raw waybill IDs, account IDs, customer records or identifier hashes are published.

## Verified lane and context cohort

| Metric | May lane | Fuel-road context cohort |
| --- | ---: | ---: |
| Unique waybills | 45,888 | 16,149 |
| Shipment weight (kg) | 47,525.447 | 16,698.423 |
| Full-chain WTW emissions (kgCO₂e) | 17,371.0663 | 14,055.2260 |
| Weight-based WTW intensity (gCO₂e/kg) | 365.5108 | 841.7098 |

The context cohort contains land waybills with source `燃油车` (`Fuel vehicle`) on a transport record. It represents 35.1358% of lane weight and 80.9117% of lane WTW emissions. These context statistics describe the entire cohort, not just the narrower rail-screening pool below.

## Rail-screening candidate pool

All of the following conditions must hold:

1. Within the May Shanghai–Beijing SF Standard Express account-linked case scope.
2. Waybill type `陆运件`, with a `运输` record whose source is exactly `燃油车`.
3. The recorded distance for that source is at least 1,000 km.
4. No transport record for that waybill has a rail source or rail energy label.
5. Count each unique waybill once, regardless of its number of activity rows.

The 1,000 km threshold is a **case-specific analytical screening rule**, not a railway acceptance standard or proof of operational feasibility. This is a pool for evaluation, not an approved rail-ready shipment list.

| Metric | Verified screened pool |
| --- | ---: |
| Unique waybills | 13,879 |
| Excluded from the broader context cohort | 2,270 |
| Shipment weight | 14,222.245 kg |
| Full-chain WTW emissions | 13,742.1900 kgCO₂e |
| Targeted fuel-road transport work | 17,410.2116 tonne-km |
| Targeted fuel-road WTW emissions | 13,510.1328 kgCO₂e |

The source contains exactly one aggregated fuel-vehicle transport record per candidate waybill. Candidate weight, targeted tonne-km and targeted WTW emissions are positive for every candidate. Recorded distance belongs to the export's aggregated activity record; this does not establish a terminal-to-terminal rail itinerary.

The source category is a system classification, not a verified vehicle-size class. All generic fuel-vehicle records carry the energy label `未知（平均）` (unknown/average). Source/factor mapping must be checked during operational validation.

## Waybill-based interactive scenario

The slider uses **candidate waybill count**, not weight share or tonne-km share.

- For percentage `s`, select `round(13,879 × s / 100)` whole waybills.
- Fix the order once by SHA-256 of `rail-screening-v1|` followed by the waybill ID. The private IDs and ordering hashes never leave the extraction process.
- This is a reproducible, emission-blind illustrative historical selection. It does not rank by claimed feasibility, maximize savings, represent a booked rail capacity allocation, or predict which future shipments will be shifted.
- Larger percentages extend the same selection, rather than independently resampling.
- Sum the selected waybills' actual targeted transport work and source-reported WTW emissions.
- Publish only cumulative aggregate points at whole percentage increments. Adjacent points each add at least 138 waybills; no individual-waybill activity series is published.
- The client page offers 5–30% in 1% increments with 5/10/20/30% presets.

The slider's count percentage must **not** be multiplied by total candidate emissions or total candidate tonne-km. Different waybills have different weights and activity.

## Transport replacement and unit check

The rail transport intensity remains `0.0347023 kgCO₂e/tonne-km`, the source-derived rail-transport intensity retained from the May audit. It is not a shipment-chain intensity in gCO₂e/kg.

The rail/road distance ratio remains `1.0`, an equal-transport-work planning assumption. It is not an assertion that actual road and rail itineraries have equal distance.

For the selected waybills:

- `replacement rail kgCO₂e = selected target tonne-km × rail/road distance ratio × 0.0347023`
- `estimated reduction tCO₂e = (selected target road kgCO₂e − replacement rail kgCO₂e) / 1,000`
- `remaining lane tCO₂e = 17.3710663 − estimated reduction tCO₂e`

Only the selected generic fuel-vehicle transport records change. Pick-up, delivery, existing 30T and other vehicle activity, already-rail shipments, the unselected candidate waybills, and road shipments outside the screening pool remain unchanged.

| Slider | Selected waybills | Selected tonne-km | Selected road kgCO₂e | Estimated reduction tCO₂e | Remaining lane tCO₂e |
| --- | ---: | ---: | ---: | ---: | ---: |
| 5% | 694 | 859.0891 | 666.6444 | 0.64 | 16.73 |
| 10% | 1,388 | 1,745.4142 | 1,354.4224 | 1.29 | 16.08 |
| 17% | 2,359 | 2,961.5230 | 2,298.1096 | 2.20 | 15.18 |
| 20% | 2,776 | 3,506.8885 | 2,721.3061 | 2.60 | 14.77 |
| 30% | 4,164 | 5,301.6739 | 4,114.0414 | 3.93 | 13.44 |

Values are rounded for display only. Tests reconcile every percentage point to the unrounded baseline.

## Operational meaning and presentation

Outputs are technical scenario estimates, not implemented reductions or causal estimates. Delivery windows, rail capacity, cost viability, factor mapping, actual rail distance and terminal access must be confirmed before rollout. Any changed access activity must be included in a deployment-specific model.

The page presents the screened candidate count and definition, the count-based control, and estimated carbon impact. Auxiliary observed-rail counts, shipment-chain rail intensity and the old journey diagram have been removed.

## Reproduction

`scripts/build_rail_candidates.py` streams the private workbook read-only using openpyxl and prints aggregate JSON. Run it locally with the source path; do not commit the workbook. `data/rail-candidates.js` contains only the resulting anonymous metadata and cumulative scenario inputs. Browser calculations apply the rail factor and unit conversion in `assets/optimization.js`.

Run `node --test tests/optimization.test.cjs` to verify the pool, all 101 whole-percentage points, scenario formulas, preserved boundaries, page labels, and local asset links.
