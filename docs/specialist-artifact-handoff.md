# Specialist Artifact Handoff

## Purpose
This handoff reconciles the DPAF specialist review with the canonical product docs. The CTO Agent remains the final integrator. These specialist outputs are supporting artifacts until Matthew approves integration.

## What Already Exists
- Product source: local DPAF pack under `docs/dpaf/`.
- Launch decisions: `docs/prd/launch-decisions-addendum.md`.
- Architecture guardrails: ADRs 0001-0007.
- Implementation: Next.js app, Prisma/db package, shared services, MCP package skeleton, Playwright e2e tests.
- Current UI: Board-first admin IA, Clients section, client detail, project workspace, work item detail with comments/uploads.
- Active plans: `usable-admin-workflow-mvp.md` and `admin-work-management-ux-pass.md`, both ready for review.
- Visual reference: Pickolab Studio Community task dashboard Figma file, interpreted in `docs/ui/figma-reference.md` and translated page-by-page in `docs/ui/page-reimagination.md`.

## Routing Decision
Applied all requested tracks:
- Product Research: competitor and pattern inventory.
- UX Strategy: flows, page inventory, IA, permission UX, states.
- UI Design System: look/feel, tokens, components, state spec.
- Interaction Design: status transitions, filters, comments, uploads, editing, keyboard behavior, optimistic/recovery behavior.
- Design QA: implementation review and accessibility review.
- Artifact Handoff: this reconciliation doc.

## Recommended Canonical Updates
- Update `docs/dpaf/02-product-requirements.md` with launch UX acceptance criteria for empty/loading/error states, destructive confirmations, work item detail completeness, and client-user flow review.
- Updated `docs/dpaf/04-implementation-plan.md` with a Phase 1F design-readiness pass before Phase 2 MCP work.
- Updated `docs/dpaf/05-risks-decisions-open-questions.md` with the new risks and open questions below.
- Keep `docs/prd/launch-decisions-addendum.md` unchanged until Matthew approves a durable product decision.
- No `PRD.md`, `18-codex-build-plan.md`, `19-implementation-kickoff-prompts.md`, or `17-open-questions.md` files exist in this workspace; do not create competing canonical files unless Matthew asks.

## Open Questions Before Next Implementation
- Should hard delete of client users be replaced with deactivate/archive?
- Should client users land on Board, Clients, or a client-scoped project list?
- Are comment edits allowed for launch?
- Which work item fields must be editable in the next pass: title, description, type-specific details, assignee, release target, labels, watchers, archive?
- Should project-level asset upload ship in the next pass or remain work-item-only?
- Is arbitrary admin status selection acceptable, or should launch enforce linear state transitions?
- Should compatibility routes `/workspaces` and `/mvp-review` remain through launch?

## Codex-Ready Follow-Up Implementation Prompt
```text
Use the existing work-items repo and the specialist artifacts under docs/research, docs/ux, docs/ui, and docs/reviews.

Goal: implement the approved Phase 1F design-readiness pass without starting Phase 2 MCP/AI feature work.

Read first:
- AGENTS.md
- docs/dpaf/02-product-requirements.md
- docs/dpaf/04-implementation-plan.md
- docs/specialist-artifact-handoff.md
- docs/ui/figma-reference.md
- docs/ui/page-reimagination.md
- docs/reviews/design-qa.md
- docs/reviews/ui-bug-list.md
- apps/web/app routes and packages/shared service files touched by the work

Implementation scope:
1. Move client update and client-user update/delete behavior behind shared services and record activity where appropriate.
2. Add confirmation UI for archive client, archive project, and delete/deactivate client user.
3. Improve work item detail with type-specific details, activity timeline, permitted status controls, and edit entry points for approved fields.
4. Rework the shell and existing pages toward the Pickolab-inspired layout: fixed left rail, strong page header, main work canvas, optional right context rail, rounded cards, progress-rich record cards, and mobile top-bar adaptation.
5. Add reusable UI components for Button, FormField, Badge, PageHeader, EmptyState, Alert, Panel/Card, MetricCard, AppShell, and ContextRail.
6. Add pending/error/success handling for create, update, status move, comment, and upload flows where practical.
7. Add clearer board no-results state, active filter chips, and richer work item card metadata.
8. Add upload constraint copy and inline upload error recovery.
9. Add accessibility fixes: focus-visible styles, field error associations, non-color status indicators, and destructive-action affordances.
10. Update tests for admin workflow, client-user permissions, destructive confirmations, work item detail, page shell behavior, and error/empty states.
11. Update docs and active execution plan with validation evidence.

Rules:
- Do not expose AI audit or agent existence to client users.
- Do not add Phase 2 MCP or AI automation features.
- Do not invent production deployment, retention, or business rules.
- Keep changes scoped and follow existing service-layer patterns.
- Preserve Board/Clients IA unless Matthew approves a different route.
- Use the Figma reference for layout, tone, and component rhythm; do not copy placeholder content or add unapproved product concepts.
```

## Validation Recommendations
- Run `scripts/check-current-state.sh` and document Git limitation if still not a repo.
- Run `pnpm lint`, `pnpm test`, and focused Playwright tests.
- Capture fresh screenshots for Board, Clients, Client detail, Project workspace, Work item detail, and client-user view before final design acceptance.
- Run keyboard-only smoke and axe/Playwright accessibility checks if tooling is available.

## lifeOS Note
lifeOS project-harness context informed the operating workflow only. This review did not produce a new durable Matthew preference or cross-project context update.
