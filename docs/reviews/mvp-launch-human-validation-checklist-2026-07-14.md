# MVP Launch Human Validation Checklist

Date: 2026-07-14

Owner: Matthew

Status: awaiting human validation

Use this checklist to decide whether the DigiColony client operations system is ready for a limited MVP launch group. This is the human signoff layer after automated validation, screenshot review, and fresh-eyes review.

## Evidence To Review First

- Current screen/action inventory: `docs/reviews/mvp-launch-current-screen-action-inventory-2026-07-14.md`
- Fix-pass review: `docs/reviews/mvp-launch-readiness-fix-pass-2026-07-14.md`
- Production-like screenshots: `docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14/`
- Original review and fresh-eyes baseline: `docs/reviews/mvp-launch-readiness-2026-07-14.md`

## Local Review Setup

Run the review against the clean local story:

```sh
pnpm db:review:reset
pnpm dev
```

Sign in as:

- Admin: `admin@digicolony.local`
- Client: `client@digicolony.local`
- Password: value of `SEED_DEFAULT_PASSWORD`

## Admin Validation

| Area | Pass | Notes |
| --- | --- | --- |
| Board opens as the admin landing screen and makes current work state clear within a few seconds. |  |  |
| Board cards communicate status, project, client, and work item title without visual clutter. |  |  |
| Search, client/project filter, type filter, and Clear control are understandable. |  |  |
| Admin List view makes the Client -> Project -> Work item hierarchy clear. |  |  |
| Client portfolio makes account workload and review load understandable. |  |  |
| Admin metric labels such as Active, Review, Not done, and Open commitments match DigiColony language. |  |  |
| Client detail project cards expose project name, description, work count, edit, and archive affordances clearly. |  |  |
| Client context edit and project context edit forms feel safe enough for MVP. |  |  |
| Global Add modal is understandable for a first-time admin creating Work item, Client, Project, or Client user. |  |  |
| Work item detail supports status movement, comments, upload constraints, assets, activity, and operational summary clearly. |  |  |
| Mobile admin board status navigation is discoverable enough for limited MVP use. |  |  |

## Client Validation

| Area | Pass | Notes |
| --- | --- | --- |
| Client lands on Report and understands how to submit a bug or feature request. |  |  |
| Report form labels are client-facing and ask for the right amount of detail. |  |  |
| Client Board reads as request tracking, not internal work management. |  |  |
| Client status explanations make Reported, In Progress, In Review, and Done understandable. |  |  |
| Client only sees client-visible requests and cannot reach admin-only Clients or Project Workspace screens by direct URL. |  |  |
| Client request detail reads as request collaboration, not internal work tracking. |  |  |
| Client request detail does not expose operational summary, admin links, AI provenance, or internal-only work. |  |  |
| Comments, mention text, upload constraints, blocked file type error, and allowed file attachment feel clear. |  |  |
| Mobile report form is understandable and the lower form content remains usable. |  |  |

## Manual Accessibility And Safety Spot Checks

| Check | Pass | Notes |
| --- | --- | --- |
| Keyboard focus order is usable on Sign in, Report, Board filters, Add modal, and work item detail. |  |  |
| Visible focus states are easy to see on buttons, links, filters, tabs, and file upload. |  |  |
| Screen reader labels are understandable for Report type tabs, filters, upload, comments, and status controls. |  |  |
| Oversize upload error behavior is visible and understandable. |  |  |
| Archive/destructive controls are acceptable for a limited group, or are documented as follow-up risk. |  |  |

## Go / No-Go

Limited MVP launch is a Go only if all are true:

- Admin hierarchy and controls are understandable enough for DigiColony operators.
- Client request submission, request tracking, and request detail are understandable enough for invited client users.
- No client-facing screen exposes internal/admin-only language or data that Matthew considers launch-blocking.
- Upload and comment flows are acceptable for the pilot group.
- Remaining accessibility or destructive-action risks are either accepted for limited launch or converted into pre-launch fixes.
- A remote is configured and the work is ready for PR review, or Matthew explicitly accepts a local-only review path.

## Signoff

- Reviewer:
- Date:
- Decision: Go / No-Go / Go with follow-up fixes
- Required pre-launch fixes:
- Accepted limited-MVP risks:
