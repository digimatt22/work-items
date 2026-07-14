# Design QA Handoff

## Final Result
Passed with follow-up items.

## Source Visual Truth
- Reference: Pickolab Studio community Figma dashboard, node `2-2551`.
- Local reference screenshot: `docs/reviews/screenshots/phase-1f-workflow/00-figma-reference-dashboard.png`

## Implementation Evidence
- Initial screenshot contact sheet: `docs/reviews/screenshots/phase-1f-workflow/viewport/contact-sheet.png`
- Refined screenshot contact sheet: `docs/reviews/screenshots/phase-1f-workflow/refined/contact-sheet.png`
- Board interaction cleanup screenshots: `docs/reviews/screenshots/board-interaction-cleanup/`
- Capture script: `scripts/capture-workflow-screenshots.mjs`
- Visual review rules: `docs/reviews/visual-review-rules.md`

## Screens Reviewed
- Sign in
- Board
- Clients and projects
- Client detail
- Project workspace
- Work-item detail
- Mobile board

## Critical Comparison
- The refined UI now better matches the Figma reference's crisp left navigation, strong black/white contrast, rounded tool panels, compact KPI cards, and focused operational dashboard density.
- The app remains intentionally product-specific rather than a literal Figma clone: it preserves clients, projects, work items, permissions, and server-action behavior from the existing implementation.
- The main visual gap found in the first screenshot pass was unreliable accent rendering on active nav and primary buttons. That was corrected with explicit Indigo utility classes.
- The main usability gap found in the first screenshot pass was mobile header overflow. Metric strips now adapt to mobile width.
- The main content-quality gap was noisy long seeded labels. Important titles and metadata now truncate or line-clamp without altering the underlying record.

## Patches Made
- Replaced critical custom primary classes with explicit Indigo classes on navigation, buttons, badges, links, focus rings, and progress bars.
- Updated shared `PageHeader` and `MetricCard` primitives for responsive layout and text containment.
- Tightened board, client, project, and detail cards with truncation and line clamps.
- Added a reusable Playwright screenshot workflow script.
- Updated design QA and accessibility review artifacts.
- Removed the board right rail, Today widget, Focus item, always-visible create form, and duplicated card status controls.
- Added contextual column creation and drag/drop status movement, with desktop/mobile screenshots reviewed for overflow.

## Remaining Findings
- High priority: add inline mutation error recovery and pending/success states.
- High priority: enrich work-item detail with activity context and workflow controls.
- Medium: improve board-card metadata when product fields exist.
- Medium: make upload constraints and retry behavior visible.
- High priority: add a keyboard/non-pointer fallback for drag/drop board movement before production accessibility acceptance.

## Validation Notes
- `pnpm lint`: passed.
- `pnpm test`: passed.
- `scripts/check-doc-links.sh`: passed.
- Playwright capture script: passed against `http://localhost:3002`.
- Targeted admin workflow e2e: passed against `http://localhost:3002` with `playwright.external.config.ts`.
- Dev server: running on `http://0.0.0.0:3002`.
- Git/PR validation remains unavailable because the workspace is not a Git repository.
