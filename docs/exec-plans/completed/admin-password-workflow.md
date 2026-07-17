## Title

Admin-only clean launch state and authenticated password change

## Status

- Status: completed
- Owner: Codex
- Branch: main (no origin remote is configured)
- PR: Not applicable until a product remote is configured
- Last updated: 2026-07-16

## Summary

- Add an authenticated password-change workflow that verifies the current password.
- Deploy the workflow to Sheldon and leave one admin login at `mwood@digicolony.com`.
- Remove seeded/test clients, projects, work, users, activity, assets, and uploads while preserving required pipeline configuration.
- Password recovery by email and multi-factor authentication are out of scope.

## Work State

- Planned: Implement, validate, deploy, clean live data, initialize the admin credential, and verify rotation.
- In progress: None.
- Blocked: None; the temporary VPN/SSH outage cleared before deployment.
- Needs human validation: Matthew may replace the initialized password after handoff.
- Ready for review: None.
- Completed: Implemented and deployed the protected password workflow; cleaned live test data; retained one admin and required configuration; verified password rotation and rejection of the superseded password.

## Decisions

- Require the current password and a distinct 12–128 character replacement.
- Hash passwords with bcrypt cost 12, matching existing authentication behavior.
- Sign out after success and delete database-backed sessions for the user.
- Preserve pipeline statuses because they are required application configuration, not test content.
- Do not expose password hashes or server secret values in logs or validation evidence.

## Implementation

- Add `/settings/password`, its server action, validation helper, tests, and account navigation.
- Keep Auth.js credentials sign-in and the existing database schema stable.
- Use a transaction for live cleanup and assert the retained admin before commit.

## Validation

- Run formatting, lint/typecheck, unit tests, production build, Sheldon preflight, deployment health checks, and public HTTPS/Auth.js checks.
- Verify live table counts after cleanup and perform a sign-in/password-change/sign-in smoke test.
- Date checked: 2026-07-16.
- `vitest run`: 21 tests passed across 6 files.
- `tsc --noEmit -p apps/web/tsconfig.json`: passed after Prisma client generation.
- `next build apps/web`: passed; `/settings/password` is present as a dynamic route.
- Sheldon plan and remote preflight: passed after the VPN connection recovered.
- Sheldon release `20260717T001826Z`: deployed and healthy at origin and public HTTPS.
- Auth.js providers: public sign-in and callback URLs use `https://portal.digicolony.net`.
- Live database audit: one `ADMIN` user (`mwood@digicolony.com`), one password credential, four pipeline statuses, and zero rows in all client/work/test data tables.
- Upload audit: `/app/uploads` contains zero files.
- Live browser rotation: initialized password signed in, password change signed the user out, replacement password signed in, and the superseded password was rejected.
- Follow-up release `20260717T002819Z`: invalid credentials now return a generic sign-in error instead of an unhandled server-action digest; unknown-user and wrong-password browser paths are covered without changing the admin credential.

## Human Validation

- Owner: Matthew
- Exact steps: Sign in as `mwood@digicolony.com`, open Account > Change password, and replace the initialized password.
- Expected evidence: The app signs out after the update and accepts only the replacement password.
- Evidence location: Live portal at `https://portal.digicolony.net`.
- Blocks merge: No; automated live verification exercised the same workflow successfully.

## Documentation

- Update architecture, automation, project context, and deployment state documentation.
- This plan is stored in `docs/exec-plans/completed/` after live verification.

## Closeout

- Final status: Completed on 2026-07-16.
- Merge notes: No product origin remote is configured; document this review exception.
- Follow-up work: Consider password recovery and MFA before broader production use.
