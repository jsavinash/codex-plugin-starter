# Architecture and enforcement boundaries

## Runtime components

- `plugin.json` is the portable manifest. It connects the skills, local MCP server, and local Codex hooks.
- `agents/patch-agent/runtime.js` is a dependency-free stdio MCP server with read-only policy tools.
- `hooks/command_policy.js` checks supported Bash tool calls against `policies/blocked_commands.json`.
- `telemetry/audit_logger.js` signs minimal observed `PostToolUse` metadata with HMAC-SHA-256 and writes it under `PLUGIN_DATA` when configured.
- The local helpers in `routing/`, `sovereignty/`, and `monetization/` compare explicit caller values against sample policies. They do not control the Codex model host or provider billing.
- This package does not include a container launcher or a native gVisor configuration. Run it under the local Codex host and approved host/OS sandbox controls.

## Data flow

```text
Codex local tool call ──PreToolUse──> command policy hook ──allow/deny──> tool
          │
          └──PostToolUse──> redacted metadata ──HMAC──> local PLUGIN_DATA audit file

Agent ──stdio MCP──> policy tools ──local JSON configs only──> structured result
```

## Operational limits

- Hooks cover only supported local tool paths and require user review/trust. Hook errors or timeouts are not a hard security boundary; use Codex sandboxing, managed command policies, OS/container controls, and a protected execution environment.
- HMAC authenticates records for parties that possess the shared secret. It does not make logs immutable, prove that every model action was captured, or provide public non-repudiation. Forward signed records to protected centralized storage for tamper-evident retention.
- Local regex redaction can miss PII or secrets. Use an approved DLP control at the actual data boundary.
- No enterprise endpoint, CA certificate, provider credential, threat feed, embedding data, or signature key is bundled.
