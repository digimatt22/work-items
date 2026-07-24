# Client User Permissions

## Status

- Status: ready for review
- Owner: Codex
- Branch: `codex/client-user-permissions`
- PR: https://github.com/digimatt22/work-items/pull/1
- Last updated: 2026-07-24

## Summary

- Add extensible per-user permissions for client users.
- Ship the first permission, `MOVE_WORK_ITEMS`, so selected client users can move their visible work between pipeline statuses.
- Make work-item creation scale to longer project lists by requiring
  administrators to select a client before selecting one of that client's
  projects, while keeping the client implicit for single-client users.
- Preserve existing client scope, work-item visibility, admin authority, and AI-agent scopes.
- Additional permission types are out of scope.

## Work State

- Planned: schema, shared policy, authentication context, admin assignment UI, tests, and docs.
- In progress: none.
- Blocked: none.
- Needs human validation: admin assignment, grant revocation, and client-user
  movement controls in a database-backed browser session.
- Ready for review: client-first administrator project selection and
  single-client reporting UX.
- Completed: orientation, current-state gate, implementation, authenticated
  picker tests, and desktop/mobile visual validation.

## Decisions

- Store permissions as a PostgreSQL enum array on `User` so future grants do not require more role variants.
- A client user with `MOVE_WORK_ITEMS` may move only non-archived work items already visible to that user and belonging to their client.
- Refresh permissions into the JWT-backed session from the database on authenticated requests so grants and revocations do not require a new sign-in.
- Administrator add forms select a client first and reset the selected project
  whenever the client changes. Client users remain scoped by their authenticated
  principal and never select a client.
- lifeOS tooling was unavailable during orientation; no lifeOS context informed this change.

## Implementation

- Add the `UserPermission` enum and `User.permissions` field with an additive migration.
- Carry permissions through shared principals and Auth.js sessions.
- Update the shared movement policy and service visibility guard.
- Allow admins to assign movement permission when creating or editing a client user.
- Enable board drag/drop and detail-page status controls for authorized users.
- Add a reusable project picker that groups administrator choices by client and
  keeps the client-user reporting form project-only.

## Validation

- `pnpm --filter @digicolony/db prisma:format` passed on 2026-07-24.
- `pnpm prisma:generate` passed on 2026-07-24.
- `pnpm lint` passed on 2026-07-24.
- `pnpm typecheck` passed on 2026-07-24.
- `pnpm test` passed on 2026-07-24: 58 tests across shared, database, MCP, and web packages.
- `pnpm build` passed on 2026-07-24, including the optimized Next.js production build.
- `scripts/check-doc-links.sh` passed on 2026-07-24.
- `git diff --check` passed on 2026-07-24.
- `pnpm format` remains a repository-wide baseline failure covering 145 pre-existing files; no bulk formatting rewrite was performed.
- The local production Docker image build passed on 2026-07-24, including 58 tests, Prisma generation, and the optimized Next.js build.
- Sheldon preflight passed with origin `127.0.0.1:39732`, persisted network `172.30.0.0/16`, and every required environment name present.
- Full backup `pre-client-user-permissions-20260724T133857Z.dump` passed `pg_restore --list`; migration `0007_client_user_permissions` applied transactionally with protected counts unchanged at 3 users, 3 credentials, 3 clients, 6 projects, and 1 work item.
- Sheldon release `20260724T134359Z`, packaged from committed source `d3bd09b` only, deployed successfully. Origin/public health, canonical Auth.js provider URLs, non-root execution, database-backed administrator authentication, the permission assignment UI, empty permission defaults, and recent error logs passed. An earlier over-inclusive working-tree release was immediately superseded after concurrent uncommitted project-picker changes were detected; those changes remain untouched in the workspace and are absent from the live release.
- Sheldon release `20260724T140218Z`, packaged from clean committed branch state
  `7d92fbc`, deployed the client/project picker successfully. The remote image
  build passed 58 tests and the optimized Next.js build; origin/public health,
  canonical Auth.js URLs, non-root execution, persisted port/network, recent
  logs, and the deployed picker source checksum passed. No database or
  credential change was performed.
- Focused picker tests passed on 2026-07-24.
- Authenticated administrator and client reporting picker tests passed on
  2026-07-24. Administrator coverage verifies the disabled initial project
  selector, per-client filtering, and reset behavior; client coverage verifies
  the absence of a client selector and projects outside the authenticated
  client scope.
- Desktop and 390 × 844 visual review passed on 2026-07-24 with no horizontal
  overflow. Evidence is recorded in
  `docs/reviews/client-project-picker-2026-07-24/`.
- Final `pnpm lint`, `pnpm typecheck`, `pnpm test` (58 tests), `pnpm build`,
  `scripts/check-doc-links.sh`, `git diff --check`, and focused changed-file
  Prettier checks passed on 2026-07-24.

## Human Validation

- Owner: Matthew or reviewer
- Exact steps: create or edit a client user with “Move work items”; sign in as
  that user; move one of their visible requests on the board and detail page;
  revoke the permission; confirm movement controls disappear and a direct status
  action is rejected.
- Expected evidence: screenshots or recording plus the moved item’s visible
  status activity.
- Evidence location: PR review notes
- Blocks merge: permission movement/revocation requires reviewer acceptance;
  picker validation is complete.

## Documentation

- Update product architecture and project context with the permission model and migration.
- Move this plan to completed only after merge or intentional abandonment.

## Closeout

- Final status: implementation, migration, client/project picker deployment,
  and automated/live smoke validation complete; client-user movement and
  revocation remain human validation
- Merge or abandonment notes: TBD
- Follow-up work items: add future grants only alongside a shared policy, assignment UI, and regression tests.
