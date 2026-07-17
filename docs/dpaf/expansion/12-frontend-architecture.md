# Frontend Architecture

## Framework
Continue the existing Next.js App Router and shared UI conventions. Add screens only after shared service and authorization contracts exist.

## Pages
- Admin Intake Queue.
- Project Integration settings.
- Agent Activity/Dispatch view.
- Qualification and Delivery sections on work-item detail.
- Existing customer report and work views remain stable.

## Components
- `QualificationPanel`, `ReadinessBadge`, `BindingHealthCard`, `ConfigPayload`, `DispatchTimeline`, `ClaimLeaseBadge`, `EvidenceList`, `AgentQuestionPanel`, and `RecoveryActions`.
- Reuse the established page header, panel, badge, field, alert, empty-state, and confirmation patterns.

## State
Server-render queue and detail data where practical. Use server actions for admin mutations with typed expected-error results. Poll active lease/dispatch state initially; introduce events only after the backend outbox is proven. URL parameters own filters.

## Accessibility
- Keyboard-accessible triage and integration controls.
- Status cannot rely on color alone.
- Lease expiry and destructive revoke actions use explicit text and confirmation.
- Inline errors retain entered qualification content.
- Mobile flows use full-screen steps rather than crowded modals, consistent with the existing audit recommendation.
