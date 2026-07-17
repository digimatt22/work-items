# Wireframes

## Page Inventory
- `/intake`: triage list with clarity, priority, sensitivity, project, and readiness filters.
- `/projects/[projectId]/integration`: binding status, config payload, verification, rotation, revocation.
- `/agent-activity`: active claims, stale leases, attempts, failures, and audit filters.
- `/work-items/[id]`: new Qualification and Delivery sections within the existing detail page.

## Low-Fidelity Layouts
### Intake row
`Type | Title | Customer | Project | Clarity | Priority | Sensitive? | Action`

### Integration panel
`Binding status -> Config preview -> Verify from workspace -> Human activate -> Health/rotate/revoke`

### Delivery panel
`Readiness | Current claim | Attempt timeline | Latest progress | Evidence | Review action`

## States
- Empty: explain what makes work eligible and link to qualification guidance.
- Loading: preserve filters and show row skeletons without implying no work.
- Error: distinguish integration unavailable, credential rejected, stale lease, and retryable server error.
- No permission: show the required role or binding scope without revealing hidden records.
