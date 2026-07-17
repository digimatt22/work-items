# Roadmap

## MVP
### Phase 0 — Contract and trust foundation

- Approve ADRs for project binding, dispatch/lease semantics, and plugin authority.
- Define `.work-items/project.json` schema and mismatch behavior.
- Add additive data model, services, permissions, audit invariants, and feature flags.
- Deliver admin binding setup in read-only/verification mode.

### Phase 1 — Read-only Work Items plugin

- Package a reusable `work-items` Codex/ChatGPT Work plugin with connection setup and a small operator skill.
- Connect to the Work Items MCP endpoint with a per-binding credential.
- Implement `binding.get`, `binding.verify`, `queue.list`, `queue.next`, and `work_items.get`.
- Prove an agent in Project A cannot discover Project B.

### Phase 2 — Safe claim and delivery loop

- Add qualification UI and ready queue.
- Implement atomic claim, heartbeat, release, expiry recovery, progress, questions, evidence, and ready-for-review.
- Add dispatch/admin activity screens and client-safe status projection.
- Pilot on one internal DigiColony project before customer work.

## Phase 2
### Phase 3 — Operational maturity

- Credential rotation/revocation runbooks, outbox worker, alerts, queue health, retry/quarantine.
- CI and delivery evidence adapters for commit, branch, PR, and test status.
- Policy templates by project and work type.
- Human review workflow for accept, request changes, release, and customer response.

### Phase 4 — Assisted triage and routing

- Duplicate detection, clarity scoring, acceptance-criteria suggestions, and sensitivity flags.
- AI may recommend routing, but an explicit project ID remains authoritative.
- Evaluate event-driven wakeups only after pull safety and observability meet targets.

## Future Options
- Dependency-aware multi-item planning.
- Multi-agent role handoffs among implementation, test, security, and review agents.
- Portfolio capacity and cycle-time analytics.
- Customer voting, impact scoring, changelogs, and release notes.
- Bidirectional GitHub/Atlassian synchronization as adapters, not alternate sources of truth.
- Optional ChatGPT Work task/project automation if a supported API becomes available and is approved.
- Commercial multi-tenant Work Items control plane for client organizations.

## Deferred Work
- Autonomous merge/deploy/release.
- Multiple active repository bindings for one project.
- Cross-project agent queues.
- Customer-visible AI identity or tool history.
- Automatic attachment execution or unsandboxed content extraction.
- Complex workflow designer and custom RBAC.
