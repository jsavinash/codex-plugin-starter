# Plugin Structure: Ownership Levels

This reference maps the proposed plugin files to their primary ownership level and explains how to handle each one. The plugin package is the code/repository artifact; personal settings and enterprise services remain outside it.

| Item | Primary level | Recommended treatment |
|---|---|---|
| `plugin.json` | **Code/repository** | Version and package it with the plugin. Keep portable identity here; put Codex-specific integration settings under `extensions.com.openai`. |
| `mcp.json` | **Code/repository** | Package only server connection/launch configuration. Keep credentials out of it; use the host’s supported authentication flow or runtime secret store. |
| `hooks.json` | **Code/repository** | Keep hook definitions and scripts with the plugin source. Point to the hook file through `extensions.com.openai.hooks` or the documented hook discovery path. `PreCommit` and `OnBuildFailure` are not documented Codex hook events; use supported events such as `PreToolUse` and `PostToolUse`. |
| `marketplace.json` | **Personal or enterprise/repository catalog** | It is a catalog, not part of the plugin itself. Put a personal catalog at `~/.agents/plugins/marketplace.json`, a repository catalog at `$REPO_ROOT/.agents/plugins/marketplace.json`, or an organization-managed catalog under enterprise administration. |
| `.codex/config.toml` | **Personal, repository, or enterprise-managed configuration** | Keep it outside the installed plugin package. User config belongs in `~/.codex/config.toml`; project settings can live in a trusted repository’s `.codex/config.toml`; admins can manage system defaults. Project configuration is not an enforcement layer embedded in a plugin. |
| `.codex/sandbox.json` | **Custom host/runtime configuration** | It is not a standard Codex plugin control. Treat it as your own format only if you implement a host/runtime consumer for it. Its presence does not grant or enforce sandbox privileges. |
| `routing/failover_policy.json` | **Enterprise runtime configuration** | Version the schema and example defaults in code; put real provider policy and endpoints in the enterprise routing service or managed configuration. A plugin file alone does not reroute model calls. |
| `routing/token_throttling.json` | **Enterprise runtime configuration** | Store authoritative limits with the service that can enforce them. Keep a local simulator or test fixture in the code repository. |
| `memory/semantic_graph.bin` | **Enterprise data** (or personal data for a solo workflow) | Store generated embeddings/graphs in a secured data service or private runtime store. Do not commit real company knowledge or ship it in the plugin archive. |
| `memory/runtime_lineage.json` | **Runtime data** | Keep active lineage in a runtime database or scoped state store. Code can define its schema and retention policy. |
| `state/current_session.json` | **Personal or enterprise runtime data** | Store under a user’s private plugin data directory for a local-only tool, or in an organization-controlled session service. Don’t track live session state in source control. |
| `state/recursion_guard.json` | **Code plus runtime state** | Put thresholds and algorithms in code; keep counters and execution records in runtime storage. |
| `state/handoffs/` | **Runtime data** | Handoffs can contain sensitive context. Store them with access control, retention, and deletion behavior; don’t package active handoffs. |
| `regression/golden_prompts.json` | **Code/repository**, with review | Keep sanitized, stable test cases in source. If prompts encode confidential information or policy, use approved fixtures or an enterprise-only test corpus. |
| `regression/eval_metrics.py` | **Code/repository** | Version and test it with the plugin. It can evaluate outputs; it cannot prevent prompt drift by itself. |
| `policies/` | **Split: code defaults + enterprise authority** | Keep validators and generic safe defaults in code. Keep binding organizational rules in centrally managed policy and enforce them at the host/service boundary. |
| `telemetry/` | **Split: code adapter + enterprise operations** | Version instrumentation code and a configuration schema. Keep export endpoints, retention, access control, and audit storage in enterprise operations. Personal development logs should stay local and user-controlled. |
| `certificates/` | **Enterprise operations** | Distribute trusted public certificates through managed device/runtime configuration where needed. Never bundle private signing keys. Generate release signatures in a controlled build/release pipeline. |
| `auth/` | **Split: code integration + enterprise identity** | The plugin may document or implement an integration. Vault/CyberArk configuration, identity policy, and secrets belong in enterprise-managed services. A personal developer may use their own local credentials, kept out of the repository. |
| `cache/` | **Split by data sensitivity** | Version harmless static schemas or fixtures in code. Put generated embeddings, database snapshots, and company data in private personal or enterprise runtime storage. |
| `documentation/` | **Code/repository** | Keep plugin setup, architecture, and troubleshooting docs with the source. Put internal incident procedures or confidential control mappings in enterprise documentation. |
| `agents/` | **Code/repository** | Version agent definitions, prompts, and runtime implementations. Organization-wide constraints should be injected or enforced by enterprise-managed policy. |
| `assets/` | **Code/repository** | Package public branding and interface assets. Avoid internal-only branding or confidential diagrams in distributable artifacts. |
| `dist/` | **Build/release output** | Generate it in CI or at release time. Usually don’t commit compiled binaries or archives to the source tree. |
| `skills/` | **Code/repository** | Package reusable `SKILL.md` workflows here. Skills guide model behavior; live data access and controlled actions belong in MCP tools or other services. See the [skills guide](https://developers.openai.com/plugins/build/skills). |
| `locales/` | **Code/repository** | Version user-facing translations with the plugin. These files need an application feature that loads them; don’t assume Codex automatically applies arbitrary locale bundles. |
| `ui/` | **Code/repository, if implemented** | Keep UI code/templates with the feature that serves them. UI behavior is part of the MCP/app integration, not activated by an arbitrary folder. |
| `tests/` | **Code/repository** | Keep unit, integration, mock, and regression tests here. Add enterprise staging tests in the enterprise CI/runtime environment when they require real systems. |

## How this applies to this repository

All files under `my-enterprise-plugin/` are source code, safe defaults, documentation, or test fixtures tracked at the **code repository level**. For example, `routing/failover_policy.json` and `sovereignty/data_residency.json` are sample inputs for local helpers; they are not live company policy. The `state/` and `memory/` JSON files are empty/schema examples, and the checked-in Bloom filter is empty.

The **personal level** is outside this folder: personal Codex configuration and marketplace entries live under the developer’s home configuration. The **enterprise level** is also outside this folder: authoritative policy, identity, routing, telemetry, billing, residency, and company data must be deployed and enforced by organization-managed systems.

Codex does not activate arbitrary folders by name. The plugin runtime uses only components declared in the manifest or explicitly opened by the bundled code. See [Ownership and deployment levels](OWNERSHIP_AND_DEPLOYMENT_LEVELS.md) for a fuller explanation.
