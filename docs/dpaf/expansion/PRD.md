# PRD

## Purpose
Define the expansion of Work Items from a customer intake and operations application into the trusted control plane that routes qualified bug and feature requests to authorized AI agents in the correct ChatGPT Work project workspace.

## Source Inputs
- `00-project-charter.md`
- `01-product-vision.md`
- `03-discovery-notes.md`
- Architecture documents under this DPAF docs folder
- Specialist artifacts accepted by the CTO Agent, when present
- Existing DPAF pack, accepted ADRs, launch decisions, current schema/services, and deployed application behavior
- User expansion goal recorded on 2026-07-17

## Facts
- Work Items is a deployed Next.js/Prisma/PostgreSQL application with customer Bug/Feature intake, admin work management, comments/assets, status reporting, Auth.js roles, and shared service contracts.
- Work items already belong to immutable project records under clients.
- The architecture already reserves `packages/mcp`, scoped MCP identities, `ActivityEvent`, and `AiAction`.
- The MCP package is a contract placeholder; no production MCP server or reusable Work Items plugin exists.
- No dispatch, qualification, claim/lease, delivery-attempt, or project-binding data model exists.
- The repository has no configured remote or CI; production assets are not durable across container replacement.
- The current repo contains no verified ChatGPT Work API for automatically creating project tasks or selecting a workspace.

## Decisions
- Work Items remains the canonical request, routing, dispatch, and audit record; project repositories remain the implementation source.
- The first integration is a reusable Work Items plugin using MCP and an agent-initiated pull workflow.
- Each target repository/workspace contains `.work-items/project.json` with a Work Items project ID, binding ID, platform URL, schema version, and environment. It contains no secret.
- Server-side `ProjectBinding` state and a separately stored connector credential must agree with the file before any work is returned.
- Qualification is a human-controlled gate. Agents may not self-approve raw customer reports in MVP.
- Agent dispatch state is separate from customer-facing pipeline status.
- A claim is an exclusive expiring lease. Heartbeats extend it; expiry/release makes recovery possible.
- All plugin/MCP logic calls shared services and policies used by the web path.
- Agent progress and evidence are append-only and admin-only; customer-safe status is projected separately.
- MVP agents cannot activate bindings, merge, deploy, contact customers, or finally close work items.
- New ADRs must preserve binding, dispatch/lease, and authority decisions before implementation.

## Assumptions
- One active repository/workspace binding per Work Items project is sufficient for the internal pilot. If false, the uniqueness and queue model must change before migration.
- ChatGPT Work/Codex can install the plugin in a project workspace, read the repository config, and store a connector credential outside Git. If false, Phase 1 needs a different onboarding handshake.
- Manual/private plugin distribution is acceptable for the first pilot. If false, marketplace packaging becomes a Phase 1 dependency.
- A 30-minute heartbeat-based lease is suitable for initial tests. It remains configurable and should be tuned from pilot data.
- One internal DigiColony project can be used before any external customer rollout.

## Users And Workflows
### Customer reporter

- Submits a Bug or Feature through the existing report flow and adds comments/assets.
- Sees understandable customer-safe status and requests for clarification.
- Never sees agent identity, tool calls, claim state, internal summaries, or audit metadata.

### Admin/triager

- Reviews new reports in the Intake Queue, confirms project, captures acceptance criteria and sensitivity, and qualifies items.
- Creates and manages project bindings, handles blocked questions, monitors claims, and reviews evidence.
- May override routing and recover/quarantine dispatches with audited actions.

### Project owner

- Adds the generated non-secret config to the intended repository/workspace and confirms binding activation.
- Reviews architecture-impacting work, evidence, merge/release, and production actions.

### Implementation agent

- Runs in a configured project workspace, verifies the binding, lists/gets eligible work, atomically claims one item, and receives a sanitized work package.
- Heartbeats while active; posts concise progress, blockers, and typed evidence; releases or marks ready for review.
- Cannot enumerate other projects or exceed its binding/tool/lease scope.

### Failure and recovery

- Mismatch/revocation fails closed without leaking record existence.
- Concurrent claim returns `CLAIM_CONFLICT`.
- Expired claims recover after cooldown while preserving prior evidence.
- Ambiguous or unsafe work is blocked/quarantined for a human.

## Requirements
### R1 — Explicit project binding (MVP)

- The system shall bind a Work Items project to a repository/workspace using immutable project and revocable binding IDs.
- The plugin shall verify file metadata, credential grant, server binding, and environment.
- Wrong, missing, inactive, or revoked bindings return no queue data.

### R2 — Qualification gate (MVP)

- Raw customer requests are never agent-eligible by default.
- An authorized human records readiness, acceptance criteria, implementation notes, sensitivity, and version.
- Material request changes invalidate or version qualification according to a defined transition rule.

### R3 — Bound-project queue and work package (MVP)

- Agents list/get only eligible work for the verified binding.
- Work packages include allowlisted request, qualification, project context, comments/assets metadata, and version/provenance.
- Customer content is explicitly marked untrusted and cannot alter system/tool policy.

### R4 — Exclusive recoverable claim (MVP)

- Claim acquisition is atomic and idempotent, with at most one live lease per dispatch.
- Lease token is returned once and stored hashed; heartbeat, expiry, release, retry, and quarantine are supported.
- Only the current lease owner can mutate the attempt.

### R5 — Audited delivery loop (MVP)

- Agents append concise progress, blocking questions, evidence, and ready-for-review state.
- Every mutation writes domain state, ActivityEvent, and AiAction atomically with request/agent/binding/tool attribution.
- Raw reasoning/chain-of-thought is neither requested nor stored.

### R6 — Human authority and customer-safe projection (MVP)

- Humans activate/revoke bindings, qualify work, approve review, merge/release, deploy, communicate with customers, and finally close requests.
- Customer views show permitted state/results but no internal AI activity.

### R7 — Operational controls (pilot and hardening)

- Feature flags separately control binding, reads, claims, and delivery writes.
- Credentials rotate/revoke; queue/lease/audit metrics and alerts exist before production.
- A reliable outbox supports future webhooks without coupling core transactions to external delivery.

### R8 — Assisted automation (future)

- AI may recommend duplicates, routing, clarity, acceptance criteria, and sensitivity but does not override explicit project identity or human qualification.
- Event-driven agents and supported ChatGPT Work task automation require a later capability review and ADR.

## Architecture Summary
- Continue the TypeScript monorepo, Next.js App Router, Prisma, and PostgreSQL.
- Add ProjectBinding, WorkQualification, AgentDispatch, AgentClaim, DeliveryAttempt, DeliveryEvidence, and OutboxEvent without replacing WorkItem or customer pipeline state.
- Keep `packages/mcp` as a thin adapter over new shared services; initial Streamable HTTP hosting may share the web deployment.
- Build a reusable `work-items` plugin that reads `.work-items/project.json` and uses a separately stored binding credential.
- Start with read-only binding/queue/context tools, then feature-flag lease and delivery writes.
- Use additive migrations, stable error codes, idempotency, optimistic versions, atomic audit, redaction, and fail-closed authorization.
- Sheldon may host the internal pilot; customer production is blocked on durable storage, secrets/rotation, CI, backups, retention, and incident ownership.

## Security And Permissions
- User session roles govern web administration; service-principal/binding/tool scopes govern plugin/MCP access; lease capability governs delivery writes.
- Credentials never enter Git or logs. Lease tokens are stored hashed. Tool responses are project-scoped and minimized.
- Customer text, comments, filenames, attachment metadata, and extracted content are untrusted input and must be delimited, scanned where applicable, and excluded from instruction priority.
- Binding activation/revocation, qualification, merge, deployment, final closure, and customer communication require human authority in MVP.
- Audit includes request ID, agent, binding, credential grant, tool, scope decision, affected entity, state transition, safe result, timestamp, and latency. It excludes secret values and chain-of-thought.

## Acceptance Criteria
- A plugin installed in Project A verifies its binding and cannot list or infer Project B data.
- `.work-items/project.json` validates against a versioned schema and contains no credential.
- Only a human-qualified item appears in the ready queue.
- Two simultaneous claim attempts yield one success and one conflict.
- A crashed agent's lease expires and the item becomes safely recoverable without deleting attempt evidence.
- An expired/revoked/mismatched credential cannot read or write project work.
- Every agent mutation has linked activity and AI audit records; audit-write failure fails the mutation.
- A client user can see customer-safe work state but no AI identity, tools, claims, prompts, or audit.
- An agent can post evidence and request review but cannot merge, deploy, contact the customer, or finally close the work item through MVP tools.
- An internal pilot completes success, ambiguity/release, conflict, and expiry-recovery scenarios before customer rollout.

## Validation Plan
- Unit: state machine, config, policy, redaction, ranking, idempotency, expiry, and audit invariants.
- Integration: database constraints, shared web/MCP authorization, binding handshake, claim concurrency, recovery, and work-package isolation.
- End-to-end: admin qualification/binding/dispatch, client visibility, clean plugin install, agent success/failure scenarios.
- Manual: real ChatGPT Work project integration, credential rotation/revocation, crash recovery, audit inspection.
- Human-only review: Matthew approves architecture/authority, validates workspace onboarding, and accepts internal pilot evidence.

## Risks
- **Critical — cross-project leakage:** enforce binding and client/project filters at query construction; adversarial isolation tests.
- **Critical — duplicate implementation:** transactional lease invariant and idempotency; concurrency tests.
- **High — prompt injection/data leakage:** allowlisted context, untrusted delimiters, scanning/quarantine, no chain-of-thought storage.
- **High — permission drift:** one shared service/policy layer for web and MCP.
- **High — unaudited side effects:** state and audit in one transaction; fail closed.
- **High — unsupported ChatGPT Work assumptions:** capability spike before Phase 1; plugin-initiated pull remains fallback.
- **High — non-durable assets:** limit internal pilot or add durable object storage before external use.
- **Medium — stale claims:** heartbeat, expiry, cooldown, operator recovery, alerts.
- **Medium — plugin/server version drift:** schema negotiation, minimum compatible versions, upgrade diagnostics.

## Open Questions
See `17-open-questions.md`. Phase 0 needs confirmation of the one-binding pilot model and qualification authority. Phase 1 needs a verified ChatGPT Work config/credential surface and distribution choice. Production additionally requires secrets ownership, retention, CI/backups/incident ownership, and durable asset storage.
