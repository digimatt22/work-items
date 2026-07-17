# Work Items Platform Expansion Planning

## Status

Ready for review

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
- Work Items plugin and project binding contract.
- Phased Codex build plan and kickoff prompts.
- Durable project-doc updates.

Excluded:

- Runtime implementation.
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

## Human Validation

- Owner: Matthew
- Steps: review the decisions and open questions in `docs/dpaf/expansion/PRD.md` and `17-open-questions.md`; confirm the one-workspace/one-project binding assumption, human approval boundaries, and whether plugin-first pull is the desired first milestone.
- Expected result: approve the architecture direction or record corrections before Phase 0 implementation.
- Evidence location: this plan or the future PR.
- Blocks implementation: yes
- Blocks this planning deliverable: no

## Review And Closeout

- No `origin` remote is configured, so PR creation and remote review are not available.
- Planning artifacts will be committed locally and left ready for human review.
- lifeOS MCP was not available in this session; no lifeOS context informed the plan and no durable lifeOS update was identified.
- Readiness report: `docs/reviews/work-items-platform-expansion-readiness-2026-07-17.md`.
