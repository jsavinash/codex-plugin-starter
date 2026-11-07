# Identity and credential boundaries

The environment mapping is a name/scope inventory only. The bundled MCP tools do not receive or return these credentials. Vault and CyberArk adapters are intentionally not implemented; connect them through an organization-owned broker that authenticates callers, scopes each secret, and never exposes values to the model or logs.
