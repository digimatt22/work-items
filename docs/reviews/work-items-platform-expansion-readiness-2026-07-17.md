# Work Items Platform Expansion Readiness Review

## Review Scope

- DPAF expansion pack under `docs/dpaf/expansion/`.
- Current repository architecture, schema, shared service, MCP placeholder, deployment, and validation constraints.
- Digi-CTO v0.3.0 PRD, architecture, security, AI, and Codex-readiness gates.

## Recommendation

**Planning package: ready for human review.**

**Implementation: conditionally ready.** Phase 0 can start after Matthew confirms the one-active-binding pilot model and admins-only qualification. Phase 1 additionally requires a short capability spike in the actual ChatGPT Work project surface. Production/customer rollout is not approved.

## PRD Quality Scores

| Area | Score | Rationale |
| --- | ---: | --- |
| Product outcome and users | 5 | Control-plane outcome, four human/agent roles, and user value are explicit. |
| MVP scope and non-goals | 5 | Plugin pull, binding, qualification, claims, and evidence are bounded; merge/deploy/customer communication are excluded. |
| Testable requirements | 5 | Eight requirements map to observable acceptance criteria and validation. |
| Data model and permissions | 4 | Entities, ownership, indexes, scopes, leases, and authority are designed; retention and final schema await implementation ADRs. |
| AI/MCP behavior | 5 | Tools, resources, context boundaries, human approval, audit, and evaluations are explicit. |
| Acceptance criteria | 5 | Isolation, concurrency, recovery, audit, customer visibility, and pilot scenarios are measurable. |
| Risks and questions | 5 | Critical/high risks and phase-specific blocking decisions are preserved. |

## Codex Readiness Scores

| Area | Score | Rationale |
| --- | ---: | --- |
| Files to read first | 5 | Build plan and prompts name canonical sources and code areas. |
| Small ordered tasks | 4 | Phase 0–2 tasks are independently reviewable; implementation may split schema/service/UI tasks further. |
| Files to create/edit | 4 | Known packages and proposed plugin path are identified; exact adapter files depend on Phase 1 spike. |
| Acceptance criteria | 5 | Each phase and major task has a done state. |
| Validation | 5 | Static, unit, integration, concurrency, e2e, manual, and human checks are assigned. |
| Kickoff prompts | 5 | Phase 0–2 have executable prompts with scope and non-goals. |
| Question separation | 5 | Specification, implementation, non-blocking, and production questions are distinct. |
| Existing conventions | 5 | Plan preserves shared-service, audit, role, deployment, docs, and validation conventions. |

## Architecture Review

- Product fit: pass. Pull-based MVP minimizes dependence on external automation and leaves out event-driven orchestration.
- Boundaries: pass. Work Items owns control-plane state; project workspaces own implementation; plugin/MCP is an adapter.
- Data: pass with production blocker. Relationships, constraints, migration order, archive behavior, and audit preservation are defined; retention/export/deletion need approval.
- Operations: pass for internal planning. Feature flags, observability, rotation/revocation, and rollback are specified; CI, backups, durable assets, and incident ownership block production.
- ADRs: candidates identified. Binding, dispatch/lease, and authority ADRs are the first Phase 0 task.

## Security And AI Review

- Access control: pass. User roles, service-principal/binding/tool scopes, and lease capability are layered.
- Data protection: conditional pass. Secrets/log minimization and cross-project isolation are designed; production retention and durable storage remain open.
- AI/MCP: pass. Customer input is untrusted, tools are bounded, risky side effects require humans, and private unrelated context is excluded.
- Operations: conditional pass. Rotation, revocation, logging, rollback, and alert expectations exist; production secret owner and incident process remain open.
- AI readiness: pass for MVP design. Roles, context sources, provenance, escalation, tools, audit, and evaluation are explicit.

## Required Decisions Before Phase 0

1. Confirm one active repository/workspace binding per Work Items project for the pilot.
2. Confirm only admins may qualify work as agent-ready in MVP.

## Required Spike Before Phase 1

Verify in an actual ChatGPT Work project that the proposed plugin can read the repository config and use a securely stored connector credential. If not, revise the handshake without weakening server-side binding verification.

## Production Blockers

- Durable asset storage.
- Secrets manager and credential rotation ownership.
- Retention, export, deletion, and audit policy.
- CI provider and required checks.
- Backup/restore evidence and incident owner.
- Successful internal pilot with security and authority sign-off.

## Validation Evidence

- Packaged Digi-CTO strict document validation: passed.
- Repository Markdown link check: passed.
- Inbox index check: passed.
- Git whitespace/error check: passed.
