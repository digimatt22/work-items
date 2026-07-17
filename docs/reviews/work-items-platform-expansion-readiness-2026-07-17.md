# Work Items Platform Expansion Readiness Review

## Review Scope

- DPAF expansion pack under `docs/dpaf/expansion/`.
- Current repository architecture, schema, shared service, MCP placeholder, deployment, and validation constraints.
- Digi-CTO v0.3.0 PRD, architecture, security, AI, and Codex-readiness gates.

## Recommendation

**Planning package: ready for human review.**

**Implementation: Phase 0 complete.** Matthew confirmed the one-active-binding pilot model and admins-only qualification. The Phase 1 host-capability check is complete and supports a narrow plugin/OAuth binding spike. Production/customer rollout is not approved.

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
- ADRs: pass. Binding, dispatch/lease, and authority decisions are accepted in ADRs 0008–0010.

## Security And AI Review

- Access control: pass. User roles, service-principal/binding/tool scopes, and lease capability are layered.
- Data protection: conditional pass. Secrets/log minimization and cross-project isolation are designed; production retention and durable storage remain open.
- AI/MCP: pass. Customer input is untrusted, tools are bounded, risky side effects require humans, and private unrelated context is excluded.
- Operations: conditional pass. Rotation, revocation, logging, rollback, and alert expectations exist; production secret owner and incident process remain open.
- AI readiness: pass for MVP design. Roles, context sources, provenance, escalation, tools, audit, and evaluation are explicit.

## Phase 0 Decisions

1. One active repository/workspace binding per Work Items project for the pilot: approved.
2. Only admins may qualify work as agent-ready in MVP: approved.
3. Plugin identity: `Digi-Portal` / `digi-portal`.
4. Private marketplace destination: `/Users/mwood/Documents/Digicolony/digicolony-codex-marketplace`.

## Phase 1 Capability Result

ChatGPT Work supports remote MCP-backed plugins and host-managed OAuth credentials. Hosted Work mode cannot read local Codex config, so its project scope must come from a server-side binding grant. Local repository sessions may additionally verify `.work-items/project.json`. The next spike will scaffold Digi-Portal and prove `binding.get`/`binding.verify` plus cross-project denial before queue reads.

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
- Phase 0 implementation, migration, 38-test suite, production build, and responsive visual review: passed; see `digi-portal-phase-0-completion-2026-07-17.md`.
- Phase 1 official capability check: passed with a host-specific binding design; see `digi-portal-phase-1-capability-check-2026-07-17.md`.
