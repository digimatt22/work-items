# ADR 0009: Agent Dispatch And Lease

## Status

Accepted

## Context

Customer-facing pipeline status cannot safely represent agent execution ownership. Multiple agents may discover the same eligible request, and crashed agents must not lock work forever.

## Decision

- Keep qualification and `AgentDispatch` separate from the customer-visible pipeline.
- Only an admin may create a ready qualification.
- A dispatch references the qualification version and active project binding selected when queued.
- Use a time-limited `AgentClaim` lease with a hashed capability token, heartbeat, expiry, release reason, and immutable delivery attempts.
- Enforce at most one live claim through a nullable unique `activeKey` equal to the dispatch ID while the lease is active.
- Acquire claims, update dispatch state, create delivery attempt, and write linked activity/AI audit in one serializable transaction.
- Preserve attempts and evidence after release, expiry, archive, or retry.

## Consequences

- Claim conflicts are deterministic and recoverable.
- Lease recovery requires a future reaper job and operational metrics.
- A nullable unique key is an explicit database invariant; release code must clear it transactionally.
- Agent tools remain disabled until Phase 2 concurrency and recovery tests pass.
