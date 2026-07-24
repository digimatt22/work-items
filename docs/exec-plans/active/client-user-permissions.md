# Client User Permissions

## Status

- Status: needs human validation
- Owner: Codex
- Branch: `codex/client-user-permissions`
- PR: TBD
- Last updated: 2026-07-24

## Summary

- Add extensible per-user permissions for client users.
- Ship the first permission, `MOVE_WORK_ITEMS`, so selected client users can move their visible work between pipeline statuses.
- Preserve existing client scope, work-item visibility, admin authority, and AI-agent scopes.
- Additional permission types are out of scope.

## Work State

- Planned: schema, shared policy, authentication context, admin assignment UI, tests, and docs.
- In progress: none.
- Blocked: none.
- Needs human validation: admin assignment, grant revocation, and client-user movement controls in a database-backed browser session.
- Ready for review: pending validation.
- Completed: orientation and current-state gate.

## Decisions

- Store permissions as a PostgreSQL enum array on `User` so future grants do not require more role variants.
- A client user with `MOVE_WORK_ITEMS` may move only non-archived work items already visible to that user and belonging to their client.
- Refresh permissions into the JWT-backed session from the database on authenticated requests so grants and revocations do not require a new sign-in.
- lifeOS tooling was unavailable during orientation; no lifeOS context informed this change.

## Implementation

- Add the `UserPermission` enum and `User.permissions` field with an additive migration.
- Carry permissions through shared principals and Auth.js sessions.
- Update the shared movement policy and service visibility guard.
- Allow admins to assign movement permission when creating or editing a client user.
- Enable board drag/drop and detail-page status controls for authorized users.

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

## Human Validation

- Owner: Matthew or reviewer
- Exact steps: create or edit a client user with “Move work items”; sign in as that user; move one of their visible requests on the board and detail page; revoke the permission; confirm movement controls disappear and a direct status action is rejected.
- Expected evidence: screenshots or recording plus the moved item’s visible status activity.
- Evidence location: PR review notes
- Blocks merge: yes

## Documentation

- Update product architecture and project context with the permission model and migration.
- Move this plan to completed only after merge or intentional abandonment.

## Closeout

- Final status: implementation and automated validation complete; database-backed browser validation pending
- Merge or abandonment notes: TBD
- Follow-up work items: add future grants only alongside a shared policy, assignment UI, and regression tests.
