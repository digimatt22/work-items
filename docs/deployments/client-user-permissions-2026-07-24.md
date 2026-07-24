# Client User Permissions Sheldon Deployment

## Outcome

- Live release: `20260724T140218Z`
- Source: clean committed branch state at `7d92fbc`
- Public URL: `https://portal.digicolony.net`
- Origin: `127.0.0.1:39732`
- Application network: `172.30.0.0/16`
- Container user: `nextjs`

The permission foundation was first deployed as `20260724T134359Z`, built from
a fresh archive of `d3bd09b` after an earlier over-inclusive working-tree
release was immediately superseded. The preserved project-picker work was then
reviewed, tested, committed, and deployed in `20260724T140218Z` from the clean
branch state at `7d92fbc`.

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
- The packaged `ProjectPicker.tsx` SHA-256 matched the committed local source:
  `3aec1a5f97366af8db3b0c90d7acbedaf9aa2cada4c2af31b9774967432b3778`.
- Migration `0007_client_user_permissions` was already applied; this picker
  release performed no database migration, reset, seed, or credential change.

## Remaining Human Validation

Grant `MOVE_WORK_ITEMS` to a controlled client user, move one of that user's
visible requests from the board and detail page, revoke the grant, and confirm
the movement controls disappear and a direct status mutation is rejected.
