"""python3 -m unittest test_merge_exports   (run in this folder)"""
import csv, subprocess, sys, tempfile, unittest
from decimal import Decimal
from pathlib import Path
import merge_exports as m

HERE = Path(__file__).resolve().parent


class MergeTest(unittest.TestCase):
    def test_parsers(self):
        self.assertEqual(m.parse_date("07/15/2026"), "2026-07-15")
        self.assertEqual(m.parse_date("12 Aug 2026"), "2026-08-12")
        self.assertEqual(m.parse_date("Sep 18, 2026"), "2026-09-18")
        self.assertIsNone(m.parse_date("2026-09-31"))
        self.assertEqual(m.parse_amount("$1,045.50"), Decimal("1045.50"))
        self.assertEqual(m.parse_amount("(25.00)"), Decimal("-25.00"))
        self.assertIsNone(m.parse_amount("$12.345"))
        self.assertIsNone(m.parse_amount("twelve dollars"))
        self.assertEqual(m.map_headers(["Order #", "Created", "Client", "Amount USD"]),
                         {"order_id": "Order #", "date": "Created", "customer": "Client", "amount": "Amount USD"})

    def test_sample_run(self):
        with tempfile.TemporaryDirectory() as t:
            out, exc = Path(t) / "merged.csv", Path(t) / "exceptions.csv"
            r = subprocess.run([sys.executable, str(HERE / "merge_exports.py"), str(HERE / "exports"), "--out", str(out), "--exceptions", str(exc)],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            rows = list(csv.DictReader(out.open()))
            self.assertEqual(len(rows), 9)
            self.assertEqual(sum(Decimal(x["amount"]) for x in rows), Decimal("3877.83"))
            self.assertEqual(next(x for x in rows if x["order_id"] == "A-1004")["amount"], "305.00")   # later export wins
            reasons = [x["reason"] for x in csv.DictReader(exc.open())]
            self.assertEqual(len(reasons), 5)
            self.assertTrue(any(x.startswith("duplicate") for x in reasons))

    def test_missing_column_reported_not_crash(self):
        with tempfile.TemporaryDirectory() as t:
            (Path(t) / "bad.csv").write_text("foo,bar\n1,2\n")
            files, rows, exceptions, dups = m.merge(Path(t))
            self.assertEqual(rows, [])
            self.assertIn("missing column", exceptions[0]["reason"])


if __name__ == "__main__":
    unittest.main()
