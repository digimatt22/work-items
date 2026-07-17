# Deployment

## Environments
- Local: seeded PostgreSQL, development binding/credential, no external customer data.
- Sheldon development: first end-to-end connector target behind existing HTTPS route.
- Production: undefined; requires durable assets, secrets management, CI, backup/restore, and release ownership decisions.

## Secrets
- MCP signing/auth keys, credential pepper/encryption keys, database URL, Auth.js secrets, and optional webhook secrets live in the deployment secret store.
- `.work-items/project.json` contains identifiers and URLs only.
- Per-binding plugin credentials live in the connector/host credential store and are rotatable/revocable.

## CI/CD
No CI provider is selected. Before production, require migration validation, lint, typecheck, unit/integration tests, production build, MCP contract tests, and security checks. Deploy read-only binding diagnostics before enabling claim mutations.

## Observability
- Metrics: ready queue depth/age, claim conflicts, lease expiry, attempts per item, time to review, error rate by tool and binding.
- Logs: request ID, actor, binding, tool, decision, result code, latency; no secrets or raw sensitive payloads.
- Alerts: authorization spikes, repeated binding mismatch, stale claims, outbox backlog, audit-write failure.

## Rollback
- Feature flags independently control binding, queue reads, claims, and delivery writes.
- Revoke all plugin credentials and disable MCP mutations without rolling back customer intake.
- Database changes are additive in early phases.
- Roll back the app release while preserving dispatch/audit data; use explicit repair jobs for partial external effects.
