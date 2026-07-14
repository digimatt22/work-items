# Risks, Decisions, And Open Questions

## CTO-Agent Architecture Notes

The architecture should optimize for a single audited domain model. The highest-risk failure mode is building separate paths for the web app and MCP server that drift in permission behavior, validation, or activity logging.

Recommended posture:

- Put business rules in shared application services.
- Make activity creation part of every write service.
- Treat AI agents as actors with scopes, not as background jobs with special privileges.
- Keep Work Item unified while storing type-specific detail cleanly.
- Abstract storage immediately, even while using local files.
- Add ADRs before introducing infrastructure that would change operating cost or deployment shape.

## Accepted Key Decisions

### ADR: Monorepo Package Boundaries

Decision:

- Use `apps/web`, `packages/db`, `packages/mcp`, `packages/ui`, and `packages/shared`.
- Keep services close to shared/domain code so web and MCP can reuse them.

### ADR: Work Item Type Modeling

Decision:

- Use a unified `WorkItem` model with type-specific detail records for Bugs and Features.
- Preserve a single lifecycle, comment model, asset model, activity model, and MCP surface for all work item types.

### ADR: Activity And AI Audit Model

Decision:

- Use append-only `ActivityEvent` for timeline consistency and link AI-originated events to an `AiAction` record for tool metadata.
- Client users see non-AI activity for their client projects.
- All AI actions are admin-only.

### ADR: Auth Provider

Decision:

- Use Auth.js with a local database-backed provider for launch.
- Admin creates clients and client users.

### ADR: MCP Deployment Shape

Decision:

- Build `packages/mcp` as a separate package that reuses shared services. It may be hosted through a Next.js route initially, but the package boundary should allow separate deployment later.
- Authenticate MCP through OAuth 2.1-style bearer tokens for scoped agent clients.

### ADR: Storage Provider

Decision:

- Store object metadata in PostgreSQL and isolate physical storage behind a provider interface.
- Use local filesystem storage for launch, with S3-compatible object keys and provider behavior.

## Primary Risks

### Permission Drift

Risk:

- Web and MCP paths may enforce different rules.

Mitigation:

- Shared policy functions and application services. Permission tests must cover both UI service calls and MCP tools.

Status:

- Accepted. Roll into PRD support docs and implementation acceptance tests.

### Audit Gaps

Risk:

- Writes may occur without activity or AI audit records.

Mitigation:

- Make activity writing a required part of service-layer write methods. Add integration tests for each mutation.

Status:

- Accepted. Roll into PRD support docs and implementation acceptance tests.

### Work Item Over-Specialization

Risk:

- Bug and Feature implementations may diverge and make future work item types expensive.

Mitigation:

- Keep common lifecycle, comments, assets, labels, watchers, and activity on unified Work Item.

Status:

- Accepted. Roll into PRD support docs and implementation acceptance tests.

### Storage Coupling

Risk:

- Local upload implementation may leak filesystem assumptions into domain code.

Mitigation:

- Introduce storage provider interface in Phase 1.

Status:

- Accepted. Roll into PRD support docs and implementation acceptance tests.

### Context Field Ambiguity

Risk:

- Human description, structured context, AI context, and AI summary may become inconsistent or poorly governed.

Mitigation:

- Define ownership and edit rules for each field. Track summary generation provenance.

Status:

- Accepted. Roll into PRD support docs and implementation acceptance tests.

### Search Scope Leakage

Risk:

- Global search may expose project data across client boundaries.

Mitigation:

- Apply permission filters at query construction. Include search permission tests.

Status:

- Accepted. Roll into PRD support docs and implementation acceptance tests.

### Design-System Drift

Risk:

- Route-level Tailwind markup may diverge as new admin, client-user, work item, and governance screens are added.

Mitigation:

- Introduce a small reusable component set for buttons, fields, badges, page headers, panels, alerts, empty states, and status controls before Phase 2 surfaces expand.

Status:

- Newly identified by the DPAF design specialist pass. Track through `docs/ui/design-system.md` and `docs/specialist-artifact-handoff.md`.

### Mutation Recovery Gaps

Risk:

- Server-action failures may surface as abrupt app errors rather than recoverable field, form, upload, or status-move errors.

Mitigation:

- Add pending, success, inline error, and retry patterns for critical create, update, status move, comment, and upload flows.

Status:

- Newly identified by the DPAF design specialist pass. Track through `docs/ux/interaction-spec.md` and `docs/ui/state-spec.md`.

### Destructive Action Ambiguity

Risk:

- Archive and delete actions may remove or hide operational records without enough user confirmation or audit clarity.

Mitigation:

- Add confirmation UI, danger styling, clear copy, and service-layer activity recording. Decide whether client-user deletion should become deactivate/archive before launch.

Status:

- Newly identified by the DPAF design specialist pass. Track through `docs/reviews/ui-bug-list.md`.

## Resolved Open Questions

The CTO-agent review identified six planning blockers. They are now resolved as launch decisions.

### Authentication Mode For Phase 1

Decision:

- Use Next.js Auth/Auth.js with a local database-backed provider for launch.
- Production provider strategy can be revisited later if SSO or external identity becomes required.

### Client User Onboarding Model

Decision:

- Admin creates clients and client users.
- Client users belong to a single client for launch.
- Client users can view all projects belonging to their client.
- Keep schema extensible for future project-specific memberships.

### MCP Authentication And Authorization

Decision:

- Use OAuth 2.1-style bearer token authentication for MCP agent clients.
- Model each agent integration as a service principal or OAuth client with explicit scopes.
- Scopes should cover system access, client access, allowed tool families, and privileged status changes.
- Local development may use development-issued bearer tokens, but they must flow through the same scope checks.

### AI Action Authorization Semantics

Decision:

- Authorized AI agents may change work item status when their token scope permits the relevant system and client.
- Every AI status change must produce an admin-only `AiAction` audit record linked to immutable activity.
- Audit metadata must include agent identity, authorization scope, tool name, affected entity, before/after status, timestamp, and a decision/result summary.

### Asset Constraints

Decision:

- MVP maximum file size: 100 MB per file.
- MVP maximum batch: 10 files per request.
- Allow images: PNG, JPEG, GIF, WebP.
- Allow documents/data: PDF, TXT, Markdown, CSV, DOCX, XLSX.
- Allow videos: MP4, MOV, WebM.
- Allow logs/archive: LOG, JSON, ZIP.
- Block executables, scripts, HTML uploads, and unknown binary formats.
- Generate basic previews for images only in MVP. Store metadata for other allowed file types and defer rich preview generation.

### Activity Visibility Policy

Decision:

- Client users should see all non-AI activity for projects belonging to their client.
- All AI actions are admin-only.
- Client users should not be privy to agent work, agent use, agent thoughts, tool calls, audit traces, or agent existence.

## Best-Practice Planning Defaults

For remaining non-blocking decisions, use best-in-class SaaS and operations-platform practices:

- Production auth: keep Auth.js provider-flexible and add SSO/OIDC only when client requirements demand it.
- AI summaries: start by storing generated or externally supplied summaries with provenance; defer provider-specific generation coupling.
- File retention: keep assets while parent records are active or archived; avoid hard deletes until an explicit retention policy is approved.
- Client AI visibility: default to no AI visibility for clients unless an admin explicitly publishes AI-generated content as ordinary user-facing content.
- AWS target: plan for stateless app hosting, managed PostgreSQL, S3-compatible storage, managed secrets, and separate worker capacity for future previews, notifications, summaries, and analytics.

## Immediate Next Questions For The User

- Should hard delete of client users be replaced with deactivate/archive?
- Should client users land on Board, Clients, or a client-scoped project list?
- Are comment edits allowed for launch?
- Which work item fields must be editable in the next pass: title, description, type-specific details, assignee, release target, labels, watchers, archive?
- Should project-level asset upload ship in the next pass or remain work-item-only?
- Is arbitrary admin status selection acceptable, or should launch enforce linear state transitions?
- Should compatibility routes `/workspaces` and `/mvp-review` remain through launch?
