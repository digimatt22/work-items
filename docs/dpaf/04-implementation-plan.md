# Implementation Plan

## Working Assumptions

- The attached PRD is the canonical implementation source.
- The repo begins as a new monorepo.
- The first build targets local macOS development.
- AWS compatibility is an architecture constraint, not a Phase 1 deployment deliverable.
- Auth.js will be used with a local database-backed provider for launch.
- Admin creates all clients and client users.
- Client users belong to one client and can view all projects for that client at launch.
- MCP uses OAuth 2.1-style bearer tokens with scoped agent clients.
- Authorized AI agents may change work item status when their token scope permits the relevant system and client.
- All AI actions are admin-only.

## Phase 0: Foundation

Deliverables:

- Initialize monorepo structure.
- Add TypeScript, linting, formatting, test runner, and package scripts.
- Create Next.js app in `apps/web`.
- Create shared packages for database, shared domain types, MCP, and UI.
- Add local environment sample.
- Add initial documentation and ADR scaffolding.

Validation:

- `pnpm install`
- `pnpm lint`
- `pnpm test`
- `pnpm dev`

## Phase 1A: Database And Auth

Deliverables:

- Prisma schema for users, clients, client membership, projects, future-ready project membership, pipeline statuses, work items, comments, assets, activity, and AI audit.
- Initial migrations.
- Seed script.
- Auth.js integration.
- Admin and Client User role enforcement.
- Admin-managed client user creation.
- Single-client membership for client users.

Validation:

- Unit tests for permission policy.
- Integration tests for client-scoped project reads and writes.

## Phase 1B: Client And Project Workspaces

Deliverables:

- Client list and detail.
- Project list and detail.
- Create/edit/archive flows.
- Client user management for admins.
- Activity timeline foundation.

Validation:

- Admin can manage all clients and projects.
- Client user can view only projects belonging to their client.
- Archive removes records from active views without deleting history.

## Phase 1C: Work Items

Deliverables:

- Unified work item create/edit/detail.
- Bug and Feature templates.
- Release targets.
- Assignee, reporter, creator.
- Pipeline statuses.
- List view with filters.
- Kanban view with human status movement restricted to admins.

Validation:

- Client user can create Bug and Feature items.
- Client user cannot move pipeline status.
- Admin can move status and activity is recorded.
- Client users cannot see AI audit records.

## Phase 1D: Collaboration And Assets

Deliverables:

- Comments.
- Mention parsing and persistence.
- Watcher-ready data model.
- Local file upload.
- Asset links to work items and projects.
- Basic image preview metadata.
- MVP upload constraints: 100 MB per file, 10 files per request, allow PNG/JPEG/GIF/WebP, PDF/TXT/Markdown/CSV/DOCX/XLSX, MP4/MOV/WebM, LOG/JSON/ZIP, block executable/script/HTML/unknown binary files.

Validation:

- Uploads persist through storage abstraction.
- Comments and uploads create activity.
- Client-scoped permissions apply to comments and assets.

## Phase 1E: Setup Docs And E2E

Deliverables:

- Local setup documentation.
- Playwright tests for login, project access, work item creation, Kanban/List, comments, and uploads.
- Permission regression tests.

Validation:

- A new developer can run the app locally from documented steps.
- Acceptance criteria for Phase 1 pass in CI or local equivalent.

## Phase 1F: Design Readiness And Workflow Hardening

Deliverables:

- Reconcile the DPAF specialist artifacts in `docs/research/`, `docs/ux/`, `docs/ui/`, `docs/reviews/`, and `docs/specialist-artifact-handoff.md`.
- Move remaining direct client/user mutations behind shared service methods where launch behavior should be audited.
- Add confirmation behavior for destructive actions such as archive client, archive project, and delete or deactivate client user.
- Improve work item detail with type-specific details, activity, permitted status controls, and approved edit entry points.
- Add reusable UI components for repeated button, form field, badge, page header, panel/card, alert, and empty-state patterns.
- Add pending, error, success, empty, and no-results states for critical admin and client-user workflows.
- Add richer board card metadata where it improves operational-memory scanning.
- Add accessibility improvements for focus visibility, field errors, status indicators, upload guidance, and destructive actions.

Validation:

- Admin workflow tests continue to pass.
- Client-user permission and visibility tests cover board, project, work item detail, comments, assets, and AI/audit invisibility.
- Design QA screenshots are captured for Board, Clients, Client Detail, Project Workspace, and Work Item Detail before product acceptance.
- Keyboard-only and accessibility checks are performed to the extent local tooling allows.

## Phase 2A: MCP Foundation

Deliverables:

- Streamable HTTP MCP server.
- OAuth 2.1-style bearer-token authentication for agent clients.
- AI actor authentication and authorization scope, including system, client, tool-family, and status-change scopes.
- Tool adapters over shared services.
- MCP contract tests.
- AI action audit records.

Validation:

- MCP can read clients/projects/work items within scope.
- MCP can create work items and comments.
- MCP status changes require explicit status-change scope and client authorization.
- All AI actions are logged.
- Client users cannot see AI action records or AI-originated activity metadata.

## Phase 2B: AI Context, Summaries, Labels, Watchers, Search

Deliverables:

- AI context editing and summary storage.
- Summary tool and admin-visible provenance.
- Labels and watchers.
- PostgreSQL-backed global search.

Validation:

- Summary updates create audit events.
- Search respects client-scoped permissions.
- Labels and watchers work across list and detail views.

## Phase 3: Operations

Deliverables:

- Notifications.
- Analytics.
- Workflow customization.
- AWS deployment plan and infrastructure ADRs.

Validation:

- Production deployment checklist is complete.
- Storage provider can be switched to S3-compatible implementation.
- Workflow configuration does not break existing work item history.

## Suggested First Build Milestone

The first useful milestone should be:

> Admin and client user can sign in locally, view a client/project hierarchy, create Bug and Feature work items, comment, upload an asset, and see immutable activity in list and Kanban views.

This milestone proves the operational memory model before AI automation is added.
