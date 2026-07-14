# MVP Launch Readiness UI/UX Review

Date: 2026-07-14

Status: review complete; fixes needed before limited client launch

Reviewer: Codex

Goal: prepare the DigiColony client operations system for limited MVP launch by reviewing the full admin and client experiences for consistency, clarity, data hierarchy, and action discoverability.

## Evidence

- App URL: `http://localhost:3000`
- Screenshot directory: `docs/reviews/screenshots/mvp-launch-readiness-2026-07-14/`
- Capture command: `SCREENSHOT_DIR=docs/reviews/screenshots/mvp-launch-readiness-2026-07-14 node scripts/capture-launch-readiness-screenshots.mjs`
- Database: local Docker PostgreSQL seeded with `pnpm db:seed`
- Git: initialized locally on `main`; no `origin` remote configured yet

## Evidence Limits

- Screenshots were captured in dev mode, not from a production build.
- The in-app Browser tool was unavailable because its runtime pointed `CODEX_HOME` at a missing `/Users/mwood/.codex` path. The review used the repo-native Playwright screenshot path instead.
- The local database contains many E2E-created records in addition to seed data. This is valid evidence for launch-readiness risk, but it is not a clean intended demo state.
- Screenshot evidence cannot prove full keyboard support, screen reader behavior, color contrast ratios, file upload success, drag/drop robustness, or production performance.

## Overall Verdict

The MVP has a coherent core: admins can orient around Board/List/Clients, clients get a simpler Report/Board path, and role-based controls are mostly appropriate. It is close to internal pilot readiness, but it is not ready for a limited external client launch without a focused cleanup pass.

The biggest blockers are not the basic concept; they are presentation and setup risks:

- the review dataset is polluted by E2E artifacts, overwhelming the board and portfolio;
- client detail project cards render blank in their closed state;
- client users can reach admin-oriented client/project pages and internal work items by direct URL;
- dev/runtime overlays appear over the UI in captured screens;
- mobile board discoverability is weak;
- setup remains incomplete because no remote is configured and `pnpm prisma:migrate` prompts interactively.

## Screen And Action Inventory

| Screen | User | Primary visible actions | Notes |
| --- | --- | --- | --- |
| Sign in | Admin, client | Enter email, enter password, submit sign-in | Clear and minimal. No forgot-password or support affordance visible. |
| Admin board | Admin | Search, open hierarchy filter, open type filter, clear filters, open work item, drag work cards between columns, global Add, navigate Board/List, sign out | Board hierarchy is understandable, but polluted data creates noise and high counts. |
| Admin board hierarchy filter | Admin | Select client, select project, dismiss filter, clear filters | Grouping is useful. Checkbox visibility depends on hover/focus, which is risky on touch and for discoverability. |
| Global add modal | Admin | Choose Feature, Bug, Client, Project, Client user; complete form; create; cancel; close | Strong single entry point. Needs clearer relationship between selected left nav item and form title for new users. |
| Admin list | Admin | Search/filter, expand/collapse client/project groups, open client, open project, open work item | Good data hierarchy, but E2E records dominate and make the hierarchy feel synthetic. |
| Client portfolio | Admin | Open main board by client, open client details, archive client, open projects, global Add, sign out | Data hierarchy is clear when clean, but 50 clients/50 projects from E2E pollution makes it launch-hostile. |
| Client detail | Admin | Open main board, open project, edit project, archive project, edit client context, edit contact, delete contact | Serious closed-state bug: project cards are mostly blank until opened. |
| Client context edit | Admin | Edit client name, description, goals/summary, structured JSON; save; cancel | Edit form is contained and readable. Dev overlay/toast overlaps lower sidebar. |
| Project workspace | Admin | Breadcrumb to Clients/client, open main board filtered by project, edit project context, open work item | Large blank read area when project context is sparse; side work list is useful. |
| Project context edit | Admin | Edit project name, description, goals/summary, structured JSON; save; cancel | Clear, but again dev overlay overlaps lower sidebar. |
| Work item detail | Admin | Back to board, upload assets, add comment, change status, open client, open project | Strongest detail screen; role-relevant controls are clear. |
| Admin mobile board | Admin | Open Add, search/filter/clear, scroll board cards | First mobile viewport exposes only the Reported column. It is not obvious how to see other statuses or move work. |
| Client report bug | Client | Select project, choose Report Bug, fill summary/details/steps/expected/actual, attach files, view board, submit report, sign out | Clear client-first entry point. Long form extends below fold, which is acceptable if validation is friendly. |
| Client report feature | Client | Select project, choose Request A Feature, fill summary/details/user story/criteria/value, attach files, view board, submit report | Clear language, although title casing "Request A Feature" should become "Request a feature". |
| Client board | Client | Search/filter/clear, open work item, navigate Report/Board, sign out | Role reduction works: no Add control and no status movement. Polluted client reports still make the board noisy. |
| Client list | Client | Search/filter/clear, expand/collapse groups, open work item/client/project | Understandable hierarchy, but copy says "work, client, project" and still feels admin-oriented. |
| Client portfolio | Client | Open main board, open details, open project | Direct route is accessible and read-only, but "Client portfolio", "Accounts", and metric cards are admin-facing concepts for a client user. |
| Client detail | Client | Open main board, expand project details, view contacts/context/activity | Direct route is accessible. Project cards show only "Details" while closed, which is better than blank but still low-information. |
| Client project workspace | Client | Breadcrumb to client, open main board, open work item | Direct route is accessible. Large blank Project context area repeats the admin issue. |
| Client work item detail | Client | Back to board, upload assets, add comment, open client/project links, view status/info/activity | Status is read-only, but internal/admin language and an admin-oriented seeded work item are visible. |
| Client mobile report | Client | Open report, choose project/type, fill form, submit | Top structure is clear. Production review required to confirm no overlays and no lower-form cramped states. |

## Findings

### P0 / Launch Blockers

1. Clean review and launch data are not deterministic.
   Evidence: `02-admin-board-desktop.png`, `05-admin-list-desktop.png`, `06-admin-clients-desktop.png`, `15-client-board-desktop.png`.
   The board and client portfolio contain many E2E records. A limited launch user would see synthetic client/project names and inflated counts. Create a database reset/seed path that clears E2E artifacts or uses a separate E2E database.

2. Client detail project cards are blank in closed state.
   Evidence: `07-admin-client-detail-desktop.png`.
   The Projects panel shows two empty rounded cards with only Edit buttons. Users cannot tell which projects exist until the cards are opened. The project name and summary need to be visible in the closed/read state.

3. Client users can see admin-oriented content and language.
   Evidence: `15-client-board-desktop.png`, `17-client-clients-desktop.png`, `18-client-client-detail-desktop.png`, `19-client-project-workspace-desktop.png`, `20-client-work-item-detail-desktop.png`.
   A client can directly reach portfolio/client/project screens, and a client-visible work item is titled "Create admin workspace overview." The client detail page also exposes "Operational summary" copy that references admin-only AI provenance. Either intentionally design these as client-facing read-only views or block/redirect them.

4. Production-like capture is not clean.
   Evidence: `08-admin-client-context-edit.png`, `10-admin-project-context-edit.png`, `17-client-report-mobile.png`.
   A dev overlay/issue badge appears over the lower UI. Even if this is dev-only, it prevents clean signoff. Run a production build or clean-browser capture and confirm no app/runtime overlay appears.

### P1 / MVP Readiness Risks

5. Mobile board needs clearer status navigation.
   Evidence: `12-admin-board-mobile.png`.
   The first mobile viewport shows only the Reported column, with no obvious signposting for other statuses or movement. For limited launch, either add a status switcher on mobile or route mobile users to List by default.

6. Project workspace read state wastes primary content area when context is sparse.
   Evidence: `09-admin-project-workspace-desktop.png`, `19-client-project-workspace-desktop.png`.
   The Project context panel becomes a large blank area. Empty-state copy or compact cards for background/goals/context would make the page feel intentional.

7. Filter checkboxes are low-discoverability.
   Evidence: `03-admin-board-hierarchy-filter-open.png`.
   The hierarchy filter is useful, but unselected checkboxes are visually hidden until hover/focus. Always-visible checkboxes or selected-row affordances would be clearer.

8. Action naming is mostly clear but needs final polish.
   Evidence: `04-admin-global-add-feature.png`, `13-client-report-bug-desktop.png`, `14-client-report-feature-desktop.png`.
   "Global add" is internal language, and "Request A Feature" should use normal sentence case. "View project board" on the report form may be clearer as "View my requests".

9. Admin and client information hierarchy is understandable, but it depends on clean data.
   Evidence: `05-admin-list-desktop.png`, `06-admin-clients-desktop.png`, `15-client-board-desktop.png`, `16-client-list-desktop.png`.
   The intended hierarchy appears to be Client -> Project -> Work item. The list view communicates this best. The board communicates workflow state best. The portfolio becomes confusing when test artifacts are mixed with real client accounts.

### P2 / Polish And Accessibility Risks

10. Sign-in is clean but lacks recovery/help affordances.
   Evidence: `01-sign-in-desktop.png`.
   For a limited group, this may be acceptable, but include a support/contact path before inviting users outside the team.

11. Some controls rely on compact symbolic labels.
    Evidence: sidebar nav in most desktop screenshots.
    The B/L/R marks are visually tidy, but the text label carries meaning. Ensure focus states and `aria-label`s remain correct in production.

12. Upload and comments need live validation.
    Evidence: `11-admin-work-item-detail-desktop.png`, `20-client-work-item-detail-desktop.png`.
    The screens show upload and comment entry points, but screenshots do not prove file constraints, error recovery, or success states.

## Recommended MVP-Ready Fix Sequence

1. Add a deterministic local review reset command that clears E2E data and reseeds only the intended launch-review story.
2. Decide client route policy: either redirect clients away from `/clients` and `/projects`, or make those screens explicitly client-facing.
3. Hide client visibility for admin-only/internal work items and admin-only operational summary copy.
4. Fix client detail project cards so project name, description, count, and open-project link are visible when closed.
5. Run and capture a production-like build with no dev overlay, or explain why the overlay cannot appear in production.
6. Improve mobile board navigation with a status selector, horizontal scroll cue, or mobile-first list fallback.
7. Add compact empty states for sparse client/project context panels.
8. Make hierarchy filter selection affordances always visible.
9. Polish user-facing copy: "Global add", "Request A Feature", "View project board", "Work Command Center", and client-facing search/filter labels.
10. Run manual validation for upload, comments, drag/drop, keyboard navigation, and role-restricted route access.

## Screenshot Step Health

| Step | Screenshot | Health |
| --- | --- | --- |
| 1 | `01-sign-in-desktop.png` | Healthy, minimal recovery gap |
| 2 | `02-admin-board-desktop.png` | Functional, data pollution risk |
| 3 | `03-admin-board-hierarchy-filter-open.png` | Useful, selection affordance risk |
| 4 | `04-admin-global-add-feature.png` | Functional, copy polish needed |
| 5 | `05-admin-list-desktop.png` | Strong hierarchy, polluted data |
| 6 | `06-admin-clients-desktop.png` | Clear layout, launch-blocked by test data |
| 7 | `07-admin-client-detail-desktop.png` | Blocked by blank project cards |
| 8 | `08-admin-client-context-edit.png` | Functional, dev overlay collision |
| 9 | `09-admin-project-workspace-desktop.png` | Functional, blank context area |
| 10 | `10-admin-project-context-edit.png` | Functional, dev overlay collision |
| 11 | `11-admin-work-item-detail-desktop.png` | Healthy, needs live upload/comment validation |
| 12 | `12-admin-board-mobile.png` | Risky, status navigation unclear |
| 13 | `13-client-report-bug-desktop.png` | Healthy, long-form validation needed |
| 14 | `14-client-report-feature-desktop.png` | Healthy, copy polish needed |
| 15 | `15-client-board-desktop.png` | Functional, noisy data |
| 16 | `16-client-list-desktop.png` | Functional, admin-oriented filter copy |
| 17 | `17-client-clients-desktop.png` | Functional, route/copy policy risk |
| 18 | `18-client-client-detail-desktop.png` | Functional, low-information project cards |
| 19 | `19-client-project-workspace-desktop.png` | Functional, blank context area |
| 20 | `20-client-work-item-detail-desktop.png` | Near-blocker, client sees internal/admin framing |
| 21 | `21-client-report-mobile.png` | Structure clear, lower-form validation still needed |

## Open Setup Risks

- `scripts/check-current-state.sh` now reports `No origin remote configured`.
- `pnpm prisma:migrate` reaches an interactive migration prompt in this local database state.
- Local `pnpm` is newer than the repo-pinned `pnpm@9.15.4`; normalize with Corepack before PR work.
- lifeOS project registration/find-project tooling was not available in this session; only context inventory was reachable.

## Fresh-Eyes Review

A separate sub-agent reviewed the screenshots without code context. Its overall verdict was that the MVP is close enough visually for an internal/admin pilot, but not yet client-launch ready from screenshots alone.

### Fresh-Eyes Top Risks

- "Work Command Center" does not clearly explain whether the product is support, project management, client reporting, internal operations, or all of those.
- Client/project hierarchy is learnable, but test-like records make it noisy.
- Status language varies across screens: "Active", "Open commitments", "Needs review", "Reported", "In Progress", "In Review", "Done", and "Not done".
- Empty project cards look broken.
- The Add flow is powerful but under-explained for new admins.

### Fresh-Eyes Launch Blockers Or Near-Blockers

- Client-facing work item detail exposes internal/admin language, including "Admin-only AI provenance remains out of client-facing views."
- Client can see an admin-oriented work item title: "Create admin workspace overview."
- Mobile board appears incomplete because only one status column is visible.
- Save may fall below the fold in long edit forms.
- Dev issue overlay overlaps critical lower-left UI.

### Fresh-Eyes Recommendation Summary

- Remove client visibility for admin-only sections and internal work items.
- Replace generated/test names with realistic launch data.
- Add visible labels/content to empty project cards.
- Make mobile board status navigation explicit.
- Make Save/Cancel actions sticky or always visible in edit modes.
- Standardize status language.
- Rename client-facing board/filter copy so it reads as requests, not internal work management.
