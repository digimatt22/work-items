# Backend Architecture

## Runtime
Extend the current TypeScript monorepo and PostgreSQL database. Host the first MCP Streamable HTTP endpoint with the web deployment if operationally simpler, while preserving `packages/mcp` as a separable adapter boundary.

## Services
- `ProjectBindingService`: create, verify, activate, revoke, and rotate.
- `QualificationService`: validate readiness and version work packages.
- `DispatchService`: enqueue, rank, claim, heartbeat, release, retry, and quarantine.
- `WorkPackageService`: sanitize and assemble agent context.
- `DeliveryEvidenceService`: append typed evidence.
- `AgentAuditService`: write linked activity and AI action records.
- `OutboxService`: reliably publish future events after database commit.

## Validation
- Shared Zod-style schemas for config, MCP input/output, qualification, evidence, and state transitions.
- Optimistic version on work packages and dispatches.
- Idempotency key on every mutation.
- Transactional claim acquisition and audit write.
- Server-calculated priority and eligibility; never trust client/plugin ranking fields.

## Authorization
- Reuse shared principal/policy helpers for web and MCP.
- Resolve credential to one service principal and active binding.
- Verify client, project, tool scope, lease ownership, and dispatch version on every write.
- Fail closed on missing binding, revoked credentials, expired leases, or audit-write failure.

## Jobs And Integrations
- Periodic lease reaper marks expired claims and schedules retry/cooldown.
- Outbox publisher enables future webhooks or event-driven agents.
- Credential rotation and audit export are operator runbooks.
- Attachment scanning/extraction, notifications, and automated ChatGPT Work task creation are future integrations.
