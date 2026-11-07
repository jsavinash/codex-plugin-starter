# Codex plugin research notes

Reviewed 2026-11-08 against official OpenAI documentation.

- New portable plugins use a root `plugin.json`; fixed portable component paths include root `skills/` and `mcp.json`. `extensions.com.openai` carries OpenAI presentation and hook settings. `.codex-plugin/plugin.json` remains a compatibility format.
- Plugin skills are user-goal workflows. A plugin package can add MCP tools, and lifecycle hooks run in supported local Codex contexts.
- The supported hook events include `PreToolUse` and `PostToolUse`; `PreCommit` and `OnBuildFailure` are not Codex lifecycle event names. Hook coverage is incomplete and hook failures/timeouts may continue the operation.
- A local stdio MCP server is a desktop/local-execution feature. Public submission is subject to partner approval. Public plugins with hooks are not eligible for the universal public directory.
- Local marketplace catalogs use `.agents/plugins/marketplace.json` (repo) or `~/.agents/plugins/marketplace.json` (personal). The catalog is separate from the plugin manifest/package, and source paths are relative to the marketplace root.
- Codex's `.codex/config.toml` is project configuration loaded only for trusted projects. This package does not include a project config file; configure the trusted host/repository separately. Timeouts, memory caps, gVisor, and arbitrary writable-root boundaries need host/managed configuration or a container runtime.
- MCP authentication, authorization, residency, spending controls, and logging must be enforced at the server/host boundary. Bundled manifests and skill instructions alone do not enforce these enterprise controls.

Official references:

- [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [Submit desktop-only plugins](https://developers.openai.com/plugins/deploy/desktop-only)
- [Codex hooks](https://developers.openai.com/codex/hooks)
- [Codex configuration reference](https://developers.openai.com/codex/config-reference)
- [Sandbox security](https://developers.openai.com/api/docs/guides/agents-api/environments/security)
- [MCP security reminders](https://developers.openai.com/plugins/build/mcp-server)
