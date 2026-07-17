# Implementation Kickoff Prompts

## Purpose
Provide short kickoff commands and detailed Codex prompts for each approved implementation phase.

## Usage
Use the short command for the phase you want to start. The implementation agent should read the matching full prompt before editing code.

## Source Documents
These prompts were generated from the approved planning sources:
- `PRD.md`
- `18-codex-build-plan.md`
- `17-open-questions.md`
- Accepted ADRs
- Relevant architecture docs
- Accepted specialist artifacts, when relevant
- `04-domain-model.md`
- `08-database-design.md`
- `10-mcp-specification.md`
- `11-ai-architecture.md`
- `13-backend-architecture.md`
- Existing `docs/adr/` and `docs/ARCHITECTURE.md`

## Phase Prompts

### Phase 0: Contract And Trust Foundation

#### Readiness
- Blocking questions resolved: yes — one-binding model and admins-only qualification are confirmed.
- Human approvals complete: Matthew approved the Phase 0 authority boundaries.
- Validation commands known: yes.
- Non-goals confirmed: no plugin distribution or live agent mutations.

#### Short Command
```text
Use the DPAF implementation kickoff prompt for Phase 0 in docs/dpaf/expansion/19-implementation-kickoff-prompts.md.
```

#### Full Prompt
```text
Set a goal: establish the project-binding, qualification, dispatch, lease, evidence, and audit contracts with agent mutations disabled by default.

Use these implementation sources:
- docs/dpaf/expansion/PRD.md
- docs/dpaf/expansion/18-codex-build-plan.md
- docs/dpaf/expansion/17-open-questions.md
- docs/dpaf/expansion/04-domain-model.md
- docs/dpaf/expansion/08-database-design.md
- docs/dpaf/expansion/10-mcp-specification.md
- docs/adr/

Milestone:
The schema, ADRs, services, policies, feature flags, and admin binding diagnostics are implemented and independently reviewable.

Scope:
1. Record binding, dispatch/lease, and agent-authority ADRs.
2. Add additive Prisma models/migration and repositories.
3. Add shared validation, policy, transition, work-package, and audit services.
4. Add disabled-by-default feature flags and pending-binding admin diagnostics.

Acceptance criteria:
- One active binding and one active claim invariants are enforceable.
- Project config schema contains no credential.
- Shared services fail closed and write audit atomically.
- No MCP agent mutation is enabled.

Validation:
- `pnpm prisma:generate`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `scripts/check-doc-links.sh`

Human review:
- Matthew reviews ADRs, schema, state machine, and authority boundary before Phase 1.

Stop conditions:
- Stop if a blocking open question is encountered.
- Stop before changing architecture, data contracts, security boundaries, or AI/MCP authority beyond the approved sources.

Non-goals:
- Plugin packaging, ChatGPT Work onboarding, live claims, AI triage, merge, deployment, and customer communication.

Do not treat this as a blank project. Follow the DPAF docs, accepted ADRs, and existing repository conventions. Keep implementation conservative and scoped to Phase 0.
```

### Phase 1: Read-Only Plugin And Binding

#### Short Command
```text
Use the DPAF implementation kickoff prompt for Phase 1 in docs/dpaf/expansion/19-implementation-kickoff-prompts.md.
```

#### Full Prompt
```text
Set a goal: prove the reusable Digi-Portal plugin can verify the current project workspace and read only that project's eligible work packages.

Use these implementation sources:
- docs/dpaf/expansion/PRD.md
- docs/dpaf/expansion/10-mcp-specification.md
- docs/dpaf/expansion/13-backend-architecture.md
- docs/dpaf/expansion/14-testing-strategy.md
- docs/dpaf/expansion/18-codex-build-plan.md

Milestone:
A clean internal project can install the plugin, authenticate through a project-bound OAuth grant, verify the binding, and use read-only queue/context tools without discovering any other project. Local repository sessions also verify `.work-items/project.json`.

Scope:
1. Run the plugin-creator workflow and scaffold `digi-portal`.
2. Implement server-side OAuth grant binding plus local config parsing when a repository workspace is available.
3. Implement binding verification and read-only MCP tools/resources.
4. Complete clean-workspace, mismatch, revocation, and cross-project isolation tests.

Acceptance criteria:
- Repository config contains identifiers only.
- Hosted Work mode does not depend on local repository config.
- Mismatched or revoked binding fails closed.
- Read tools return only the bound project's sanitized data.
- No claim or delivery write tool is enabled.

Validation:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- plugin validation and clean-workspace smoke test
- private marketplace validation in `/Users/mwood/Documents/Digicolony/digicolony-codex-marketplace`

Human review:
- Matthew verifies installation and binding in the actual ChatGPT Work project surface.

Non-goals:
- Claims, progress writes, autonomous task creation, merge, deploy, or customer communication.
```

### Phase 2: Safe Claim And Delivery

#### Short Command
```text
Use the DPAF implementation kickoff prompt for Phase 2 in docs/dpaf/expansion/19-implementation-kickoff-prompts.md.
```

#### Full Prompt
```text
Set a goal: let one authorized agent exclusively claim qualified work and return progress, questions, and evidence for human review.

Use these implementation sources:
- docs/dpaf/expansion/PRD.md
- docs/dpaf/expansion/06-user-flows.md
- docs/dpaf/expansion/08-database-design.md
- docs/dpaf/expansion/10-mcp-specification.md
- docs/dpaf/expansion/11-ai-architecture.md
- docs/dpaf/expansion/14-testing-strategy.md
- docs/dpaf/expansion/18-codex-build-plan.md

Milestone:
An internal project completes a success, claim-conflict, ambiguity/release, and expired-claim recovery scenario with a complete admin-only audit trace.

Scope:
1. Add qualification and ready-queue UI.
2. Add atomic claim, heartbeat, release, expiry recovery, and quarantine.
3. Add progress, question, evidence, and ready-for-review tools.
4. Add dispatch UI and customer-safe status projection.
5. Run and record the internal pilot.

Acceptance criteria:
- At most one live claim exists per dispatch.
- Expired/abandoned claims recover without losing evidence.
- Only the lease owner may mutate an attempt.
- Every agent mutation has ActivityEvent and AiAction attribution.
- Client users see no agent identity, tool, lease, or audit metadata.

Validation:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- focused concurrency and MCP integration tests
- focused Playwright role-visibility scenarios
- `pnpm build`

Human review:
- Matthew approves pilot evidence and authority behavior before any customer rollout.

Non-goals:
- Autonomous merge, deploy, customer communication, AI qualification approval, or external production launch.
```

## Open Questions

Do not start a phase until its blocking questions in `17-open-questions.md` are resolved or the human owner explicitly accepts the documented assumption.
