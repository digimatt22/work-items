# Client/Project Picker Visual Review

## Scope

- Date: 2026-07-24
- Local app: authenticated administrator and client-user sessions
- Viewports: default desktop (1280 × 720 capture) and mobile (390 × 844)
- Routes: administrator work-item creation from `/work-items` and client
  reporting at `/report`

## Results

1. **Administrator, initial state — healthy**
   - The Client selector appears before Project.
   - Project is disabled and reads “Select client first.”
   - The form remains readable and vertically scrollable at desktop and mobile
     widths.
   - Evidence:
     [desktop](01-admin-initial-desktop.jpg),
     [mobile](03-admin-initial-mobile.jpg)
2. **Administrator, filtered state — healthy**
   - Selecting DigiColony Demo Client enables Project.
   - The available projects are limited to Client Portal MVP, Executive
     Reporting Dashboard, and Work Items.
   - Selecting a project and then changing the client clears the project value
     and replaces the options with the newly selected client's projects.
   - Evidence: [desktop](02-admin-filtered-desktop.jpg)
3. **Client reporting — healthy**
   - No Client selector is rendered.
   - Project remains enabled and contains only the authenticated client's
     server-authorized projects.
   - Patient Intake Modernization, which belongs to another client, is absent.
   - Evidence:
     [desktop](04-client-project-desktop.jpg),
     [mobile](05-client-project-mobile.jpg)

## Responsive And Accessibility Checks

- At 390 px, `documentElement.scrollWidth` and `body.scrollWidth` both matched
  `window.innerWidth`; no horizontal overflow was present in either flow.
- Native labeled `select` controls expose the accessible names “Client” and
  “Project.” The disabled/enabled dependency is also covered by authenticated
  Playwright assertions.
- The mobile modal keeps the picker above the title and details fields and
  provides an internal vertical scroll region.
- Full assistive-technology testing, browser zoom testing, and a complete
  keyboard-only journey were not performed in this visual pass.

## Verdict

The picker is ready for review. Its hierarchy, filtering behavior, reset
behavior, responsive layout, and client-scope presentation match the intended
workflow. No visual defect requiring another implementation change was found.
