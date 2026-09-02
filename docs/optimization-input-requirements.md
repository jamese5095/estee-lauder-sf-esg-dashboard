# Optimization Estimate — Data & Factor Request

## Output to be calculated

For each selected SF intervention, the dashboard will calculate:

- Estimated emissions reduction (tCO₂e)
- Estimated reduction as a percentage of the current SF Express footprint
- Optimized SF Express footprint: `1,063.07 tCO₂e − estimated reduction`
- Optimized carbon intensity: `optimized tCO₂e × 1,000,000 ÷ scenario shipment pieces`
- Operational effects: cost, distance, trips and SLA change where available

Combined scenarios must be checked for overlap before their reductions are added together.

## Common activity fields

Preferred structure: one row per waybill and transport leg. A lane-month aggregate is acceptable for initial screening.

| Field | Unit / format | Why it is needed |
| --- | --- | --- |
| Shipment or lane ID | Text | Traceability and duplicate control |
| Shipment month | YYYY-MM | Alignment with the Jan–Jul reporting period |
| Origin and destination | City / site code | Lane definition |
| Origin, transfer and destination nodes | Site code | Network-path reconstruction |
| Transport leg | Pick-up / line-haul / delivery | Prevents double counting |
| Current transport mode | Road / rail / air / sea | Selects the current emission factor |
| Actual cargo weight | kg | Converts distance into tonne-km |
| Chargeable weight | kg, if used | Reconciles SF operating records |
| Distance by leg | km | Calculates tonne-km or vehicle-km |
| Shipment pieces | pcs | Recalculates carbon intensity |
| Vehicle or equipment type | Class / capacity | Selects vehicle-specific factors |
| Fuel or energy type | Diesel / gasoline / electricity, etc. | Selects energy factors |
| Current load factor | % | Models consolidation and fleet efficiency |
| Service product and SLA | Product / promised hours | Tests whether the alternative is feasible |
| Actual transit time | Hours | Establishes current service performance |
| Current transport cost | CNY | Quantifies commercial impact |

## Emission-factor fields

Every factor should include its numeric value and metadata. Current and target factors must use comparable boundaries.

| Factor field | Preferred unit | Required metadata |
| --- | --- | --- |
| Road freight factor | kgCO₂e/t-km or kgCO₂e/vehicle-km | Vehicle class, fuel, load assumption |
| Rail freight factor | kgCO₂e/t-km | Traction type and geography |
| Sea freight factor | kgCO₂e/t-km | Vessel/service type if relevant |
| Fuel factor | kgCO₂e/litre or kgCO₂e/kg | Fuel grade and lifecycle boundary |
| Electricity-grid factor | kgCO₂e/kWh | Province/region and year |
| NEV energy consumption | kWh/km | Vehicle class, duty cycle and payload |
| Charging loss | % | Charging and battery-system assumption |

For every factor, record: source organization, publication name, version/year, geography, unit, lifecycle boundary (for example TTW or WTW), GWP basis and access link. Do not mix TTW and WTW factors within one comparison.

## P1 — Road-to-Rail / Sea Shift

### Minimum data

- Eligible road lane, cargo weight and current road distance
- Alternative rail/sea distance plus first- and last-mile road distance
- Current road and target-mode emission factors
- Shiftable shipment share and expected adoption share
- Current and target SLA, capacity, departure frequency and cost

### Preferred formula

`Current = cargo tonnes × road km × road EF`

`Target = cargo tonnes × [(rail/sea km × target EF) + (first/last-mile road km × road EF)]`

`Estimated reduction = eligible adoption share × (Current − Target)`

## P2 — Network Node Consolidation

### Minimum data

- Current OD path, transfer nodes and distance by leg
- Current trips or vehicle-km by vehicle type
- Cargo weight, vehicle capacity and load factor
- Proposed node/path design and expected consolidated trips
- Current and proposed cost and SLA
- Vehicle-km or fuel/energy emission factor for each vehicle class

### Preferred formula

`Estimated reduction = current network emissions − optimized network emissions`

For load and trip consolidation, calculate each network as `vehicle-km × vehicle emission factor`. Use a tonne-km model only when the selected factor explicitly reflects the relevant load assumptions.

## P3 — Urban NEV Fleet

### Minimum data

- Pick-up and delivery vehicle-km by city and vehicle class
- Current fuel type and litres/km or verified current vehicle factor
- NEV kWh/km under a comparable payload and duty cycle
- Regional electricity-grid factor and charging loss
- Eligible vehicle share, rollout/adoption share and operating days
- Vehicle capacity, route length, charging feasibility, cost and SLA

### Preferred formula

`Current = eligible vehicle-km × current ICE factor`

`Target = eligible vehicle-km × NEV kWh/km × grid EF × (1 + charging loss)`

`Estimated reduction = adoption share × (Current − Target)`

## Recommended first collection

Start with P1. It can produce the fastest defensible estimate if the following six items are available at lane level: cargo weight, current road distance, alternative-mode route distance, road factor, rail/sea factor, and eligible adoption share under the agreed SLA.
