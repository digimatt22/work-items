# Design System

## Current Facts
- Tailwind is used directly in route/component markup.
- `packages/ui` exists but is a placeholder.
- `apps/web/app/globals.css` defines only base color scheme, body font stack, and box sizing.
- No token file, component catalog, Storybook, or state matrix exists.

## Recommended Token Set
- Color: `background`, `surface`, `surface-muted`, `border`, `text`, `text-muted`, `primary`, `primary-hover`, `accent`, `success`, `warning`, `danger`, `focus`.
- Radius: `sm` for inputs/buttons, `md` for cards/panels, avoid larger radii unless intentionally decorative.
- Spacing: compact operational scale from 4px to 32px.
- Type: page title, section title, card title, body, helper, metadata, badge.
- Shadow: one subtle panel shadow only.

## Figma-Informed Direction
- Use the Pickolab dashboard reference as a visual direction source: fixed left rail, strong top header, white cards on a soft app background, blue-violet active states, progress-rich cards, and right-side contextual panels.
- Adapt the visual language to DigiColony operational memory rather than copying placeholder dashboard content.
- Favor a modern command-center feel, but keep density high enough for repeated admin use.

## Component Priorities
1. Button with variants: primary, secondary, ghost, danger.
2. Text input, textarea, select, file input.
3. Form field wrapper with label, helper, error.
4. Badge/chip for status, type, filter, and count.
5. Page header with eyebrow, title, description, metrics.
6. Panel/card with consistent padding and heading.
7. Empty state and no-results state.
8. Alert/error message.
9. Confirmation dialog or confirmation page pattern.
10. Status movement controls.
11. App shell with sidebar, mobile top bar, and optional right context rail.
12. Metric card with count, trend/progress, and supporting label.
13. Context rail panel for focus item, filters, creation, assets, or activity.

## Accessibility Requirements
- Every interactive control must have visible focus.
- Text, status chips, and buttons must meet contrast expectations.
- Icon-only controls, if introduced, require accessible names and tooltips.
- Color cannot be the only status indicator.
- Form errors must be associated with fields.

## Codex Implementation Readiness
- Extracting components into `packages/ui` is safe only if it does not delay fixing UX blockers.
- First implementation pass should create local app components under `apps/web/app/components` or `packages/ui` consistently, then migrate repeated markup.
- Do not introduce a full design-system build pipeline until components repeat across at least Board, Clients, and Work Item detail.
