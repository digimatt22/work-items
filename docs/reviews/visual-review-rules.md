# Visual Review Rules

Use these rules when reviewing generated screenshots or a running UI. A pass requires both automated workflow checks and human-style visual inspection of the captured screens.

## Required Evidence
- Capture desktop board, project workspace, clients, client detail, work-item detail, and mobile board screenshots.
- Open the screenshots before closeout; do not rely only on route status, compile success, or Playwright assertions.
- Record the screenshot directory and the server URL used for capture.

## Fail Conditions
- Any card, button, form field, badge, menu, or panel visually overlaps another element.
- Text escapes its card, button, column, sidebar, or viewport.
- Inline edit controls must stay inside the same card, row, or panel they edit. Opening edit mode must not create a floating form that overflows adjacent content or changes to an unrelated shape.
- Edit triggers should become Cancel triggers while edit mode is open.
- A persistent sidebar action requires page-length scrolling to reach.
- A dense work surface includes a decorative widget that does not answer a clear user question.
- A repeated item card contains controls duplicated by the surrounding workflow.
- A form is always visible on a scanning surface when a contextual action would preserve focus.
- Contextual edit forms should preserve the surrounding layout width and hierarchy; verify both closed and open edit states at desktop and mobile widths.
- A hover-only affordance is unavailable on touch viewports.
- A fixture or placeholder widget shows misleading data, such as stale calendar dates.

## Board-Specific Rules
- Status is implied by the column; cards should not repeat status dropdowns or move buttons.
- Users should be able to create work directly in the intended column without selecting status.
- Drag/drop movement must be browser-tested, not only typechecked.
- Column layout must minimize vertical travel without causing horizontal clipping.
- Long seeded IDs and titles must wrap, clamp, or truncate inside the card.

## Review Prompt Structure
Give the reviewer or agent:
- The target user and primary workflow.
- The source of visual truth or product direction.
- The exact routes and viewports to capture.
- The interaction states to test, including hover, modal, drag/drop, mobile, empty, and long-content states.
- The fail conditions above as acceptance criteria.
