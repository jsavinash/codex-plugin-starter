---
name: enterprise-preflight
description: Check a proposed local developer workflow for configured command, region, budget, and credential-handling constraints before carrying it out. Use when the user asks for a safety or enterprise policy preflight.
---

# Enterprise workflow preflight

1. Read the repository's own instructions and identify the exact command, data category, declared processing region, and estimated cost that matter to the task.
2. Use `check_command` for the proposed shell command, `check_data_residency` for explicitly declared regions, and `check_budget_estimate` only when the caller has a meaningful estimate and cost center.
3. If a check denies, explain the specific matched policy and offer a safe alternative. Do not rewrite a destructive command to evade the rule.
4. Treat an allowed result as a local configuration match only. It does not prove that the environment, provider, organization, or project is compliant.
5. Continue with the user's request only within the active sandbox and approval policy. The hook, MCP tool, and this skill are defense in depth, not the authority for permissions.

## Constraints

- Never ask the user to paste secrets into a prompt or tool argument. Check only whether an approved environment variable is present; do not print its value.
- Never claim HIPAA, SOC 2, GDPR, data-residency, malware-clean, or spending guarantees based on this plugin's local example configs.
- A Bloom filter positive is a possible match and must be checked against an authoritative, signed feed by the organization's security system.
- Follow higher-priority user, repository, and managed instructions.
