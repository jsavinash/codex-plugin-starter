---
name: enterprise-build-handoff
description: Prepare a concise, reviewable handoff for a completed code or build task with changed files, verification evidence, unresolved risks, and release boundaries. Use when a developer asks to finish or hand off implementation work.
---

# Prepare a build handoff

1. Inspect the current diff and repository status. Separate task changes from existing user changes.
2. Find the project-defined build and verification commands. Run only checks authorized by the user or project workflow and report their actual result.
3. Check release-sensitive operations and artifacts for credentials, local configuration, private certificates, generated state, and unexpected files.
4. State the changed behavior, files, verification evidence, known limitations, and the next owner action.
5. Do not publish, deploy, merge, or upload as part of a handoff unless the user explicitly authorized that action.

## Constraints

- Do not claim a check passed unless it completed successfully.
- Do not infer that a local policy result proves organizational compliance.
- Keep secrets and raw sensitive data out of summaries and logs.
