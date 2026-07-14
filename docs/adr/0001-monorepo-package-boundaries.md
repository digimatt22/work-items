# ADR 0001: Monorepo Package Boundaries

## Status

Accepted

## Context

The PRD specifies a TypeScript stack with Next.js, Prisma, PostgreSQL, Auth.js, an MCP server, shared UI, and shared domain behavior. The platform must avoid separate web and MCP business logic.

## Decision

Use the PRD monorepo structure:

- `apps/web`
- `packages/db`
- `packages/mcp`
- `packages/ui`
- `packages/shared`
- `scripts`
- `uploads`
- `docs`
- `tests`

Application services and policy helpers should live where both web and MCP entry points can reuse them.

## Consequences

- Web and MCP can share validation, permissions, and audit behavior.
- Package boundaries support later separate deployment of MCP without changing domain logic.
- The repo starts slightly more structured than a single Next.js app, but avoids early architectural drift.
