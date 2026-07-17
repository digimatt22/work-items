# Work Items Platform Expansion Planning

## Status

Phase 0 completed — Phase 1 binding spike ready for owner kickoff

## Owner

Codex with Matthew as product/architecture approver.

## Branch

`codex/work-items-platform-expansion`

## Baseline

- Pre-work snapshot commit: `c008778`
- Annotated tag: `v0.0.0`
- The snapshot includes all previously uncommitted application, deployment, database, test, and documentation work.

## Summary And Scope

Review the current platform with Digi-CTO v0.3.0 and create a DPAF expansion pack for customer request intake through safe AI-agent delivery in the correct ChatGPT Work project workspace.

Included:

- Current-state and gap assessment.
- Product, data, integration, AI/MCP, security, and deployment direction.
- Digi-Portal plugin and project binding contract.
- Phased Codex build plan and kickoff prompts.
- Durable project-doc updates.

Excluded:

- Live deployment or external connector mutation.
- Automatic workspace/task creation in ChatGPT Work.

## Work-State Checklist

- [x] Preserve current state with commit and tag before planning edits.
- [x] Read harness and current product sources.
- [x] Load Digi-CTO standards and required workflow modules.
- [x] Create version-recorded DPAF expansion adapter and document set.
- [x] Complete canonical expansion PRD, roadmap, build plan, and kickoff prompts.
- [x] Update project-level context and architecture references.
- [x] Run structural validation and readiness review.
- [x] Commit-ready planning artifacts prepared as a coherent checkpoint.
- [x] Receive owner approval for one active binding per project, admin-only agent readiness, Digi-Portal naming, and marketplace destination.
- [x] Implement the Phase 0 schema, shared services, rollout gates, and admin diagnostic.
- [x] Complete full Phase 0 validation and checkpoint commit (`c64565b`).
- [x] Record the Phase 1 ChatGPT Work capability finding and revised next steps.

## Key Decisions And Assumptions

- First release is agent-initiated pull through a reusable plugin/MCP connection.
- `.work-items/project.json` stores public identifiers only; secrets remain in the connector host.
- Immutable Work Items project ID and revocable binding ID determine routing.
- Qualification and agent dispatch are separate from customer-visible pipeline status.
- Claims are exclusive time-limited leases with heartbeat and recovery.
- No direct merge, deployment, customer communication, or final closure authority in MVP.

## Validation Plan

- `scripts/check-doc-links.sh`
- `scripts/check-inbox.sh`
- `git diff --check`
- Search generated docs for unresolved template placeholders.
- Review `PRD.md`, `18-codex-build-plan.md`, and `19-implementation-kickoff-prompts.md` against the Digi-CTO Codex readiness rubric.

Completed evidence:

- Prisma schema validation and clean four-migration deployment to a disposable PostgreSQL database.
- Safe migration `0004_agent_delivery_foundation` upgrade of the local development database.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` (38 tests), and `pnpm build`.
- Desktop and 390px mobile visual inspection with no console warnings/errors or horizontal overflow.
- `scripts/check-doc-links.sh`, `scripts/check-inbox.sh`, and `git diff --check`.

## Human Validation

- Owner: Matthew
- Steps: review the Phase 1 capability check and select the internal project plus development OAuth/app-registration target for the binding spike.
- Expected result: authorize Task 1.1 plus the narrow Task 1.2 `binding.get`/`binding.verify` spike.
- Evidence location: `docs/reviews/digi-portal-phase-1-capability-check-2026-07-17.md`.
- Blocks implementation: Phase 1 only
- Blocks this planning deliverable: no

## Review And Closeout

- No `origin` remote is configured, so PR creation and remote review are not available.
- Planning artifacts will be committed locally and left ready for human review.
- lifeOS MCP was not available in this session; no lifeOS context informed the plan and no durable lifeOS update was identified.
- Readiness report: `docs/reviews/work-items-platform-expansion-readiness-2026-07-17.md`.
- Phase 0 approvals received on 2026-07-17: one active binding per project; admins-only agent-ready qualification.
- Plugin identity: `Digi-Portal` / `digi-portal`; future private marketplace destination: `/Users/mwood/Documents/Digicolony/digicolony-codex-marketplace`.
- Phase 0 implementation checkpoint: `c64565b`.
- Phase 1 capability check confirms a remote MCP/OAuth plugin is supported, with server-side binding authorization for hosted Work mode and an additional repository-config assertion for local sessions.
