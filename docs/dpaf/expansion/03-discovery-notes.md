# Discovery Notes

## Source Artifacts
- Existing product and harness documentation under `docs/`.
- Existing DPAF planning and accepted ADRs.
- Current Prisma schema and shared service contracts.
- MCP contract placeholders in `packages/mcp` and `packages/shared`.
- Customer intake, admin board, authentication, deployment, and test implementation.
- User goal stated on 2026-07-17.

## Interview Notes
The requested end state is customer-submitted bug and feature work being pulled by AI agents into the appropriate ChatGPT Work project. The likely product shape is a reusable Work Items plugin available to all projects, with a project-level ID/config binding.

## Facts
- The customer intake and admin work-item experience exists and is deployed.
- Work items already belong to projects; projects belong to clients.
- The codebase already anticipates an MCP server, scoped agent identities, and admin-only AI audit.
- `packages/mcp` is a contract placeholder, not a running server.
- The database has AI audit and MCP OAuth client models but no dispatch/claim model.
- The repository has no `origin`, CI provider, or durable production asset storage.
- No supported ChatGPT Work workspace-creation or task-injection API is documented in this repo.

## Decisions
- Use a pull-based plugin/MCP workflow as the first production architecture.
- Bind by immutable Work Items project ID, with a generated binding ID for revocation and rotation.
- Store public binding metadata in `.work-items/project.json`; store secrets outside Git.
- Model agent delivery separately from the customer-facing pipeline status.
- Require qualification before an item is eligible for agent pickup.
- Start with one project binding per repository/workspace; allow multiple bindings only in a later explicit design.

## Assumptions
- ChatGPT Work will permit a plugin/connector to run in the project context and access the local workspace config.
- Agents can be instructed to invoke the plugin from the correct project even if automatic task creation is not available.
- Existing project IDs remain stable.
- The initial implementation can extend the current PostgreSQL schema and shared service boundary.

## Risks
- A workspace could be bound to the wrong customer project.
- Duplicate agents could implement the same request without a lease.
- Customer text or attachments could contain prompt injection or secrets.
- Agent progress could leak internal reasoning to clients.
- A plugin could drift from the web permission model.
- An over-ambitious event-driven launch could depend on external product capabilities that are not available.
