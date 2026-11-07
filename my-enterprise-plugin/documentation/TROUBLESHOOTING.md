# Troubleshooting

## Plugin does not load

- Confirm the package root contains `plugin.json`, `mcp.json`, and `skills/*/SKILL.md`.
- This sample uses a local stdio server and local hooks, so use a local Codex desktop environment. Local MCP plugin submission is restricted; this package is not ready for public directory submission.
- After editing a local plugin, refresh or restart the host and start a new session so plugin tools are reloaded.

## MCP server fails to start

- Check `node --version` and confirm it is 18 or newer.
- Launch `node agents/patch-agent/runtime.js` from this directory and send a JSON-RPC `initialize` request for a protocol smoke check.
- Ensure the host expands `${PLUGIN_ROOT}` and that the plugin files are present in the installed copy.
- The server prints protocol output only to stdout; diagnostics belong on stderr.

## Command hook did not block

- Check that the plugin hook definition is trusted and loaded, and that the tool matched `Bash`.
- The regex rules cover listed patterns, not all shell syntax. A timeout, launch failure, or malformed hook response can allow execution to continue. Rely on sandboxing and centrally managed command policy for enforcement.

## Audit events are missing

- The signing key must be provisioned into the trusted hook process environment as `ENTERPRISE_AUDIT_HMAC_KEY`; never add the value to plugin files.
- `PLUGIN_DATA` must be available and writable. The logger refuses to write into the package directory.
- HMAC verification requires the same key. Do not rotate or replace that key without preserving the approved verification process.

## Bloom filter reports no indicators

The checked-in filter is intentionally empty. Populate it with `sync/build_bloom_filter.py --hashes <trusted-feed.txt>` after verifying the feed provenance. Positive Bloom matches can be false positives and need confirmation against the source feed.
