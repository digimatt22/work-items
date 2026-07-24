# Client User Permissions Sheldon Deployment

## Outcome

- Live release: `20260724T134359Z`
- Source: commit `d3bd09b` only
- Public URL: `https://portal.digicolony.net`
- Origin: `127.0.0.1:39732`
- Application network: `172.30.0.0/16`
- Container user: `nextjs`

An earlier working-tree release packaged concurrent uncommitted project-picker
changes that appeared after the clean preflight. It was immediately superseded
by `20260724T134359Z`, built from a fresh archive of `d3bd09b`. The concurrent
workspace changes were neither overwritten nor committed and are not present in
the live release.

## Database Migration

- Migration: `0007_client_user_permissions`
- Repository SQL SHA-256: `95cae63ebaa595fdd69ae2fdea3c00854e55becf49ca0ca6f6cdf77d8cdbd520`
- Application method: reviewed raw SQL with `ON_ERROR_STOP` in one transaction
- Backup: `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-client-user-permissions-20260724T133857Z.dump`
- Backup SHA-256: `38919ac64d6eed231653e3ac9ea41d37309e0ff177085d94591e3701a4c9cb0f`
- Backup validation: `pg_restore --list` passed

Protected counts remained 3 users, 3 password credentials, 3 clients, 6
projects, and 1 work item. All three existing users retained the empty
permissions default.

## Verification

- Local production Docker build passed.
- Sheldon preflight passed with all required environment names present.
- The Sheldon image build passed 58 tests, Prisma generation, and the optimized
  Next.js production build.
- Origin and public `/api/health` returned HTTP 200.
- Auth.js provider URLs used canonical `https://portal.digicolony.net` sign-in
  and callback URLs.
- Database-backed administrator authentication and permission assignment UI
  checks passed without exposing server-only credentials.
- The application remained non-root on the persisted network and loopback-only
  port.
- Recent application logs contained no Prisma or application errors.

## Remaining Human Validation

Grant `MOVE_WORK_ITEMS` to a controlled client user, move one of that user's
visible requests from the board and detail page, revoke the grant, and confirm
the movement controls disappear and a direct status mutation is rejected.
