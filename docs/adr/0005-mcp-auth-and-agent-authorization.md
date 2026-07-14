# ADR 0005: MCP Auth And Agent Authorization

## Status

Accepted

## Context

The platform exposes a secure Streamable HTTP MCP server. AI agents may create work, comment, summarize, and change status when authorized. Those actions must be audited and scoped to the relevant system and client.

## Decision

Use OAuth 2.1-style bearer token authentication for MCP agent clients.

Represent each agent integration as a service principal or OAuth client with explicit scopes for:

- system access
- client access
- tool-family access
- privileged status changes

Authorized AI agents may change work item status when their token scope permits the relevant system and client. All AI-originated actions must create admin-only audit records.

## Consequences

- Agent actions are attributable to agents rather than hidden behind user sessions.
- The model supports local development tokens and production OAuth without changing service authorization semantics.
- Token issuance, rotation, and revocation need operational support before production use.
