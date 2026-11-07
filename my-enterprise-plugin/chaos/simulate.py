#!/usr/bin/env python3
"""Produce deterministic test-only fault decisions; never calls an API."""

import argparse
import json
from pathlib import Path


def simulate(scenario_id: str) -> dict:
    root = Path(__file__).resolve().parent
    failure = json.loads((root / "failure_modes.json").read_text(encoding="utf-8"))
    rate_limit = json.loads((root / "rate_limit_mock.json").read_text(encoding="utf-8"))
    for scenario in failure["scenarios"]:
        if scenario["id"] == scenario_id:
            return {"enabled": failure["enabled"], "scope": failure["scope"], "scenario": scenario, "injected": False}
    if scenario_id == "rate-limit":
        return {"enabled": rate_limit["enabled"], "scope": rate_limit["scope"], "scenario": rate_limit, "injected": False}
    raise ValueError(f"unknown scenario: {scenario_id}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scenario", help="scenario id from failure_modes.json or rate-limit")
    args = parser.parse_args()
    try:
        print(json.dumps(simulate(args.scenario), indent=2))
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as error:
        parser.error(str(error))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
