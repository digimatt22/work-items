# Information Architecture

## Current IA
```text
Authenticated shell
  Board
    Kanban
    List
    Create work item
  Clients
    Client portfolio
    Client detail
      Projects
      Client context
      Activity
      Client users
    Project workspace
    Work item detail
```

## Recommended IA For MVP
```text
Board
  All visible work
  Filters
  Work item detail

Clients
  Client portfolio
  Client detail
    Context
    Projects
    Users
    Activity
  Project workspace

Admin Governance (Phase 2)
  AI audit
  MCP clients/tokens
  Search and summaries
```

## Permission Notes
- Admin can see and manage all clients, projects, users, and status movement.
- Client users should see their client scope only and should not see AI existence or audit details.
- AI agents should not have a human navigation surface; they operate through MCP and shared services.

## Recommendations
- Keep navigation labels simple: `Board`, `Clients`, later `Governance`.
- Avoid exposing `AI`, `MCP`, or agent language to client users.
- Add client-user IA acceptance criteria before launch.
- Treat `/workspaces` and `/mvp-review` redirects as compatibility only.

