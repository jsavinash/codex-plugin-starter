# My Enterprise Plugin

A local-first Codex plugin package with reusable developer workflows, a read-only stdio MCP server, and local policy/audit helpers. It is a development scaffold, not a compliance product or enterprise enforcement plane.

## What it provides

- **Skills:** preflight, incident runbook, and build handoff workflows in `skills/`.
- **MCP tools:** `agents/patch-agent/runtime.js` exposes local tools for redaction, command checks, declared residency checks, estimate checks, advisory routing, and Bloom-filter lookups. It makes no network requests and does not run shell commands.
- **Command hook:** `hooks/command_policy.js` checks matching Bash tool calls against configured deny patterns. Patterns are heuristics and are not a complete shell parser.
- **Audit helper:** `telemetry/audit_logger.js` can write minimal redacted hook metadata under `PLUGIN_DATA`, HMAC-signed when the trusted hook process has `ENTERPRISE_AUDIT_HMAC_KEY`. This does not capture every model/tool action or make records immutable.
- **Policy helpers:** `policies/`, `sovereignty/`, `monetization/`, and `routing/` contain local sample JSON and utilities. They evaluate supplied input; they do not route real model requests, verify provider region, read billing, or enforce hard limits.
- **Tests and fixtures:** `tests/` covers MCP and utility behavior; `regression/` contains deterministic policy cases and a scorer. `chaos/` provides test-only deterministic fault simulations.
- **Additional contracts:** `auth/`, `telemetry/`, `sync/`, `memory/`, `state/`, `cache/`, `certificates/`, `locales/`, and `ui/` contain code, schema examples, or templates. Codex does not automatically activate arbitrary folders.

For a folder-by-folder assignment to **enterprise**, **personal**, and **code repository** levels, see [OWNERSHIP_AND_DEPLOYMENT_LEVELS.md](documentation/OWNERSHIP_AND_DEPLOYMENT_LEVELS.md) and the concise [structure level mapping](documentation/STRUCTURE_LEVEL_MAPPING.md). The core architecture and security boundaries are in [ARCHITECTURE.md](documentation/ARCHITECTURE.md), with additional [research notes](documentation/RESEARCH.md) and [troubleshooting](documentation/TROUBLESHOOTING.md).

## Package layout

```text
my-enterprise-plugin/
├── plugin.json                 # Portable manifest and Codex extension settings
├── mcp.json                    # Local stdio MCP server launch configuration
├── hooks.json                  # Supported local Codex hook definitions
├── agents/                     # MCP server and deploy preflight helper
├── skills/                     # Three reusable workflow skills
├── hooks/                      # Command policy hook
├── policies/                   # Safe local rules and policy helper
├── routing/                    # Advisory route/throttle helpers and examples
├── sovereignty/                # Declared-region check and sample policy
├── monetization/               # Estimate checker and sample ledgers/caps
├── auth/                       # Credential-name contract; no secret values
├── telemetry/                  # Local HMAC audit helper; exporter disabled
├── memory/ and state/          # Algorithms and empty/schema examples
├── sync/ and cache/            # Sync/filter code and empty cache area
├── chaos/ and regression/      # Test fixtures and evaluation helpers
├── certificates/               # Guidance; no CA or private key
├── documentation/              # Architecture, ownership, research, operations
├── assets/, locales/, ui/      # Icon, translations, and static UI example
├── tests/                      # Node regression tests
└── dist/                       # Ignored generated archive output
```

`plugin.json`, `mcp.json`, `skills/`, and the declared hook configuration are package components. Other folders only do work when the bundled code explicitly reads them. Codex hooks use events such as `PreToolUse` and `PostToolUse`; `PreCommit` and `OnBuildFailure` are not Codex hook event names. See the [plugin packaging guide](https://developers.openai.com/plugins/build/plugins) and [Codex hooks guide](https://developers.openai.com/codex/hooks).

## Run locally

Requirements: Node.js 18+ and Python 3.11+ for the included test and helper scripts.

```sh
cd my-enterprise-plugin

# Run automated tests
node --test tests/*.test.mjs

# Score captured outputs against deterministic policy cases
python3 regression/eval_metrics.py actual.json

# Try local helpers
printf '{"dataRegion":"EU","processingRegion":"US"}' | node sovereignty/check_residency.js
printf '{"costCenter":"engineering","estimateUsd":2.50}' | node monetization/check_budget.js
printf '{"taskType":"patch","region":"EU"}' | node routing/resolve.js

# Rebuild the empty Bloom filter (no indicators are included)
python3 sync/build_bloom_filter.py
```

The Bloom filter is format-valid but empty. Populate it only from a trusted, reviewed feed; Bloom positives can be false positives and require confirmation against the source feed.

## Installation and marketplace

The marketplace catalog is separate from the plugin package. For personal use, add a catalog entry in `~/.agents/plugins/marketplace.json`; for a shared repository, use that repository's `.agents/plugins/marketplace.json`. Set `source.path` relative to the marketplace root and point it at this folder. Codex may need a marketplace refresh/restart before the plugin appears. See [local marketplace guidance](https://developers.openai.com/plugins/build/plugins#build-your-own-curated-plugin-list).

Because this plugin includes a local stdio MCP server and lifecycle hooks, it requires a local execution host and user trust/review. Hooks and local policy helpers are defense in depth; rely on Codex sandboxing, managed policy, OS controls, and server-side authorization for enforcement. The package does not include enterprise credentials, a corporate CA, private signing keys, a threat feed, a vector database, or an OTLP exporter.
