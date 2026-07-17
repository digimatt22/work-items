# ADR 0010: Digi-Portal Agent Authority

## Status

Accepted

## Context

Digi-Portal will expose project work to AI agents through MCP. Agent authority must remain narrower than admin authority, customer content is untrusted, and private agent execution details must not leak to client users.

## Decision

- Layer authorization through service-principal identity, client scope, binding scope, tool scope, and lease capability.
- Reuse the same shared service and policy boundary for web and MCP paths.
- Separate read scopes from claim, progress, and evidence write scopes.
- Default admin binding setup, agent reads, and agent mutations to disabled feature flags.
- Require human authority for binding activation/revocation, agent-ready qualification, merge, deployment, customer communication, and final closure.
- Treat request text, comments, filenames, attachment metadata, and extracted content as untrusted data.
- Record safe summaries and attribution, never chain-of-thought or credentials, in admin-only activity and `AiAction` audit.

## Consequences

- Phase 1 may ship read-only verification before any agent write authority.
- ChatGPT web requires a plugin for remote MCP tools; local Codex may also use project-scoped MCP configuration in trusted repositories.
- Workspace administrators may limit plugin/tool availability.
- Credential storage and onboarding must follow the supported host/OAuth surface verified before Phase 1.
