# MCP Specification

## Applicability
MCP is the primary agent-facing protocol for the Work Items plugin. It is a thin adapter over shared application services and must not implement independent permissions or workflow rules.

## Tools
### Binding and diagnostics
- `work_items.binding.get`: read current bound project identity and health.
- `work_items.binding.verify`: prove config, credential, and server binding agree.

### Queue and context
- `work_items.queue.list`: list eligible summaries for the bound project.
- `work_items.queue.next`: return the highest-ranked eligible summary without claiming.
- `work_items.get`: fetch a sanitized work package and current version.

### Claim lifecycle
- `work_items.claim`: atomically create a lease and delivery attempt.
- `work_items.heartbeat`: extend a live lease.
- `work_items.release`: release with completed, blocked, superseded, or abandoned reason.

### Delivery
- `work_items.progress.add`: append a concise admin-only progress event.
- `work_items.question.add`: add a blocker/question for operator review.
- `work_items.evidence.add`: attach typed validation or delivery evidence.
- `work_items.ready_for_review`: finish the attempt and request human review.

No MVP tool merges code, deploys, contacts a customer, activates a binding, or marks a customer request finally done.

## Resources
- `workitems://binding/current`: public binding metadata and health.
- `workitems://queue/ready`: read-only eligible item summaries.
- `workitems://work-items/{id}/package`: versioned sanitized work package.
- `workitems://dispatches/{id}`: claim and attempt state for authorized agents/admins.

## Permissions
- New scopes: `bindings:read`, `queue:read`, `claims:write`, `progress:write`, `evidence:write`.
- Existing project/client scope remains mandatory.
- A plugin credential is issued to one active binding and cannot enumerate other projects.
- A lease capability is required for delivery mutations and expires with the claim.
- Read tools and write tools are declared distinctly for host approval UX.

## Audit And Approval
- Initial binding activation, credential rotation, release/merge, deployment, and final customer closure require human approval.
- Every MCP call records request ID, agent ID, tool name, binding, scope decision, affected entity, result code, timing, and safe summary.
- Raw chain-of-thought is never requested or stored.
- Tool inputs originating from customer content are labeled untrusted.
- Repeated authorization or prompt-injection signals quarantine the attempt for review.
