# PRD Launch Decisions Addendum

This addendum records decisions made after review of the DPAF risk, decision, and open-question pack. It extends the canonical PRD for launch planning without changing the core product intent.

## Accepted Architecture Decisions

- Use the PRD monorepo structure: `apps/web`, `packages/db`, `packages/mcp`, `packages/ui`, `packages/shared`, `scripts`, `uploads`, `docs`, and `tests`.
- Keep web and MCP writes behind shared application services.
- Use a unified Work Item model with type-specific detail records for Bugs and Features.
- Use append-only `ActivityEvent` records and linked `AiAction` records for AI-originated actions.
- Use Auth.js with a local database-backed provider for launch.
- Build MCP as `packages/mcp`, reusable from an initial Next.js-hosted route or a later standalone service.
- Store asset metadata in PostgreSQL and physical objects behind a storage provider abstraction.

## Launch Permission Model

- Admin creates clients.
- Admin creates client users.
- Client users belong to exactly one client for launch.
- Client users can view all projects belonging to their client.
- Client users can create Bugs and Features, comment, upload assets, and view non-AI activity for their client projects.
- Client users cannot configure pipelines.
- Authorized AI agents may change work item status when their system and client scopes permit it.
- All AI actions are admin-only.

## MCP Authentication

Use OAuth 2.1-style bearer token authentication for MCP agent clients.

Each agent integration should be represented as a service principal or OAuth client with explicit scopes for:

- system access
- client access
- tool-family access
- privileged status changes

Local development may use development-issued bearer tokens, but those tokens must pass through the same scope and audit checks as production tokens.

## AI Visibility

Clients should not see:

- agent work
- agent use
- agent thoughts
- MCP tool calls
- AI audit records
- AI action metadata
- agent existence

Admins should be able to see all AI action audit records.

## MVP Asset Constraints

- Maximum file size: 100 MB per file.
- Maximum upload batch: 10 files per request.
- Allowed image types: PNG, JPEG, GIF, WebP.
- Allowed document/data types: PDF, TXT, Markdown, CSV, DOCX, XLSX.
- Allowed video types: MP4, MOV, WebM.
- Allowed log/archive types: LOG, JSON, ZIP.
- Block executable files, scripts, HTML uploads, and unknown binary formats.
- Generate basic previews for images only in MVP.
- Store metadata for other allowed file types and defer rich preview generation.

## Accepted Risk Mitigations

- Permission drift: shared policy functions and application services; permission tests for web and MCP paths.
- Audit gaps: all write services must create activity; integration tests must cover mutation audit behavior.
- Work item over-specialization: keep lifecycle, comments, assets, labels, watchers, and activity on unified Work Item.
- Storage coupling: introduce storage provider abstraction in Phase 1.
- Context ambiguity: define ownership and edit rules for human description, structured context, AI context, and AI summary; track summary provenance.
- Search leakage: apply permission filters at query construction and add search permission tests.

## Best-Practice Defaults

- Keep production auth provider-flexible; add SSO/OIDC when client requirements demand it.
- Store AI summaries with provenance before coupling to a specific model provider.
- Preserve assets while records are active or archived; do not hard-delete without a future retention policy.
- Keep client-facing AI visibility off by default unless an admin explicitly publishes content.
- Plan AWS around stateless app hosting, managed PostgreSQL, S3-compatible storage, managed secrets, and future worker capacity.
