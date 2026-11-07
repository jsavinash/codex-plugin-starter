# Ownership and deployment levels

This guide explains which level should own each part of this plugin. The important distinction is **source code versus authoritative runtime configuration**: the plugin directory contains code and safe examples; it is not itself an enterprise control plane.

## The three levels

### Enterprise level

Organization-managed services and configuration are the authority for shared controls. Put approved policy values, provider routing decisions, identity and secret management, telemetry destinations and retention, chargeback rules, residency boundaries, and company knowledge stores in systems that the organization operates and can enforce. Keep private keys in a protected signing system. Do not copy company secrets, customer data, production embeddings, or live audit logs into this plugin repository.

The JSON files in this plugin that look enterprise-specific are examples consumed by local helper code. They are not a connection to an enterprise policy service and are not authoritative settings.

### Personal level

Each developer's Codex setup and private local runtime data belongs to that person's machine/account, outside this source package. Typical host paths include:

```text
~/.agents/plugins/marketplace.json  # Personal marketplace catalog
~/.codex/config.toml                # Personal Codex configuration
PLUGIN_DATA                         # Writable data directory supplied to plugin hooks
```

Local credentials belong in the approved user credential store or secret manager. Do not put a personal marketplace, local Codex configuration, credentials, session transcripts, or handoffs into the distributable plugin.

### Code repository level

Everything checked into `my-enterprise-plugin/` is source, safe example configuration, documentation, or test material. The directories below describe what the code package owns:

| Plugin path | Code repository responsibility | Enterprise/personal runtime responsibility |
|---|---|---|
| `plugin.json`, `mcp.json`, `hooks.json` | Package identity, MCP launch map, and supported hook configuration. | Host installation, hook trust, and actual organization enforcement. |
| `agents/`, `hooks/`, `skills/` | MCP server, hook implementation, agent profiles, and reusable workflows. | Service-side authz and execution permissions remain with the host/service. |
| `policies/` | Generic command patterns, redaction rules, and deterministic policy helper code. | Approved organizational policies and DLP enforcement belong in managed controls. |
| `routing/` | Example route/throttle data and advisory helper code. | Real model failover and token limits must be enforced by the host or gateway. |
| `sovereignty/` | Example region rules and caller-input comparison utility. | Actual processing-region guarantees and compliance decisions belong to the enterprise service. |
| `monetization/` | Example cost-center/cap data and estimate checker. | Billing facts and hard budget enforcement belong to enterprise billing/gateway systems. |
| `auth/` | Environment-variable names and validation/integration contracts. | Credential values, Vault/CyberArk configuration, identity, and access rules belong to a broker/secret manager. |
| `telemetry/` | Local audit-hook code and disabled exporter configuration example. | Production collector endpoints, retention, access, and immutable audit storage are enterprise operations. |
| `certificates/` | Guidance only; the package contains no CA certificate or signing key. | Trust roots and release signing keys belong to managed device/release infrastructure. |
| `memory/`, `state/` | Algorithms and empty schema/example files. | Live memory graphs, sessions, lineage, and handoffs belong in private personal or enterprise runtime storage. |
| `cache/`, `sync/` | Cache/sync format and code; checked-in Bloom filter is empty. | Company snapshots, generated indexes, and trusted threat feeds belong in governed data pipelines/stores. |
| `chaos/`, `regression/`, `tests/` | Test-only fault cases, sanitized golden cases, evaluator, and automated tests. | Tests requiring live enterprise services run in approved staging/CI. |
| `documentation/`, `assets/`, `locales/`, `ui/` | Public/general plugin docs, icon, translations, and static UI template. | Confidential runbooks and internal-only material stay in enterprise documentation systems. |
| `dist/` | Build-output location; generated archives are ignored by Git. | Approved release artifacts and signatures are stored by the release system. |

## Items intentionally outside this plugin folder

- A **personal marketplace** belongs at `~/.agents/plugins/marketplace.json`.
- A **repository marketplace** belongs at `<repo>/.agents/plugins/marketplace.json`.
- **Personal or project Codex settings** belong in the applicable `~/.codex/config.toml` or trusted repository `.codex/config.toml`, not in an installed plugin package.
- **Enterprise deployment files** belong in an organization-managed configuration repository/service, not in this plugin's package. If this project later adds a separate enterprise configuration repository, keep secrets and production state out of Git there too.

Marketplace catalogs are separate from plugin manifests. Codex does not automatically activate arbitrary `enterprise/`, routing, memory, telemetry, or policy folders just because they are present. The installed plugin host loads the declared package components; custom helper code only reads the files it explicitly opens.

## Practical rule

Keep **implementation, schemas, safe defaults, docs, and sanitized tests** in this plugin repository. Keep **live credentials, binding company policy, production data, telemetry, budgets, and runtime state** in the personal or enterprise system responsible for enforcing and protecting them.
