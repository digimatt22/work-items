# Testing Strategy

## Automated Tests
- Unit tests for eligibility, ranking, transition matrix, config parsing, scopes, redaction, idempotency, and lease expiry.
- Property/concurrency tests proving at most one active claim.
- Schema/migration tests and audit-write invariants.
- MCP tool contract snapshots and stable error-code tests.

## Integration Tests
- Web and MCP routes call the same services and produce equivalent authorization results.
- Binding handshake rejects mismatched project, binding, environment, and credential.
- Claim transaction, heartbeat, expiry, release, retry, and quarantine paths.
- Work package excludes cross-client, admin-only, and unrelated context.
- Every agent mutation creates ActivityEvent and AiAction atomically.

## AI Evaluations
- Prompt-injection corpus in customer descriptions, comments, filenames, and extracted text.
- Labeled routing/qualification recommendation set if a triage assistant is added.
- Work-package sufficiency and evidence-quality rubric.
- Regression evaluation by model/agent/plugin version.

## Manual Validation
- Admin creates and verifies a binding from a real project workspace.
- Agent pulls, claims, updates, and releases a seeded work item.
- Human confirms client views reveal customer-safe status only.
- Operator rotates/revokes a credential and verifies immediate failure.
- Crash simulation proves expired work becomes recoverable.

## Acceptance Evidence
- Automated test logs in the execution plan/CI.
- Screenshots for intake, integration, and dispatch states.
- Audit query showing complete attribution for one delivery attempt.
- Human sign-off from Matthew on binding UX and authority boundaries.
