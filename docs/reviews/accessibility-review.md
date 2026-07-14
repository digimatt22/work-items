# Accessibility Review

## Scope
Code-informed review of the current work-items UI. This is not a full WCAG audit.

## Confirmed Strengths
- The app mostly uses native links, buttons, inputs, selects, textareas, and disclosure widgets.
- Sign-in fields have labels.
- Heading structure is generally present and meaningful.
- Color scheme is light and text contrast appears likely acceptable for primary text.
- Critical primary buttons, active nav, and focus rings now use explicit high-contrast Indigo utility classes.
- Mobile board header metrics no longer require horizontal clipping in the captured viewport.

## Likely Issues
- Destructive actions are plain text buttons without confirmation or danger styling.
- Error states are not announced inline or associated with fields.
- Status colors are used as border accents without a consistent non-color status treatment on every surface.
- Details/summary disclosure controls may be acceptable natively but need keyboard and screen-reader verification in context.
- File upload constraints are not described near the control.
- Pending state is not communicated for form submissions.
- A full keyboard-only pass has not yet been completed for details controls, status movement, uploads, and form submission recovery.

## WCAG-Relevant Considerations
- 1.4.1 Use of Color: status must not rely on color alone.
- 1.4.3 Contrast: verify slate text, accent links, status colors, disabled text, and danger styles.
- 2.1.1 Keyboard: verify filters, details controls, status movement, and forms.
- 2.4.3 Focus Order: verify sidebar-to-content-to-form flows.
- 2.4.7 Focus Visible: standardize focus rings.
- 3.3.1 Error Identification and 3.3.3 Error Suggestion: add field-level validation errors and recovery.
- 4.1.3 Status Messages: pending/success/error states should be communicated.

## Recommendations
- Continue standardizing reusable focus-visible styles for every interactive control.
- Add form field components with error text and `aria-describedby`.
- Add confirmation UI for destructive actions.
- Add accessible status movement controls before drag-and-drop.
- Run a keyboard-only pass and axe/Playwright accessibility checks before launch acceptance.

## Evidence Limits
- Playwright screenshots were captured for visual QA, but browser-based keyboard testing was not completed in this pass.
- Automated accessibility tooling was not run.
