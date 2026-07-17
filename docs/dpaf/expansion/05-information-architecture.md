# Information Architecture

## Navigation
- Admin: Board, Intake Queue, Projects, Integrations, Agent Activity, Status Report.
- Project detail: Overview, Work, Context, Integration, Activity.
- Work item detail: Customer Request, Qualification, Delivery, Discussion, Attachments, Activity.
- Client users retain the current report and read-only work status surfaces.

## Surfaces
- Intake Queue for unqualified or blocked reports.
- Ready Queue for qualified, unclaimed work.
- Integration setup and binding verification.
- Agent dispatch detail with lease, attempts, evidence, and recovery actions.
- Admin-only audit view.
- Project-side plugin commands rather than a new project UI for MVP.

## Content Hierarchy
Client > Project > Work Item > Qualification > Dispatch > Attempt > Evidence. Customer-authored content remains visibly separate from operator qualification and internal agent execution metadata.

## Role-Based Visibility
- Client users: request, permitted comments/assets, and customer-safe status only.
- Admin/triager: all qualification, routing, and dispatch controls.
- Project owner: binding and integration health for owned projects.
- Agent: only bound-project work packages and allowed write tools.
- AI audit, tool traces, claim metadata, and internal summaries remain admin-only.
