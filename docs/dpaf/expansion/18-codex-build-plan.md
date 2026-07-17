# Codex Build Plan

## Goal
Deliver a safe internal pilot in which a qualified customer request can be discovered and claimed only from its bound project workspace, worked by one authorized agent, and returned with auditable evidence for human review.

## Files To Read First
- `PRD.md`
- `17-open-questions.md`
- `04-domain-model.md`, `08-database-design.md`, `10-mcp-specification.md`, `11-ai-architecture.md`, `13-backend-architecture.md`, and `14-testing-strategy.md`
- Existing `docs/adr/`, `docs/ARCHITECTURE.md`, and `docs/prd/launch-decisions-addendum.md`
- `packages/db/prisma/schema.prisma`, `packages/shared/src/`, and `packages/mcp/src/`

## Phases
Each phase must be independently reviewable and should avoid mixing unrelated UI, data, backend, AI, deployment, and migration work.

### Phase 0: Foundation
- Outcome: approved contracts and additive server foundation with agent mutations disabled.
- Source docs: PRD, domain/database/backend/security sections, open questions.
- Scope: ADRs, config schema, migrations, binding/qualification/dispatch services, shared policies, audit invariants, feature flags.
- Non-goals: plugin distribution, live claims, UI polish, external automation.
- Blocking dependencies: confirm one active binding per project and admins-only qualification.
- Human review gate: schema, authority model, and state machine approval.

### Phase 1: Read-only plugin and binding verification
- Outcome: an installed plugin can verify the current project and read only its eligible work packages.
- Scope: plugin scaffold, MCP transport/auth, binding UI, read-only tools/resources, diagnostics, redaction tests.
- Non-goals: claim or delivery writes.
- Blocking dependencies: supported ChatGPT Work credential/config surface spike.
- Human review gate: cross-project isolation and install/onboarding test.

### Phase 2: Claim and evidence workflow
- Outcome: one agent can exclusively claim, heartbeat, release, and submit evidence for qualified work.
- Scope: qualification UI, write tools, lease reaper, dispatch view, client-safe status, e2e pilot.
- Non-goals: merge, deploy, customer communication, AI triage.
- Blocking dependencies: mandatory evidence policy and lease defaults may use documented pilot assumptions.
- Human review gate: security review and internal-project pilot acceptance.

### Phase 3: Operational hardening
- Outcome: the pilot can run reliably with rotation, alerts, outbox, retries, and documented recovery.
- Scope: outbox worker, metrics/alerts, rotation/revocation, backup/runbooks, CI evidence adapters.
- Non-goals: external customer production launch unless production blockers are resolved.
- Human review gate: production readiness decision.

## Tasks
### Task 0.1 — Record architecture decisions

- Files: new ADRs under `docs/adr/`; update canonical architecture/docs.
- Acceptance: binding identity, dispatch state machine, lease semantics, credential storage, and authority boundaries are decision-complete.
- Validation: `scripts/check-doc-links.sh`; human architecture approval.

### Task 0.2 — Add schemas and migrations

- Files: `packages/db/prisma/schema.prisma`, new migration, repository adapters, schema tests.
- Acceptance: additive models and constraints support active binding, qualification versions, one live claim, attempts, evidence, and outbox.
- Validation: `pnpm prisma:generate`; migration test against disposable database; `pnpm test`.

### Task 0.3 — Add shared contracts and services

- Files: `packages/shared/src/` modules for binding, qualification, dispatch, work packages, evidence, and policies.
- Acceptance: deterministic state transitions, idempotency, redaction, and atomic audit behavior are covered by unit/concurrency tests.
- Validation: `pnpm lint`; `pnpm test`.

### Task 0.4 — Add feature flags and admin diagnostics

- Files: web config, admin integration routes/components, service wiring.
- Acceptance: all agent tools disabled by default; admins can create a pending binding and view a non-secret config payload.
- Validation: focused unit/e2e tests; `pnpm build`.

### Task 1.1 — Scaffold the reusable Work Items plugin

- Files: proposed `plugins/work-items/` manifest, skill/instructions, MCP connection metadata, docs; use the plugin-creator workflow during implementation.
- Acceptance: plugin validates `.work-items/project.json`, never reads secrets from it, and provides actionable setup diagnostics.
- Validation: plugin manifest validation and clean-workspace smoke test.

### Task 1.2 — Implement MCP read surface

- Files: `packages/mcp/src/`, shared services, HTTP endpoint/runtime, contract tests.
- Acceptance: binding verify, queue list/next, and work-package get are scoped, redacted, audited, and stable.
- Validation: MCP contract tests, cross-project denial tests, production build.

### Task 1.3 — Pilot binding onboarding

- Files: `.work-items/project.schema.json`, example config, integration UI/docs.
- Acceptance: owner creates, verifies, activates, rotates, and revokes one internal binding; mismatch fails closed.
- Validation: manual clean-project install and audit evidence.

### Task 2.1 — Build qualification and ready queue

- Files: Prisma/repository as needed, shared qualification service, `/intake`, work-item detail.
- Acceptance: only authorized humans can make an item eligible; requirements and sensitivity are versioned.
- Validation: permission tests, browser tests, accessibility/visual review.

### Task 2.2 — Implement lease lifecycle

- Files: dispatch service, MCP claim/heartbeat/release tools, recovery job.
- Acceptance: atomic exclusive claim, token-hash verification, expiry, heartbeat, release, retry, and quarantine work under concurrency.
- Validation: concurrency/integration tests and crash simulation.

### Task 2.3 — Implement progress and evidence

- Files: evidence service, MCP tools, dispatch/activity UI, customer-safe projection.
- Acceptance: lease owner can append progress/questions/evidence and request review; customer cannot see AI metadata.
- Validation: role-visibility tests and complete audit trace for one attempt.

### Task 2.4 — Internal end-to-end pilot

- Scope: one DigiColony project, seeded requests, at least one success, one ambiguity/release, one claim conflict, one expired claim.
- Acceptance: routing, exclusivity, recovery, evidence, and human review meet success criteria.
- Validation: recorded pilot report and human approval before expansion.

## Validation
- Format/lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Unit: `pnpm test`
- Integration: focused database/MCP contract and concurrency suites
- End-to-end: focused Playwright admin, client visibility, binding, and delivery scenarios
- Manual: clean plugin install, config mismatch, credential rotation/revocation, crash recovery
- Human-only: architecture approval, authority review, workspace integration verification, pilot acceptance

## Implementation Kickoff Prompts
Generate `19-implementation-kickoff-prompts.md` after this build plan is approved. Each phase should have a short kickoff command and a detailed Codex prompt with sources, scope, acceptance criteria, validation commands, and non-goals.

## Assumptions
- Plugin source begins under `plugins/work-items/`; the implementation phase must use the plugin-creator skill and may revise the location through an ADR.
- MCP can initially share the web deployment while retaining a separable package boundary.
- Read-only integration ships before write authority.
- One internal project is available for a safe pilot.

## Risks
- Unsupported ChatGPT Work workspace/config behavior could change Phase 1 onboarding.
- Missing durable asset storage limits attachment-rich pilots.
- No remote/CI blocks normal review and automated gates.
- Lease and audit bugs could create duplicate or unattributable work; write tools stay feature-flagged until proven.

## Open Questions
- Blocking before implementation: one-binding assumption, plugin distribution path, supported host credential/config surface, qualification authority.
- Non-blocking during implementation: lease duration, customer-safe status projection, plugin repo location, evidence policy.
- Blocking before production: secrets/rotation ownership, retention, CI/backup/incident ownership, durable asset storage.
