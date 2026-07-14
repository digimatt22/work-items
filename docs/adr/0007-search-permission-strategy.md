# ADR 0007: Search Permission Strategy

## Status

Accepted

## Context

The PRD requires global search and filters across clients, projects, pipeline status, labels, release targets, reporter, assignee, and type. Search must not leak data across client boundaries.

## Decision

Use PostgreSQL-backed search for Phase 2 global search. Apply permission filters at query construction for every search request.

Launch permission behavior:

- Admin can search across all clients and projects.
- Client users can search only records belonging to their client.
- AI agents can search only records allowed by their OAuth scopes.
- AI audit and AI action metadata remain admin-only.

## Consequences

- Search can launch without extra infrastructure.
- Permission behavior stays consistent with list views and MCP tools.
- A future dedicated search service must preserve the same permission-filter contract.
