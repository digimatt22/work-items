# Architecture

## Overview

This repository is a TypeScript monorepo for the DigiColony AI-First Client Operations Platform. The current milestone is an authenticated local MVP for client request intake, admin work management, and launch-review reporting.

Canonical planning lives in:

- `docs/dpaf/`
- `docs/prd/launch-decisions-addendum.md`
- `docs/adr/`
- `docs/dpaf/expansion/` for the proposed customer-intake-to-agent-delivery expansion

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
5. Signed-in users can replace their credentials at `/settings/password`; the action verifies the current bcrypt hash, validates and hashes the replacement, clears the first-login requirement and database-backed sessions, and signs out the current Auth.js session.
6. Admins land on the work-item board and manage clients, projects, users, and work items through the admin shell.
7. Client-user provisioning generates a unique 20-character temporary password and creates the user and forced-change bcrypt credential as one atomic Prisma write. The plaintext credential is returned once to the creating administrator for copying and is never stored or logged. Expected failures return a safe result to the add-user form instead of rejecting into Next.js's client error boundary.
8. Admins can open `/status-report` directly or generate it from the work-item board; board query, client/project, and type filters scope the deterministic weekly email-ready summary.
9. Client users land on `/report`, choose a visible project, submit a bug or feature request, and optionally attach files.
10. Client reports create standard work items through shared work-item services, then upload attachments through the shared asset service and storage provider.

## Contracts

- The web app and MCP server must use shared service/policy contracts rather than drifting into separate business rules.
- Client users belong to one client at launch and can view all projects for that client.
- Client users use `/report` as the primary entry point and `/work-items` as a read-only board/status view.
- The admin weekly status report is copy/paste only for now; it does not send email, store report history, or manage recipients.
- Client reports must create normal `BUG` or `FEATURE` work items, not a separate reporting-only entity.
- Password changes require the signed-in user's current password, a distinct 12–128 character replacement, and confirmation. Successful changes return the user to sign-in.
- Newly created client users are limited to `/settings/password` until they replace the generated temporary password; existing credentials default to no forced change.
- Invalid credentials never reveal whether an email exists; expected Auth.js `CredentialsSignin` failures return to `/sign-in` with the same generic message while unrelated server errors continue to propagate.
- Duplicate client-user emails, missing inputs, and stale client selections remain in the add-user form with safe, actionable messages. Unexpected details are logged server-side and are not exposed to the browser.
- Report attachments must use the existing asset constraints and storage-provider abstraction.
- AI actions and delivery evidence are admin-only by default; only admins can qualify work as agent-ready.
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

| Date       | Decision                                                                                                                                 | Consequence                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-26 | Use accepted ADRs in `docs/adr/` as architecture guardrails                                                                              | Future implementation should update ADRs before changing boundaries, auth, audit, storage, search, or work item modeling        |
| 2026-07-16 | Provide authenticated password changes through `/settings/password` using the existing credentials provider and bcrypt cost 12           | Users can rotate credentials without direct database or seed access; email recovery and MFA remain separate future work         |
| 2026-07-16 | Create client-user identity and password records atomically and return expected creation failures to the form                            | Failed provisioning cannot leave a partial account, and duplicate emails no longer trigger a framework error page               |
| 2026-07-17 | Generate a unique temporary password for each client user, display it once to the creating admin, and require replacement on first login | Accounts can be handed off without email delivery or a shared default password; plaintext temporary passwords are not persisted |
| 2026-07-17 | Bind each pilot Work Items project to at most one active repository/workspace through Digi-Portal and let only admins qualify work for agents | Project routing has a single authoritative active binding, while customer status and agent-delivery state remain separate |

## Architectural Boundaries

- No production AWS infrastructure in Phase 0.
- No Phase 1 feature implementation beyond skeletons/contracts.
- No real Auth.js provider wiring until Phase 1A.
- No rich document/video preview generation in MVP scope.

## Proposed Agent Delivery Expansion

The approved planning direction in `docs/dpaf/expansion/` introduces a control-plane layer without changing the current customer intake contract:

1. An admin qualifies a work item for agent delivery.
2. A non-secret `.work-items/project.json` binds a repository/workspace to an immutable Work Items project ID and revocable binding ID.
3. The reusable Digi-Portal plugin verifies that file against a separately stored scoped credential.
4. An agent pulls only eligible work for the verified project and acquires an exclusive expiring claim lease.
5. Progress, questions, evidence, and review readiness return through shared services with linked activity and AI audit.
6. Merge, deploy, customer communication, and final closure remain human-controlled in the first release.

Qualification, dispatch, lease, and delivery-attempt state remain separate from the customer-facing pipeline status. Phase 0 implements the persistence contracts, shared authorization services, transition guards, audit/outbox writes, and an inert admin binding diagnostic. All binding activation and agent-facing behavior remains disabled behind independent feature flags.
