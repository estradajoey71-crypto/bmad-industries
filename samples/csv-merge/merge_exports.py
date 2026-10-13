#!/usr/bin/env python3
"""Merge monthly order exports into one clean CSV.            (BMAD Industries sample: Quick Fix package)

    python3 merge_exports.py exports/ --out merged.csv --exceptions exceptions.csv

What it does, the same way every time:
  - reads every .csv in the folder (any column order; header names matched case- and space-insensitively,
    with common aliases: "Order #", "order id", "OrderID" ...)
  - dates in 2026-01-31, 01/31/2026 or 31 Jan 2026 form become 2026-01-31
  - amounts like "$1,234.50" become 1234.50 (exact decimal arithmetic, never floating point)
  - the same order appearing in two exports is kept once (the later export wins) and reported
  - rows it cannot trust (no order id, unreadable date or amount) go to the exceptions file with the reason,
    never silently dropped
Standard library only (Python 3.9+). No internet, no accounts.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

COLUMNS = ["order_id", "date", "customer", "amount"]
ALIASES = {   # header names compared as lowercase letters and digits only: "Order #" -> "order", "Amount USD" -> "amountusd"
    "order_id": {"orderid", "order", "ordernumber", "orderno", "id"},
    "date": {"date", "orderdate", "created", "createdat"},
    "customer": {"customer", "customername", "name", "client"},
    "amount": {"amount", "total", "ordertotal", "amountusd", "price"},
}
DATE_FORMATS = ["%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y", "%d %b %Y", "%b %d, %Y"]


def key(header: str) -> str:
    return "".join(ch for ch in header.lower() if ch.isalnum())


def map_headers(headers: list[str]) -> dict[str, str]:
    found = {}
    for h in headers:
        for col, names in ALIASES.items():
            if key(h) in names:
                found.setdefault(col, h)
    return found


def parse_date(text: str) -> str | None:
    text = text.strip()
    for f in DATE_FORMATS:
        try:
            return dt.datetime.strptime(text, f).date().isoformat()
        except ValueError:
            pass
    return None


def parse_amount(text: str) -> Decimal | None:
    t = text.strip().replace("$", "").replace(",", "")
    negative = t.startswith("(") and t.endswith(")")
    t = t.strip("()")
    try:
        value = Decimal(t)
    except InvalidOperation:
        return None
    if value.as_tuple().exponent < -2:
        return None
    return -value if negative else value


def merge(folder: Path):
    rows, exceptions, duplicates = {}, [], []
    files = sorted(p for p in folder.glob("*.csv"))
    if not files:
        raise SystemExit(f"no .csv files in {folder}")
    for f in files:
        with f.open(newline="", encoding="utf-8-sig") as fh:
            reader = csv.DictReader(fh)
            cols = map_headers(reader.fieldnames or [])
            missing = [c for c in COLUMNS if c not in cols]
            if missing:
                exceptions.append({"file": f.name, "line": 1, "order_id": "", "reason": f"missing column(s): {', '.join(missing)}"})
                continue
            for n, raw in enumerate(reader, start=2):
                oid = (raw.get(cols["order_id"]) or "").strip()
                date = parse_date(raw.get(cols["date"]) or "")
                amount = parse_amount(raw.get(cols["amount"]) or "")
                reason = ("no order id" if not oid else "unreadable date: " + repr(raw.get(cols["date"])) if not date
                          else "unreadable amount: " + repr(raw.get(cols["amount"])) if amount is None else "")
                if reason:
                    exceptions.append({"file": f.name, "line": n, "order_id": oid, "reason": reason})
                    continue
                if oid in rows:
                    duplicates.append((oid, rows[oid]["_file"], f.name))
                rows[oid] = {"order_id": oid, "date": date, "customer": (raw.get(cols["customer"]) or "").strip(),
                             "amount": f"{amount:.2f}", "_file": f.name}
    return files, sorted(rows.values(), key=lambda r: (r["date"], r["order_id"])), exceptions, duplicates


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", type=Path)
    ap.add_argument("--out", type=Path, default=Path("merged.csv"))
    ap.add_argument("--exceptions", type=Path, default=Path("exceptions.csv"))
    a = ap.parse_args(argv)
    files, rows, exceptions, duplicates = merge(a.folder)
    with a.out.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS + ["source_file"])
        w.writeheader()
        for r in rows:
            w.writerow({**{c: r[c] for c in COLUMNS}, "source_file": r["_file"]})
    with a.exceptions.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["file", "line", "order_id", "reason"])
        w.writeheader()
        w.writerows(exceptions)
        for oid, first, later in duplicates:
            w.writerow({"file": later, "line": "", "order_id": oid, "reason": f"duplicate of the row in {first}; kept the later export"})
    total = sum(Decimal(r["amount"]) for r in rows)
    print(f"{len(files)} files → {len(rows)} orders, total ${total:,.2f}; "
          f"{len(exceptions)} rows rejected, {len(duplicates)} duplicates resolved (see {a.exceptions})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
