# Domain Model

## Vocabulary
- **Work item:** canonical customer/admin request.
- **Qualification:** human-approved statement that an item is clear and safe enough for agent work.
- **Project binding:** revocable association between a Work Items project and a repository/workspace identity.
- **Dispatch:** operational record describing whether and how an eligible item is being handled by an agent.
- **Claim:** exclusive, time-limited lease held by one agent execution.
- **Delivery attempt:** one bounded execution cycle with progress and evidence.
- **Work package:** sanitized, versioned context returned to an agent.

## Entities
- Existing: `Client`, `Project`, `WorkItem`, `Comment`, `Asset`, `ActivityEvent`, `AiAction`, `McpOAuthClient`.
- New: `ProjectBinding`, `WorkQualification`, `AgentDispatch`, `AgentClaim`, `DeliveryAttempt`, `DeliveryEvidence`, `IntegrationCredential` or external credential reference, and `OutboxEvent`.

## Relationships
- A project has zero or more historical bindings and at most one active binding per binding kind/environment.
- A work item has zero or one active qualification version and zero or more delivery attempts.
- A dispatch belongs to one work item and references the binding selected at claim time.
- A dispatch has at most one active claim lease.
- An attempt belongs to a dispatch and produces progress events and evidence.
- All agent-originated mutations produce `ActivityEvent` and linked `AiAction` records.

## Ownership And Lifecycle
- Project owners create/approve bindings; admins may revoke them.
- Operators qualify work; agents cannot self-qualify customer requests in MVP.
- Claims expire unless heartbeats extend them; completion and release close the lease.
- Delivery evidence is append-only; corrections create a new record.
- Work items follow existing archive policy; dispatch/audit records survive archive.
- Hard deletion and retention periods are unresolved before production.
