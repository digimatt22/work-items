# Architecture Plan

## Architecture Summary

Use a TypeScript monorepo with a shared domain and database layer. The web application and MCP server should call common application services rather than implementing separate business rules.

```text
apps/web
  Next.js App Router UI, server actions, route handlers

packages/mcp
  Streamable HTTP MCP server and tool adapters

packages/db
  Prisma schema, migrations, query helpers

packages/shared
  domain types, validation schemas, permission constants, activity event names

packages/ui
  reusable UI components

uploads
  local file storage during development
```

## Core Boundary

The application service layer should be the policy boundary.

Both web and MCP entry points should call services such as:

- `ClientService`
- `ProjectService`
- `WorkItemService`
- `CommentService`
- `AssetService`
- `ActivityService`
- `SummaryService`
- `SearchService`

These services should enforce permissions, write activity, and return typed domain results.

## Data Model

Initial Prisma model groups:

- Identity: `User`, `Account`, `Session`, `VerificationToken`, `Membership`.
- Client operations: `Client`, `ClientUser`, `Project`, future-ready `ProjectMember`.
- Work tracking: `WorkItem`, `WorkItemType`, `BugDetails`, `FeatureDetails`, `PipelineStatus`, `ReleaseTarget`.
- Collaboration: `Comment`, `Mention`, `Watcher`, `Label`, `WorkItemLabel`.
- Assets: `Asset`, `AssetLink`.
- Context: fields directly on Client, Project, WorkItem for `description`, `structuredContext`, `aiContext`, `aiSummary`.
- Activity and audit: `ActivityEvent`, `AiAction`, `McpOAuthClient`, `McpTokenGrant`.

## Tenant And Permission Model

The launch implementation uses client-scoped client-user access:

- Admin: platform-wide access.
- Client User: access to all projects belonging to their single assigned client.
- AI Agent: access controlled by OAuth bearer token scopes for system and client.

Recommended checks:

- Read project: Admin, client user for the owning client, or scoped AI agent.
- Create work item: Admin, client user for the owning client, or scoped AI agent.
- Comment: Admin, client user for the owning client, or scoped AI agent.
- Upload asset: Admin or client user for the owning client.
- Move pipeline status: Admin or scoped AI agent with status-change authorization.
- Configure pipeline: Admin only.
- View AI action details: Admin only.

Permissions should be expressed as server-side policy functions and reused by web and MCP.

## Activity And Audit

Activity must be append-only at the application level.

Activity events should include:

- actor type: user, ai_agent, system
- actor id or external agent id
- entity type and entity id
- action name
- before and after metadata where appropriate
- visibility: user-visible or admin-only
- created time

Client users should see all non-AI activity for projects belonging to their client. All AI actions are admin-only, including agent identity, tool calls, generated summaries, MCP metadata, status-change rationale, and agent existence.

AI-originated writes should create an `ActivityEvent` for timeline consistency and a linked `AiAction` record for tool name, request metadata, authorization scope, decision summary, and result summary.

## MCP Architecture

The MCP server should be a thin adapter over application services.

Authentication recommendation:

- Use OAuth 2.1-style bearer tokens for MCP agent clients.
- Represent each authorized agent integration as an OAuth client or service principal.
- Include scopes for system access, client access, tool families, and privileged status changes.
- Avoid user session delegation for launch; agent actions should be attributed to the agent and its authorization grant.
- Permit local development tokens only as a development convenience behind the same scope checks.

Tool families:

- `clients.list`, `clients.get`, `clients.create`, `clients.update`
- `projects.list`, `projects.get`, `projects.create`, `projects.update`
- `work_items.list`, `work_items.get`, `work_items.create`, `work_items.update`, `work_items.change_status`
- `comments.list`, `comments.create`
- `search.global`
- `summaries.get`, `summaries.generate`, `summaries.update_context`

MCP requests should include an authenticated AI actor identity and authorization scope. Tool responses should avoid leaking admin-only AI audit details to non-admin scopes. Since clients should not know about agent work, AI audit data should remain available only in admin views and admin-scoped tools.

## Storage Architecture

Use a storage provider interface from the start:

```text
StorageProvider
  putObject(input)
  getObject(input)
  deleteObject(input)
  getSignedReadUrl(input)
```

Initial provider:

- Local filesystem rooted at `uploads/`.

Future provider:

- S3-compatible object storage.

Database records should store provider, object key, content type, size, checksum if available, preview metadata, and ownership links.

Project deliverables reuse project-linked `Asset` records. A `DeliverableShare` binds one asset to one project and stores a high-entropy public token, bcrypt password hash, required expiry, revocation state, failed-attempt lockout state, and download evidence. The public download route verifies that record before reading through `StorageProvider.getObject`; it never exposes the object key. See [ADR 0011](../adr/0011-password-protected-project-deliveries.md).

MVP asset constraints:

- Maximum file size: 100 MB per file.
- Maximum upload batch: 10 files.
- Allowed image types: PNG, JPEG, GIF, WebP.
- Allowed document types: PDF, TXT, Markdown, CSV, DOCX, XLSX.
- Allowed video types: MP4, MOV, WebM.
- Allowed log/archive types: LOG, JSON, ZIP.
- Block executable files, scripts, HTML uploads, and unknown binary formats.
- Generate basic previews for images only in MVP; defer rich previews for PDFs, office documents, and video.

## Search Architecture

Phase 1 can ship filtered database queries for list views. Phase 2 global search should begin with PostgreSQL-backed search over clients, projects, work items, comments, and asset metadata.

If search requirements grow, introduce a later ADR for dedicated search infrastructure.

## Local-First AWS-Ready Posture

Local development:

- PostgreSQL through local service or Docker.
- Local filesystem uploads.
- Auth.js local configuration.
- Seed script for admin, client, project, pipeline statuses, and sample work.

AWS-ready design:

- Database remains PostgreSQL-compatible.
- Storage provider swaps local filesystem for S3.
- Auth.js supports provider changes.
- MCP server can run as a separate service or Next.js route depending on operational needs.

## Accepted ADRs

The following architecture decisions have been accepted and recorded:

- [ADR 0001: Monorepo Package Boundaries](../adr/0001-monorepo-package-boundaries.md)
- [ADR 0002: Unified Work Item Model](../adr/0002-unified-work-item-model.md)
- [ADR 0003: Activity And AI Audit](../adr/0003-activity-and-ai-audit.md)
- [ADR 0004: Launch Auth And Client Access](../adr/0004-launch-auth-and-client-access.md)
- [ADR 0005: MCP Auth And Agent Authorization](../adr/0005-mcp-auth-and-agent-authorization.md)
- [ADR 0006: Storage Provider And Asset Constraints](../adr/0006-storage-provider-and-asset-constraints.md)
- [ADR 0007: Search Permission Strategy](../adr/0007-search-permission-strategy.md)
