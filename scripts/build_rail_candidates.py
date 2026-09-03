"""Read the private export and print anonymous, aggregate-only scenario inputs.

Usage: python3 scripts/build_rail_candidates.py /path/to/source.xlsx
Requires openpyxl for streaming read-only extraction. Never writes the source,
waybill identifiers, account identifiers, hashes of identifiers, or row records.
"""

import argparse
import hashlib
import json
import math
from decimal import Decimal

import openpyxl


def scaled(value):
    """The source reports transport work and kgCO2e to four decimal places."""
    return int(Decimal(str(value or 0)) * 10000)


def extract(source):
    workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
    bills = {}
    for row in workbook["0"].iter_rows(min_row=2, values_only=True):
        if not (
            str(row[0]).startswith("202605")
            and row[4] == "顺丰标快"
            and row[6] == "上海市"
            and row[7] == "北京市"
        ):
            continue
        bill = bills.setdefault(str(row[2]), {
            "type": row[5], "weight": scaled(row[3]), "chain": 0,
            "fuelRows": 0, "fuelKm": 0, "fuelTkm": 0, "fuelWtw": 0,
            "rail": False,
        })
        if row[8] != "包装":
            bill["chain"] += scaled(row[17])
        if row[8] != "运输":
            continue
        if "铁路" in str(row[10] or "") or "铁路" in str(row[12] or ""):
            bill["rail"] = True
        if row[10] == "燃油车":
            bill["fuelRows"] += 1
            bill["fuelKm"] += scaled(row[15])
            bill["fuelTkm"] += scaled(row[16])
            bill["fuelWtw"] += scaled(row[17])
    workbook.close()

    fuel_cohort = {key: b for key, b in bills.items() if b["type"] == "陆运件" and b["fuelRows"]}
    candidates = {key: b for key, b in fuel_cohort.items() if b["fuelKm"] >= 1000 * 10000 and not b["rail"]}
    assert candidates, "No candidates passed the screening rule"
    assert all(b["fuelRows"] == 1 for b in candidates.values()), "Review multiple fuel records per waybill before using this rule"
    assert all(b["fuelTkm"] > 0 and b["fuelWtw"] > 0 and b["weight"] > 0 for b in candidates.values()), "Review nonpositive candidate activity"

    # Fixed, emission-blind ordering: an illustrative historical selection,
    # not a claimed optimal allocation or an operationally approved list.
    ordered = sorted(candidates, key=lambda key: hashlib.sha256(("rail-screening-v1|" + key).encode()).digest())
    cumulative_tkm, cumulative_wtw = [0], [0]
    for key in ordered:
        cumulative_tkm.append(cumulative_tkm[-1] + candidates[key]["fuelTkm"])
        cumulative_wtw.append(cumulative_wtw[-1] + candidates[key]["fuelWtw"])
    curve = []
    for share in range(101):
        count = math.floor(len(ordered) * share / 100 + 0.5)
        curve.append([share, count, cumulative_tkm[count] / 10000, cumulative_wtw[count] / 10000])

    return {
        "schemaVersion": 1,
        "period": "May 2026",
        "lane": "Shanghai → Beijing",
        "service": "SF Standard Express",
        "laneWaybills": len(bills),
        "laneFootprintTonnes": sum(b["chain"] for b in bills.values()) / 10000000,
        "fuelRoadWaybills": len(fuel_cohort),
        "candidateWaybills": len(candidates),
        "minimumRecordedFuelRoadKm": 1000,
        "excludeRecordedRail": True,
        "candidateWeightKg": sum(b["weight"] for b in candidates.values()) / 10000,
        "candidateChainWtwKg": sum(b["chain"] for b in candidates.values()) / 10000,
        "targetRoadActivityTonneKm": cumulative_tkm[-1] / 10000,
        "targetRoadEmissionsKg": cumulative_wtw[-1] / 10000,
        "selectionMethod": "fixed-emission-blind-order-v1",
        "curveColumns": ["sharePercent", "selectedWaybills", "targetRoadTonneKm", "targetRoadWtwKg"],
        "curve": curve,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source")
    args = parser.parse_args()
    print(json.dumps(extract(args.source), ensure_ascii=False, separators=(",", ":")))
