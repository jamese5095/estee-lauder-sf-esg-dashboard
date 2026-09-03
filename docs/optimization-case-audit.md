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

## Observed rail pathway

May contains 17,772 rail waybills, 18,470.778 kg of unique shipment weight and 1,520.6051 kgCO₂e of full-chain WTW emissions. The observed rail-chain intensity is 82.3249 gCO₂e/kg, displayed as 82. This descriptive shipment-chain statistic is not used as the rail transport emission factor in the scenario.

## Targeted transport activity

Only transport rows whose recorded source is `燃油车` (`Fuel vehicle`) inside the high-impact cohort are targeted. The source is a system category, not a verified vehicle-size class; its energy label is `未知（平均）` (unknown/average).

| Input | Value | Role |
| --- | ---: | --- |
| Targeted road transport work | 17,423.449 tonne-km | Slider denominator |
| Targeted road WTW emissions | 13,520.4006 kgCO₂e | Source-reported emissions replaced proportionally |
| Observed rail transport intensity | 0.0347023 kgCO₂e/tonne-km | Replacement transport intensity |
| Rail / road distance ratio | 1.0 | Planning assumption: unchanged selected transport work |

The cohort includes 2,305 waybills with 30T transport rows. Their existing 30T emissions, all other vehicle rows, pick-up and delivery remain in the baseline. Cohort membership does not make those rows targets for replacement.

## Scenario unit check

For selected share `s` (5–30%, in 1% increments):

- Shifted road activity: `17,423.449 × s` tonne-km.
- Replaced road emissions: `13,520.4006 × s` kgCO₂e.
- Replacement rail emissions: `shifted activity × rail/road distance ratio × 0.0347023` kgCO₂e.
- Reduction: `(replaced road kgCO₂e − replacement rail kgCO₂e) / 1,000` tCO₂e.
- Remaining footprint: `17.3710663 − replaced road / 1,000 + replacement rail / 1,000` tCO₂e.

The share refers to targeted road transport work, not shipment count, shipment weight, all lane emissions or total cohort emissions. The observed 841.7 and 82.3 gCO₂e/kg full-chain statistics are not subtracted to calculate savings.

| Share | Estimated WTW reduction | Remaining lane WTW footprint |
| --- | ---: | ---: |
| 5% | 0.65 tCO₂e | 16.73 tCO₂e |
| 10% | 1.29 tCO₂e | 16.08 tCO₂e |
| 17% | 2.20 tCO₂e | 15.18 tCO₂e |
| 20% | 2.58 tCO₂e | 14.79 tCO₂e |
| 30% | 3.87 tCO₂e | 13.50 tCO₂e |

This is a technical activity-substitution scenario, not an implemented reduction or a causal estimate. Source-category / factor mapping, rail distance and terminal access, service windows, available capacity and cost require operational confirmation before activation. The equal-transport-work assumption does not establish that road and rail distances are equal in operation; changed distances and access legs must be included in a deployment-specific model. The client page labels outputs as estimated and keeps activation checks visible without presenting matching experiments.
