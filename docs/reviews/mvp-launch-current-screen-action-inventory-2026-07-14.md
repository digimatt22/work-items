# MVP Launch Current Screen And Action Inventory

Date: 2026-07-14

Status: current-state inventory for Matthew's limited-MVP validation pass

Evidence set: `docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14/`

Related review:
- `docs/reviews/mvp-launch-readiness-2026-07-14.md`
- `docs/reviews/mvp-launch-readiness-fix-pass-2026-07-14.md`

## Scope

This inventory records the current production-like UI after the launch-readiness fix pass. It supersedes the pre-fix screen/action inventory in `docs/reviews/mvp-launch-readiness-2026-07-14.md` for launch validation, while preserving that earlier review as the source of the original findings.

The reviewed roles are:
- Admin: internal DigiColony operator managing clients, projects, requests, work items, status, contacts, and context.
- Client user: invited client stakeholder reporting issues/features and tracking only their visible requests.

## Current Information Hierarchy

The app now presents a simple hierarchy:

1. Client
2. Project
3. Work item or client request
4. Collaboration record: comments, assets, activity, and status

Admin screens expose the full hierarchy, management controls, and an email-ready weekly status report. Client screens expose a reduced request-oriented version: Report, Board, request detail, comments, assets, status explanation, and read-only client/project metadata. Direct client access to admin portfolio, project workspace, and status report routes redirects back to the request board.

## Screen And Action Inventory

| Screenshot | Screen | Role | Primary visible actions | Hierarchy and clarity notes |
| --- | --- | --- | --- | --- |
| `01-sign-in-desktop.png` | Sign in | Admin, client | Enter email, enter password, submit sign-in | Minimal and clear. No self-service reset/support path is visible, which is acceptable for a controlled MVP group if onboarding is manual. |
| `02-admin-board-desktop.png` | Admin board | Admin | Open Add modal, search work/client/project, filter by client/project, filter by type, clear filters, generate a filtered status report, open work item cards, sign out | Strongest admin overview. Status columns show operational state while cards preserve project/client context. |
| `03-admin-board-hierarchy-filter-open.png` | Admin hierarchy filter | Admin | Select all clients/projects, select a client, select a project, clear selected hierarchy, dismiss dropdown | Client -> project hierarchy is understandable. Checkbox rows remain a discoverability risk for touch and keyboard users and should be manually checked. |
| `04-admin-global-add-feature.png` | Admin Add modal | Admin | Choose request/workspace entity type, choose project, enter title/description, fill feature fields, create, cancel/dismiss | Centralized creation is now grouped into Requests and Workspace with short action descriptions. The modal is appropriate for MVP, and the admin e2e covers create flow success; validation/error states still need manual review. |
| `05-admin-list-desktop.png` | Admin list | Admin | Switch to Board/List, search/filter, expand or collapse client/project groups, open client, open project, open work item | Best expression of the Client -> Project -> Work item hierarchy. Useful fallback when the board is visually dense. |
| `06-admin-clients-desktop.png` | Client portfolio | Admin | Open Add modal, open main board by client, open client detail, archive client, open project | Cleaner after review reset. The page supports account scanning and route into work. Summary metrics now use "Open work" and "In review"; archive uses confirmation and danger styling, but Matthew should still accept the destructive-action pattern for limited launch. |
| `07-admin-client-detail-desktop.png` | Client detail | Admin | Open main board, open project workspace, edit project, archive project, edit contacts, edit client context, sign out | Project cards now show names, descriptions, counts, and edit/archive controls in read state. This fixed the prior blank-card blocker. |
| `08-admin-client-context-edit.png` | Client context edit | Admin | Edit client name/description/context fields, save, cancel | Important operational context is editable in place. Long forms need manual keyboard and save/cancel visibility review. |
| `09-admin-project-workspace-desktop.png` | Project workspace | Admin | Navigate back to clients/client detail, open main board filtered by project, edit project context, open work items | Project context and scoped work are visible. This is admin-only now for client users. |
| `10-admin-project-context-edit.png` | Project context edit | Admin | Edit project name/description/context fields, save, cancel | Editable context aligns with launch needs. Manual review should confirm validation and cancel behavior. |
| `11-admin-work-item-detail-desktop.png` | Work item detail | Admin | Back to board, upload asset, add comment, move status, open client, open project, inspect operational summary/activity | Full operational detail is clear for admins. Upload constraints are shown inline, and comment, blocked file-type error, and allowed file upload are now covered by e2e on client-visible requests; oversize upload behavior still needs manual review. |
| `12-admin-status-report-desktop.png` | Admin weekly status report | Admin | Copy report text, confirm active board-filter scope, open the filtered board, sign out | Concise and launch-useful. The report is clearly a generated preview for copy/paste, with edits expected in email before sending. Matthew should review tone and whether the status grouping matches how DigiColony wants to speak to clients. |
| `13-admin-board-mobile.png` | Admin mobile board | Admin | Use status jump links, horizontal status navigation, open cards, sign out | Improved by status jump controls. Still the highest-density mobile surface and should be manually reviewed on real mobile before launch. |
| `14-client-report-bug-desktop.png` | Client report bug | Client | Select project, choose Report a bug, enter summary/details/steps/expected/actual, attach files, submit, view requests, sign out | Clear primary client entry point. Long form is acceptable for MVP if validation and attachment feedback are friendly. |
| `15-client-report-feature-desktop.png` | Client report feature | Client | Select project, choose Request a feature, enter summary/details/story/acceptance/value, attach files, submit, view requests | Copy is now client-facing. This screen supports structured intake without exposing admin workflow language. |
| `16-client-board-desktop.png` | Client request board | Client | Search requests, filter by project, filter by type, clear filters, open visible request, navigate Report/Board, sign out | Client board is reduced and understandable. It shows only client-visible requests, uses request-oriented labels, and explains the active status terms. |
| `17-client-list-desktop.png` | Client request list | Client | Search/filter, expand/collapse project groups, open visible request | Useful as a lower-density alternative to the board. Client no longer needs account-level navigation to understand the request set, and summary copy now uses request language. |
| `18-client-clients-redirect-desktop.png` | Client `/clients` redirect | Client | Land on request board, continue with request filters/actions | Direct client access to admin client portfolio is redirected, reducing accidental exposure of admin account concepts. |
| `19-client-client-detail-redirect-desktop.png` | Client `/clients/[clientId]` redirect | Client | Land on request board, continue with request filters/actions | Direct client access to client detail is redirected. This makes the MVP client surface intentionally smaller. |
| `20-client-project-redirect-desktop.png` | Client `/projects/[projectId]` redirect | Client | Land on project-filtered request board | Direct project workspace access becomes a project-scoped request board. This preserves useful context without exposing admin workspace controls. |
| `21-client-work-item-detail-desktop.png` | Client request detail | Client | Back to board, upload asset, add comment, inspect read-only status/info/activity | Client detail is now client-safe and client-worded: request details, client-facing feature labels, status explanation, visible upload constraints, no operational summary panel, and no admin client/project links. |
| `22-client-report-mobile.png` | Client report mobile | Client | Navigate Report/Board, choose report type, fill report fields, attach files, submit | Mobile structure is understandable. Lower-form validation and attachment feedback still need manual mobile review. |

## MVP Launch Readiness Assessment

The current hierarchy and controls are coherent enough for a limited MVP validation group, provided Matthew performs the final human pass. The core mental model is now:
- Admins manage clients, projects, work state, context, and collaboration.
- Clients submit and track requests without seeing admin portfolio or project workspace concepts.

## Remaining Manual Checks

- Confirm destructive archive/edit flows are acceptable for a limited group; archive/delete controls already have confirmation prompts and danger styling.
- Review weekly status report copy for tone, completeness, and whether the status grouping is right for external email.
- Manually verify keyboard navigation, focus order, and screen reader labels on forms, dropdown filters, status controls, and modal interactions.
- Manually verify oversize upload error behavior.
- Review mobile board and mobile report form on a real device or browser device emulation.
- Configure `origin`, push the local commit stack, and prepare PR review once the remote exists.
