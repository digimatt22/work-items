# Architecture

## Overview
This repository is a TypeScript monorepo for the DigiColony AI-First Client Operations Platform. The current milestone is an authenticated local MVP for client request intake, admin work management, and launch-review reporting.

Canonical planning lives in:

- `docs/dpaf/`
- `docs/prd/launch-decisions-addendum.md`
- `docs/adr/`

## System Boundaries
- `apps/web`: Next.js App Router web app.
- `packages/db`: Prisma schema and database package.
- `packages/shared`: shared roles, actors, permissions, activity, asset, storage, MCP, and work item contracts.
- `packages/ui`: shared UI package placeholder.
- `packages/mcp`: MCP tool contract and scope helpers.
- `tests/e2e`: Playwright placeholder for Phase 1+ flows.
- `docs/`: DPAF, PRD addendum, ADRs, and harness documentation.

## Data Flow
The important local development flow is:

1. Developer installs dependencies with `pnpm install`.
2. Prisma client is generated from `packages/db/prisma/schema.prisma`.
3. Shared contracts are typechecked across workspace packages.
4. The Next.js app uses Auth.js credentials to identify admins and client users.
5. Admins land on the work-item board and manage clients, projects, users, and work items through the admin shell.
6. Admins can open `/status-report` to generate a deterministic weekly email-ready summary from current work item status.
7. Client users land on `/report`, choose a visible project, submit a bug or feature request, and optionally attach files.
8. Client reports create standard work items through shared work-item services, then upload attachments through the shared asset service and storage provider.

## Contracts
- The web app and MCP server must use shared service/policy contracts rather than drifting into separate business rules.
- Client users belong to one client at launch and can view all projects for that client.
- Client users use `/report` as the primary entry point and `/work-items` as a read-only board/status view.
- The admin weekly status report is copy/paste only for now; it does not send email, store report history, or manage recipients.
- Client reports must create normal `BUG` or `FEATURE` work items, not a separate reporting-only entity.
- Report attachments must use the existing asset constraints and storage-provider abstraction.
- AI actions are admin-only.
- MCP authorization uses OAuth 2.1-style bearer token scopes.
- Assets go through a storage provider abstraction.
- Work items remain unified with type-specific detail records.

## Operational Risks
- Permission drift between web and MCP paths.
- Missing activity/audit writes for mutations.
- Search leakage across client boundaries.
- Filesystem assumptions leaking into asset domain code.
- Premature Phase 1 feature implementation inside Phase 0 scaffolding.

## Design Decisions
Use this section for stable decisions that future work should respect. Include date, context, decision, and consequences when the decision is important enough to survive beyond one PR.

| Date | Decision | Consequence |
| --- | --- | --- |
| 2026-06-26 | Use accepted ADRs in `docs/adr/` as architecture guardrails | Future implementation should update ADRs before changing boundaries, auth, audit, storage, search, or work item modeling |

## Architectural Boundaries
- No production AWS infrastructure in Phase 0.
- No Phase 1 feature implementation beyond skeletons/contracts.
- No real Auth.js provider wiring until Phase 1A.
- No rich document/video preview generation in MVP scope.
