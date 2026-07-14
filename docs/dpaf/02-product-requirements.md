# Product Requirements

## Phase 1 Scope

Phase 1 should deliver the complete human-facing foundation.

### Authentication

- Support authenticated local users through Auth.js with a local database-backed provider for launch.
- Distinguish Admin and Client User roles.
- Enforce permissions in server-side actions or service methods.
- Admin creates clients and client users.

### Clients

- Create, edit, view, archive, and list clients.
- Create and manage client users from the admin experience.
- Restrict each client user to a single client for launch.
- Store human description, structured context, AI context, and AI summary.
- Show client projects and recent activity.

### Projects

- Create, edit, view, archive, and list projects within a client.
- For launch, all users belonging to a client can view all projects for that client.
- Keep the data model ready for future project-specific membership if needed.
- Store human description, structured context, AI context, and AI summary.
- Show project work items, assets, and activity.

### Work Items

- Create, edit, view, archive, and list work items.
- Support initial types: Bug and Feature.
- Store shared fields: title, description, reporter, creator, assignee, pipeline status, labels, watchers, release target, attachments, comments, AI summary, and activity.
- Support bug-specific fields: steps to reproduce, expected behavior, actual behavior.
- Support feature-specific fields: user story, acceptance criteria, business value.

### Comments

- Add comments to work items.
- Preserve author, created time, edited time if edits are allowed, and activity entries.
- Support mentions in a notification-ready form.

### Assets

- Upload images, PDFs, videos, documents, and logs.
- Store files through a storage service abstraction.
- Store file metadata and basic image previews in MVP; defer rich PDF, document, and video preview generation.
- Associate assets with work items and projects in Phase 1.
- Enforce MVP asset constraints:
  - Maximum file size: 100 MB per file.
  - Maximum upload batch: 10 files per request.
  - Allowed image types: PNG, JPEG, GIF, WebP.
  - Allowed document types: PDF, TXT, Markdown, CSV, DOCX, XLSX.
  - Allowed video types: MP4, MOV, WebM.
  - Allowed log/archive types: LOG, JSON, ZIP.
  - Block executable files, scripts, HTML uploads, and unknown binary formats.

### Views

- Kanban board grouped by pipeline status.
- List view with filtering.
- Filters for client, project, pipeline status, label, release target, reporter, assignee, and type.

## Phase 2 Scope

Phase 2 should introduce AI-native behavior without changing the Phase 1 domain foundation.

### MCP

- Provide a secure Streamable HTTP MCP server.
- Use OAuth 2.1-style bearer token authentication for MCP agent clients, with scoped client/system authorization.
- Expose tool namespaces:
  - `clients.*`
  - `projects.*`
  - `work_items.*`
  - `comments.*`
  - `search.*`
  - `summaries.*`
- Apply the same authorization rules as the web app.
- Log all AI actions.
- Allow authorized AI agents to change work item status when their token scope permits the relevant system and client.
- Keep all AI actions admin-only and invisible to client users.

### AI Context And Summaries

- Store AI context on clients, projects, and work items.
- Store generated AI summaries on clients, projects, and work items.
- Track summary generation events in activity.
- Keep summary provenance available for admins.
- Do not expose AI agent work, usage, thoughts, tool calls, or existence to client users in launch scope.

### Labels, Watchers, Search

- Add label management.
- Add watcher subscriptions.
- Add global search across clients, projects, work items, comments, and assets metadata.

## Phase 3 Scope

Phase 3 should mature the platform once the operational memory is working.

- Notifications.
- Analytics.
- Workflow customization.
- AWS deployment.

## Key User Flows

### Client User Reports A Bug

1. Client user signs in.
2. User selects a project belonging to their client.
3. User creates a Bug work item with reproduction details.
4. User uploads screenshots or logs.
5. System creates activity entries for work item creation and asset upload.
6. Admin sees the bug in list and Kanban views.

### Client User Requests A Feature

1. Client user selects a project belonging to their client.
2. User creates a Feature work item with user story, acceptance criteria, and business value.
3. System records reporter, creator, project, and initial pipeline status.
4. Admin reviews and optionally assigns ownership.

### Admin Moves Work Through Pipeline

1. Admin opens Kanban or work item detail.
2. Admin changes status from Reported to In Progress, In Review, or Done.
3. System validates admin permission.
4. System records immutable activity.

### AI Agent Summarizes Work

1. Authorized AI agent calls an MCP summary tool.
2. System validates the agent authorization scope.
3. System generates or stores an AI summary.
4. System records the AI action in admin-visible audit activity.

### AI Agent Changes Work Item Status

1. Authorized AI agent calls an MCP status-change tool.
2. System validates bearer token, system scope, client scope, and status-change permission.
3. System changes the work item status.
4. System records an admin-only AI action and immutable activity event with the agent identity, tool name, status transition, authorization scope, and timestamp.
5. Client users see the resulting non-AI work item state but do not see AI action details.

## Acceptance Criteria Mapping

- Client/project hierarchy: Phase 1.
- Client-scoped project permissions: Phase 1.
- Unified work items: Phase 1.
- Kanban and List views: Phase 1.
- Comments, mentions, uploads: Phase 1 with mentions notification-ready.
- Release targets: Phase 1.
- Archive support: Phase 1.
- MCP read/write: Phase 2.
- AI audit logging: Phase 2, with audit foundations in Phase 1.
- Local setup documentation: Phase 1.
