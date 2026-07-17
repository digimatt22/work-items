# AI Architecture

## AI Roles
- **Triage assistant (future):** recommends project, clarity gaps, duplicates, and acceptance criteria; cannot approve readiness.
- **Implementation agent:** claims approved work in a bound project and produces code/evidence.
- **Review assistant (future):** checks delivered evidence against acceptance criteria; cannot merge or release.
- **Human operator/project owner:** final authority for qualification, binding, release, and customer communication.

## Context Strategy
The work package is assembled server-side from allowlisted fields: customer request, type details, operator qualification, relevant comments/assets metadata, project context, accepted constraints, and current dispatch version. Repository instructions are loaded locally by the agent. Customer content is delimited and labeled as data, not instruction. Private lifeOS or unrelated project context is never copied into the package.

## Retrieval And Summaries
- Retrieve only records within the binding's project/client scope.
- Use deterministic project routing first; AI routing may recommend but not override the bound project.
- Summaries include provenance, source record IDs, generated time, and version.
- Attachment extraction is a separate, sandboxed future capability with file-type and prompt-injection controls.

## Human Approval
- Human qualifies the item and activates bindings.
- Agent may claim and work only after qualification.
- Human reviews `ready_for_review` evidence before merge, deployment, release, or customer closure.
- Policies may later allow low-risk auto-approval by repository, test coverage, and change class, but not in MVP.

## Evaluation
- Routing accuracy against a labeled set of requests.
- Work-package completeness and irrelevant-context rate.
- Prompt-injection resistance and sensitive-data leakage tests.
- Claim/recovery success under concurrent and failed agents.
- Acceptance-criteria coverage in evidence.
- Human acceptance rate, rework rate, cycle time, and escaped-defect rate by agent/version.
