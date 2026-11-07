#!/usr/bin/env python3
"""Score deterministic helper outputs against a small expected-substring set."""

import argparse
import json
from pathlib import Path
from typing import Any


def score(expected_path: Path, actual_path: Path) -> dict[str, Any]:
    expected = json.loads(expected_path.read_text(encoding="utf-8"))
    actual = json.loads(actual_path.read_text(encoding="utf-8"))
    cases = expected.get("cases")
    if not isinstance(cases, list) or not isinstance(actual, dict):
        raise ValueError("expected cases array and actual result object keyed by case id")
    results = []
    for case in cases:
        case_id = case["id"]
        output = actual.get(case_id)
        needle = case.get("expected_contains")
        passed = isinstance(output, str) and isinstance(needle, str) and needle.lower() in output.lower()
        results.append({"id": case_id, "passed": passed})
    total = len(results)
    passed = sum(1 for result in results if result["passed"])
    return {"passed": passed, "total": total, "pass_rate": passed / total if total else 1.0, "cases": results}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("actual", type=Path, help="JSON map of test case IDs to captured helper output")
    parser.add_argument("--expected", type=Path, default=Path(__file__).with_name("golden_prompts.json"))
    args = parser.parse_args()
    try:
        result = score(args.expected, args.actual)
        print(json.dumps(result, indent=2))
        return 0 if result["passed"] == result["total"] else 1
    except (OSError, json.JSONDecodeError, ValueError, KeyError) as error:
        parser.error(str(error))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
