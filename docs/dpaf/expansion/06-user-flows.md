# User Flows

## Primary Flows
### Customer to ready queue
1. Customer submits a Bug or Feature against a visible project.
2. Work Items creates the canonical work item in Reported state.
3. Operator reviews clarity, attachments, sensitivity, priority, and project routing.
4. Operator requests clarification or records acceptance criteria and marks the item agent-ready.
5. The item appears only in that project's ready queue.

### Workspace binding
1. Project owner opens Integrations and creates a pending binding.
2. Work Items generates a non-secret config payload containing platform URL, project ID, and binding ID.
3. Owner commits `.work-items/project.json` to the intended repository/workspace.
4. The plugin reads the config and calls `bindings.verify` using its separately stored credential.
5. Work Items compares credential scope, binding ID, project ID, and environment; owner confirms activation.

### Agent pull and delivery
1. Agent invokes `work_items.next` in the project workspace.
2. Plugin resolves config, verifies binding, and lists eligible items.
3. Agent claims one item; server creates a time-limited lease and attempt.
4. Agent receives a sanitized work package and implements locally.
5. Agent heartbeats, posts concise progress/questions, and attaches validation evidence.
6. Agent marks the attempt `ready_for_review`; a human reviews and decides merge/release.
7. Work Items updates customer-safe status without exposing internal AI details.

## Edge Cases
- Wrong or missing config: no work is returned; diagnostics identify the mismatch without leaking another project.
- Claim conflict: second agent receives current lease state and may not mutate the dispatch.
- Agent crash: lease expires and item returns to eligible state after a cooldown.
- Requirement ambiguity: agent posts a blocking question and releases or parks the claim.
- Malicious attachment/text: content is treated as untrusted data and never as system instruction.
- Revoked binding/credential: all tools fail closed; active claims are cancelled or quarantined.
- Validation failure: attempt records evidence and returns to in-progress or blocked, not done.

## Permission Variants
- Only admins/operators qualify work and override routing.
- Only a credential scoped to the active binding can list or claim project work.
- Agents can update dispatch state, comments, evidence, and permitted work-item fields; they cannot bind projects, expose AI logs, merge, deploy, or close customer requests in MVP.
- Project owners approve binding activation and production-impacting actions.
