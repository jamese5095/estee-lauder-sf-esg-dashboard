// May Shanghai–Beijing SF Standard Express; all waybill types, transport rows only.
// Source: full 20260902235506 export. Reproduce with scripts/audit_transport_mix.py.
// Categories are mutually exclusive activity records; coverage counts unique waybills.
window.ESTEE_TRANSPORT_MIX = {
  "period": "May 2026",
  "lane": "Shanghai → Beijing",
  "service": "SF Standard Express",
  "boundary": "Transport only",
  "waybills": 45888,
  "railWaybills": 17772,
  "thirtyTWaybills": 14191,
  "bothWaybills": 0,
  "totalActivityTonneKm": 67001.7064,
  "totalWtwKg": 17275.9689,
  "categories": [
    {
      "id": "fuel-road",
      "label": "Fuel-road (excluding 30T diesel)",
      "color": "#002c77",
      "detail": "Includes unspecified fuel-vehicle records, other diesel sizes and gasoline vehicles. Explicit 30T diesel records are separate.",
      "activityTonneKm": 20920.0011,
      "wtwKg": 14215.1271,
      "components": [
        { "label": "Unspecified fuel vehicle", "activityTonneKm": 17613.6221, "wtwKg": 13667.9579 },
        { "label": "Other diesel", "activityTonneKm": 3304.7826, "wtwKg": 546.7817 },
        { "label": "Gasoline", "activityTonneKm": 1.5964, "wtwKg": 0.3875 }
      ]
    },
    {
      "id": "thirty",
      "label": "30T diesel",
      "color": "#c8a45e",
      "detail": "Diesel vehicles recorded as 30T.",
      "activityTonneKm": 17979.5366,
      "wtwKg": 1571.0033
    },
    {
      "id": "rail",
      "label": "Rail",
      "color": "#2e695a",
      "detail": "High-speed and conventional rail.",
      "activityTonneKm": 26602.3975,
      "wtwKg": 923.1632
    },
    {
      "id": "other",
      "label": "Other transport",
      "color": "#b9bfca",
      "detail": "Electric vehicles and air.",
      "activityTonneKm": 1499.7712,
      "wtwKg": 566.6753
    }
  ]
};
