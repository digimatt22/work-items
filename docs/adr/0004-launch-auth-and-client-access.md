# ADR 0004: Launch Auth And Client Access

## Status

Accepted

## Context

The launch product needs simple, reliable access control. The admin will create clients and client users. Client users belong to one client for launch and can see all projects belonging to that client.

## Decision

Use Auth.js with a local database-backed provider for launch.

Use this launch access model:

- Admin has platform-wide access.
- Admin creates clients and client users.
- Each client user belongs to exactly one client.
- A client user can view all projects belonging to their client.
- Server-side policies enforce access for all web and MCP paths.

## Consequences

- The launch implementation is simple and matches expected operations.
- The model avoids premature project-by-project assignment complexity.
- The schema should remain extensible for future project-specific memberships and SSO/OIDC.
