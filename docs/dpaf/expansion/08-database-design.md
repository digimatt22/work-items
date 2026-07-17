# Database Design

## Tables Or Collections
- `ProjectBinding`: project-to-workspace/repository association and activation state.
- `WorkQualification`: versioned readiness decision and normalized acceptance criteria.
- `AgentDispatch`: durable agent-delivery state independent of pipeline status.
- `AgentClaim`: lease owner, token hash, expiry, heartbeat, release reason.
- `DeliveryAttempt`: bounded execution outcome.
- `DeliveryEvidence`: commits, branches, PRs, commands, test summaries, screenshots, or notes.
- `OutboxEvent`: reliable integration event publishing.
- Existing `ActivityEvent` and `AiAction` remain the audit system of record.

## Fields
Key fields:

- `ProjectBinding`: `id`, `projectId`, `kind`, `environment`, `repositoryRef`, `workspaceRef?`, `configFingerprint`, `status`, `verifiedAt?`, `activatedAt?`, `revokedAt?`, timestamps.
- `WorkQualification`: `id`, `workItemId`, `version`, `state`, `acceptanceCriteria`, `implementationNotes`, `sensitivity`, `estimatedSize?`, `qualifiedById`, timestamps.
- `AgentDispatch`: `id`, `workItemId`, `bindingId`, `state`, `priority`, `availableAt`, `lastErrorCode?`, timestamps.
- `AgentClaim`: `id`, `dispatchId`, `agentId`, `leaseTokenHash`, `claimedAt`, `expiresAt`, `lastHeartbeatAt`, `releasedAt?`, `releaseReason?`.
- `DeliveryAttempt`: `id`, `dispatchId`, `claimId`, `sequence`, `state`, `summary?`, `startedAt`, `finishedAt?`.
- `DeliveryEvidence`: `id`, `attemptId`, `kind`, `label`, `uri?`, `metadata`, `createdAt`.

## Indexes And Constraints
- Unique active binding by `(projectId, kind, environment)` using an application invariant or partial unique index.
- Unique qualification `(workItemId, version)`.
- One active claim per dispatch; enforce transactionally and with a partial unique index where PostgreSQL permits.
- Index ready queue by `(bindingId, state, priority, availableAt)`.
- Index lease recovery by `(expiresAt, releasedAt)`.
- Index attempts by `(dispatchId, sequence)` and activity by entity/time.
- Store lease tokens only as hashes; never store connector secrets in project config.

## Retention And Archive
- Revoke rather than delete bindings and credentials.
- Preserve qualification, attempts, evidence, and audit after work item archive.
- Define production retention for raw tool metadata and attachment-derived context before launch.
- Customer deletion/export policy remains a production blocker.

## Migration Notes
1. Add tables without altering current work-item behavior.
2. Backfill no dispatch records automatically; qualification creates them intentionally.
3. Seed a development binding only in non-production environments.
4. Add service-layer invariants and concurrency tests before exposing claim tools.
5. Roll out read-only binding verification before enabling mutations.
