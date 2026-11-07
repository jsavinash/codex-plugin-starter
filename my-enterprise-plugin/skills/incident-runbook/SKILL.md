---
name: enterprise-incident-runbook
description: Triage a local development or tool-execution incident using repository evidence, policy configuration, and redacted logs. Use when the user reports a failed build, blocked command, MCP startup problem, or suspicious local execution.
---

# Triage a development incident

1. Identify the affected repository, operation, approximate time, and observed error. Do not request credentials or unredacted sensitive payloads.
2. Inspect relevant local configuration and stderr first. For an MCP startup problem, confirm Node is available, the plugin root path resolves, and the server can start from its configured working directory.
3. For a blocked shell call, check `policies/blocked_commands.json` and distinguish a matching rule from sandbox or approval behavior. Do not weaken policy to make a command pass.
4. For an audit issue, verify whether `ENTERPRISE_AUDIT_HMAC_KEY` and `PLUGIN_DATA` are available in the hook environment. Use `node telemetry/audit_logger.js --verify <file>` only with the organization's approved key source.
5. Redact incident text with `redact_text` before sharing it beyond the local environment. Review the output for missed sensitive data because regex rules are heuristic.
6. Summarize the evidence, likely cause, and a safe next step. Escalate to the owning security or platform team when the issue involves policy bypass, suspected compromise, production access, or uncertain data exposure.

## Constraints

- Do not upload logs, source, or data to an external service unless the user specifically authorized that destination and policy permits it.
- Do not treat this plugin as an incident-response platform or source of truth for audit retention.
- Preserve local evidence; never delete logs or rewrite a signed record to make verification pass.
