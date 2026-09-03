# Shanghai–Beijing Optimization Case Audit

## Source scope

- Source workbook: `单票碳排放统计表_20260902235506 (1).xlsx`
- Source size: 408,204 data rows plus one header row
- Account inclusion rule: waybills recorded under the identified Estée Lauder monthly billing account IDs
- Case filter: May–June 2026, Shanghai origin, Beijing destination, SF Standard Express
- Lane-emission boundary: WTW emissions from pick-up, transport and delivery rows; packaging rows excluded
- Transport-source analysis: transport rows only
- Waybill weight is counted once per unique waybill

## Verified lane totals

| Period | Unique waybills | Shipment weight | WTW emissions | Shipment intensity |
| --- | ---: | ---: | ---: | ---: |
| May 2026 | 45,888 | 47,525.447 kg | 17,371.0663 kgCO₂e | 365.5108 gCO₂e/kg |
| June 2026 | 32,067 | 31,920.530 kg | 12,123.5537 kgCO₂e | 379.8043 gCO₂e/kg |
| May–June | 77,955 | 79,445.977 kg | 29,494.6200 kgCO₂e | 371.2538 gCO₂e/kg |

The combined shipment-intensity calculation is:

`29,494.6200 kgCO₂e ÷ 79,445.977 kg × 1,000 = 371.2538 gCO₂e/kg`.

## Observed transport-source intensity

Transport-source intensity is calculated directly from transport-leg activity:

`transport-leg WTW kgCO₂e ÷ tonne-km = kgCO₂e/t·km`.

The dashboard displays the result as `gCO₂e/t·km`, so the calculated kg value is multiplied by 1,000.

| Recorded transport source | Source records | Tonne-km | WTW emissions | Dashboard intensity |
| --- | ---: | ---: | ---: | ---: |
| Fuel-powered road | 40,372 | 30,428.8064 | 23,612.4408 kgCO₂e | 776 gCO₂e/t·km |
| Diesel 1.5T | 14,361 | 506.0457 | 176.8312 kgCO₂e | 349 gCO₂e/t·km |
| Electric 1.5T | 59,379 | 1,994.2463 | 437.4576 kgCO₂e | 219 gCO₂e/t·km |
| Diesel 14T | 76,106 | 4,799.1089 | 690.8966 kgCO₂e | 144 gCO₂e/t·km |
| Diesel 30T | 22,356 | 28,235.7997 | 2,467.1636 kgCO₂e | 87 gCO₂e/t·km |
| Rail | 31,409 | 46,176.2084 | 1,602.4270 kgCO₂e | 35 gCO₂e/t·km |

The fuel-powered-road source contributes:

`23.6124408 tCO₂e ÷ 29.4946200 tCO₂e = 80.1%` of the lane's May–June WTW footprint.

Source-record counts describe transport rows, not mutually exclusive shipment cohorts. A waybill can contain more than one recorded transport source across its operating chain.

## Planning-scenario calculation

The visible scenario uses the actual fuel-powered-road transport activity as its baseline pool. The selected share is the only user-defined planning assumption.

- Assessed activity: `30,428.8064 tonne-km × selected share`
- Observed baseline intensity: `0.7759897 kgCO₂e/t·km`
- 30T-road target intensity: `0.0873771 kgCO₂e/t·km`
- Rail target intensity: `0.0347024 kgCO₂e/t·km`
- Indicative reduction: `assessed tonne-km × (baseline intensity − target intensity) ÷ 1,000 = tCO₂e`
- Remaining lane footprint: `29.4946200 tCO₂e − indicative reduction`

### Verified scenario outputs

| Pathway | Assessed share | Assessed activity | Indicative reduction | Remaining footprint | Lane-level reduction |
| --- | ---: | ---: | ---: | ---: | ---: |
| Consolidated 30T road | 10% | 3,042.8806 t·km | 2.095366 tCO₂e | 27.399254 tCO₂e | 7.1042% |
| Scheduled rail | 10% | 3,042.8806 t·km | 2.255649 tCO₂e | 27.238971 tCO₂e | 7.6477% |
| Consolidated 30T road | 30% | 9,128.6419 t·km | 6.286098 tCO₂e | 23.208522 tCO₂e | 21.3127% |
| Scheduled rail | 30% | 9,128.6419 t·km | 6.766946 tCO₂e | 22.727674 tCO₂e | 22.9430% |

The scenario is a technical planning estimate. Service promise, departure capacity and total logistics cost remain operating gates before an implementation case is finalized.
