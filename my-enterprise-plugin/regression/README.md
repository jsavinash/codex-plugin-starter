# Regression fixtures

`golden_prompts.json` contains deterministic policy scenarios, not a model-output evaluation suite. Capture tool outputs into a JSON object keyed by case ID and score it with `python3 regression/eval_metrics.py actual.json`. Do not include sensitive production prompts or outputs in fixtures.
