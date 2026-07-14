# Design QA

## Scope
Playwright-backed review of the work-items workflow after the Phase 1F Pickolab-inspired UI pass.

Reviewed screens:
- Sign in
- Board
- Clients and projects
- Client detail
- Project workspace
- Work-item detail
- Mobile board

## Evidence
- Figma reference screenshot: `docs/reviews/screenshots/phase-1f-workflow/00-figma-reference-dashboard.png`
- Initial viewport contact sheet: `docs/reviews/screenshots/phase-1f-workflow/viewport/contact-sheet.png`
- Refined viewport contact sheet: `docs/reviews/screenshots/phase-1f-workflow/refined/contact-sheet.png`
- Board interaction cleanup screenshots: `docs/reviews/screenshots/board-interaction-cleanup/`
- Global add and client portfolio pass screenshots: `docs/reviews/screenshots/global-add-client-portfolio-pass/`
- Capture script: `scripts/capture-workflow-screenshots.mjs`
- External-server e2e config: `playwright.external.config.ts`
- Visual review rules: `docs/reviews/visual-review-rules.md`
- Product Design saved-context preflight found no saved context.

## Product Principles Checked
- Board-first operational scanning.
- Client and project context kept separate from delivery movement.
- High-density tool look inspired by the Figma reference, without inventing unsupported business facts.
- Clear active navigation, primary action hierarchy, and mobile survivability.

## Fixed In This Pass
- High priority: active nav and primary actions were visually unreliable because custom primary utility classes rendered too pale in screenshots. Critical surfaces now use explicit Indigo utility classes.
- High priority: mobile board header metrics clipped horizontally. Header metric grids now fill mobile width and only use minimum desktop sizing at large breakpoints.
- Medium priority: long generated work-item/client/project labels made cards look noisy and unstable. Cards, list rows, detail metadata, and focus panels now use truncation or line clamping.
- Medium priority: screenshot capture was ad hoc. A reusable Playwright workflow capture script now records the review set.
- High priority: board cards overflowed and exposed repeated status controls. Board cards now fit inside columns and status movement happens through drag/drop.
- Medium priority: right-rail Today, Focus item, and always-visible create form consumed scanning space without clear workflow value. They were removed from the board and replaced with contextual column add controls.
- Medium priority: the desktop sidebar bottom required long page scrolling on content-heavy screens. The sidebar is now viewport-sticky and the account actions remain reachable.
- High priority: global creation needed a single predictable entry point. The app shell now provides a Global Add modal for work items, clients, projects, and client users.
- High priority: the client portfolio was too card-heavy and did not make active projects or work volume easy to scan. It now uses a cleaner portfolio row layout with project chips and workload signals.
- Medium priority: the board needed to behave more like a full work panel. The board area now scrolls internally with sticky status headers.
- High priority: the board and list view were competing on the same page. The board is now the default full-panel workspace, and the list is a separate tree mode grouped Client -> Project -> Work Item.
- High priority: the board header, metric cards, and status filter consumed too much vertical space for little operational value. Board controls are now a compact command row with search, client, project, and type filters only.
- High priority: column-level create affordances duplicated Global Add. Board creation now starts from the shell-level Global Add entry point.
- Medium priority: card content repeated project context and used large type pills. Cards now use a thin type-colored left edge, compact project text, title, and client context.
- Medium priority: work-item detail needed to match the shared record template seen in references. The detail page now uses a title/tabs header, main record area, assets drop zone under the description, comments, and a right-side info/status rail.

## Review Rules Going Forward
- Primary work surfaces must spend most of the first viewport on the work itself. Header metrics, explanatory copy, and filter chrome are review failures when they push the board or list below the fold.
- Board and list/table views should be separate view modes unless the user specifically asks for a split view.
- The primary left rail should stay focused on work views, not hierarchy management. Client and project navigation should come from List hierarchy links or from record-detail context links.
- View switching belongs in the left rail once Board/List are established there; avoid duplicating Board/List buttons in the top command row.
- A kanban card should not contain workflow forms, duplicate state controls, or repeated metadata. Movement belongs to drag/drop plus an accessible fallback; creation belongs to Global Add.
- Filters must match the visual model: do not filter by status on a kanban board where status is already expressed as columns.
- Search should appear once per work surface. Do not duplicate global/sidebar search and board filter search unless they intentionally serve different scopes.
- Client/project filtering should be one hierarchical picker. Client rows and project rows must be selectable, projects should be indented under clients, checkboxes should appear on hover or when selected, and checked rows must remain visibly selected.
- Type filtering should use the same multi-select dropdown behavior as client/project filtering. Filters should apply immediately on selection, without a separate Apply button, and dropdowns should close when users click outside.
- Kanban columns should sit directly in the board surface with clean separators. Avoid nested rounded column containers inside another rounded board container.
- Board columns should not have exterior gutters inside the main work surface unless the reference design explicitly calls for them.
- Long navigation and account controls must remain reachable independently of main content height.
- Detail screens for Client, Project, and Work Item should share the same construction: title/header, tabs or sections, description/context, assets directly beneath description, comments, and a right-side information rail.
- Do not show empty tabs. Hide Tasks, Issues, Relations, History, or similar sections until the underlying feature exists.
- Detail status controls should be direct state lists with a current-state indicator. Avoid Start, Back, Advance, dropdown, and Move controls competing in the same panel.
- Asset upload areas should submit from drag/drop or click-to-select directly; avoid a second upload button when the drop area is already the upload control.
- Comments should use a lightweight “Add comment” link that reveals the editor, keeping the record readable by default.
- Client and project detail navigation belongs in the Info rail on work-item detail screens, not as duplicate top-right buttons.
- Global Add should expose user-facing creation types such as Feature and Bug directly instead of requiring users to choose a generic work-item category first.
- Every visual review pass must capture desktop board, tree/list mode, client portfolio, client detail, project workspace, work-item detail, and mobile board screenshots before closeout.

## Findings

### Blockers
- Git/PR workflow is unavailable because this workspace is not a Git repository.

### High-Priority Fixes
- Server-action failures still lack designed inline recovery paths.
- Pending/success states are not yet consistently visible on mutation forms.
- Work-item detail still needs richer workflow controls and visible activity context.

### Medium Improvements
- Board cards still need stronger operational metadata such as comment count, asset count, updated time, and owner/assignee when those facts exist.
- Upload UI still needs real drag/drop handling plus visible type, size, batch, preview, and retry expectations.
- Filter precedence and selected client/project/type feedback need clearer feedback after compacting the toolbar.

### Low-Priority Polish
- Some panels remain visually similar; future passes can add more deliberate density tiers for summary, action, and record surfaces.
- Board drag/drop still needs an accessible non-pointer fallback before production accessibility acceptance.

### Future-Phase Ideas
- Saved filter views.
- Board swimlanes by client.
- Rich asset previews.

## Evidence Limits
- This was a visual and workflow screenshot pass, not a full WCAG audit.
- The Figma community template was used as a style and density reference, not as a source of product requirements.
- Human validation on another networked device is still required.

## Validation Log
- `pnpm lint`: passed.
- `pnpm test`: passed.
- `pnpm typecheck`: passed.
- `scripts/check-doc-links.sh`: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3002 node scripts/capture-workflow-screenshots.mjs`: passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3002 pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --config playwright.external.config.ts --project=chromium`: passed.
