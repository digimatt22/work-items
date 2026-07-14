# UX Strategy

## Routing Decision
CTO integrator decision: apply all requested specialist tracks as supporting artifacts.

- Product Research: needed to ground work-management conventions without losing the operational-memory differentiator.
- UX Strategy: needed because the current app has multiple routes and workflows but no dedicated IA, state, or permission UX spec.
- UI Design System: needed because styling is repeated inline across routes and `packages/ui` is still a placeholder.
- Interaction Design: needed because status transitions, filters, comments, uploads, and destructive actions now affect real workflow behavior.
- Design QA: needed because implementation exists and active plans mark it ready for human review.
- Artifact Handoff: needed to reconcile findings with the DPAF pack instead of letting specialist docs become a competing source of truth.

## Existing Facts
- The app is a TypeScript monorepo using Next.js App Router, Prisma, PostgreSQL, Auth.js, Tailwind, shared service packages, and Playwright.
- The current admin IA is Board first, then Clients.
- Client users can view their client projects and create work, but status movement is admin-only.
- AI actions are admin-only by product decision; Phase 2 MCP and AI summaries are not fully implemented.
- Active plans show the admin workflow is ready for review, with e2e tests passing in prior work.

## Product Principle
The UX should make each record progressively more useful as operational memory:
- Board: decide what needs attention.
- Client: understand account context and project portfolio.
- Project: focus execution within one engagement.
- Work item: preserve the action history, discussion, evidence, and next decision.

## Primary User Goals
- Admin: scan all active commitments, triage by client/project/status/type, move work, add work, and manage client setup.
- Client user: find their projects, report bugs/features, add comments/assets, and understand non-AI progress.
- AI agent: use shared services and audit paths through MCP in later phases.

## UX Recommendations
- Add a clear no-results state on filtered boards with a one-click clear action and filter summary.
- Add work-item detail editing for title, description, type-specific fields, assignee, release target, labels, and archive state once those fields are ready.
- Show activity on work item detail, not only client detail.
- Add card metadata for comments, assets, assignee, release target, and updated time.
- Add a client-user mode QA pass before accepting the workflow as launch-ready.
- Keep the current Board/Clients IA for MVP, but document compatibility redirects as temporary.

## Risks
- The UI currently reads as an admin prototype; client-user experience may be under-specified.
- Direct Prisma mutations in client detail actions bypass the shared service/audit boundary.
- Without error recovery, server-action failures will feel abrupt and may produce generic error screens.
- Without reusable state components, later screens can drift quickly.

## Open Questions
- Should client users land on Board, Clients, or a client-scoped project list?
- Should status movement support only linear Back/Advance, arbitrary status select, or drag-and-drop in launch?
- Which work item fields are required for launch: assignee, reporter, release target, labels, watchers?
- Should client users be able to archive their own work items, or only admins?

