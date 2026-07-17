# API Specification

## Routes
- `POST /api/integrations/project-bindings` create pending binding (admin/project owner).
- `POST /api/integrations/project-bindings/:id/verify` verify config/credential handshake.
- `POST /api/integrations/project-bindings/:id/activate|revoke|rotate` lifecycle operations.
- `GET /api/projects/:projectId/agent-queue` admin diagnostics only.
- MCP remains the preferred agent interface; HTTP routes support web administration and health.

## Inputs
Use versioned JSON schemas. Binding creation accepts project, environment, repository identity, and optional workspace reference. Never accept a plaintext long-lived secret into repository config. All mutation requests include an idempotency key.

## Outputs
Return typed envelopes with `data`, `requestId`, and stable `error.code`. Binding responses may return a copyable non-secret config payload. Agent work packages are returned only through scoped MCP tools and redact internal/customer data not needed for execution.

## Authorization
- Auth.js user session and server-side role policies for admin routes.
- Scoped connector/service-principal credential for plugin/MCP calls.
- Project ID and binding ID must both match credential grants.
- Mutations additionally require tool scope and, for claim operations, a valid lease token.

## Errors
Stable codes include `BINDING_NOT_FOUND`, `BINDING_MISMATCH`, `BINDING_NOT_ACTIVE`, `CREDENTIAL_REVOKED`, `ITEM_NOT_ELIGIBLE`, `CLAIM_CONFLICT`, `LEASE_EXPIRED`, `IDEMPOTENCY_CONFLICT`, `VALIDATION_FAILED`, and `RATE_LIMITED`. Responses must not disclose cross-project existence.
