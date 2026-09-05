"""Read the private export; emit May lane aggregates only, never identifiers."""
import json
import sys
from collections import defaultdict
from decimal import Decimal
import openpyxl


def extract(path):
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    categories = defaultdict(lambda: {"activity": Decimal(0), "wtw": Decimal(0), "records": 0})
    bills, rail, thirty = set(), set(), set()
    chain = Decimal(0)
    for row in workbook["0"].iter_rows(min_row=2, values_only=True):
        if not (str(row[0]).startswith("202605") and row[4] == "顺丰标快" and row[6] == "上海市" and row[7] == "北京市"):
            continue
        bills.add(row[2])
        if row[8] != "包装":
            chain += Decimal(str(row[17] or 0))
        if row[8] != "运输":
            continue
        source, energy = str(row[10] or ""), str(row[12] or "")
        item = categories[source + " / " + energy]
        item["activity"] += Decimal(str(row[16] or 0))
        item["wtw"] += Decimal(str(row[17] or 0))
        item["records"] += 1
        if "铁路" in source or "铁路" in energy:
            rail.add(row[2])
        if "30T" in source.upper() and "柴油" in source:
            thirty.add(row[2])
    workbook.close()
    return {"waybills": len(bills), "railWaybills": len(rail), "thirtyTWaybills": len(thirty),
            "bothWaybills": len(rail & thirty), "chainWtwKg": float(chain),
            "sources": {key: {k: float(v) if isinstance(v, Decimal) else v for k, v in value.items()}
                        for key, value in categories.items()}}


if __name__ == "__main__":
    print(json.dumps(extract(sys.argv[1]), ensure_ascii=False, indent=2))
