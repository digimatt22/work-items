# Initialize Sheldon Deployment

## Status

- Status: ready for review
- Owner: Codex
- Branch: `codex/initialize-sheldon-deployment`
- PR: unavailable; the repository has no `origin` remote
- Last updated: 2026-07-16

## Summary

- Initialize the existing Next.js monorepo for repeatable deployment to Sheldon.
- Add a production container build and a database-independent health endpoint.
- Generate the project-local Sheldon manifest, deployment runbook, and server configuration report.
- Server bootstrap and Cloudflare route mutation remain out of scope. The user later explicitly authorized the first application deployment, server-side app environment creation, and empty database initialization.

## Work State

- Planned: Initialize the Sheldon deployment files, add production runtime support, validate the application and deployment plan, and update operational docs.
- In progress: None.
- Blocked: Pull-request review is unavailable until an `origin` remote is configured.
- Needs human validation: Visual review of the live portal and a decision on durable asset storage.
- Ready for review: Project-local initialization, runtime support, tests, documentation, and non-mutating deployment plan.
- Completed: Project inspection, current-state gate, implementation, clean container build, runtime smoke check, server environment provisioning, deployment, database initialization/seed, Auth.js validation, and documentation validation.

## Decisions

- Use project slug `digicolony-client-ops` and hostname `portal.digicolony.net`.
- Use the Next.js production server on container port `3000`, bound to `0.0.0.0`.
- Use `/api/health` for deployment health checks without requiring authentication or a database query.
- Require `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, and the canonical public `AUTH_URL` in Sheldon's server-side environment file; never package the local `.env`.
- Leave `host_port` unset so the deployment tooling allocates a deterministic loopback-only port.
- PostgreSQL uses its rootful internal address on `172.18.0.0/16`; the deployed rootless application network is pinned to `172.30.0.0/16` to avoid a routing collision.
- Sheldon plugin `0.1.0+codex.20260717004457` excludes `.env*`, Git metadata, dependencies, build output, caches, uploads, and browser-test output, allowing direct project packaging without the former staging-tree workaround.

## Implementation

- Add a multi-stage production `Dockerfile` and matching `.dockerignore`.
- Add `apps/web/app/api/health/route.ts`.
- Enable Next.js standalone output for a minimal production runtime image.
- Generate `sheldon.json`, `SHELDON_DEPLOY.md`, and `server-configuration-report.md` with the bundled Sheldon CLI.
- Update deployment operations and project context documentation to match the initialized state.
- Deploy release `20260716T231115Z`, initialize and seed the empty database, and correct Auth.js's canonical public URL.
- Deploy release `20260717T122439Z` with atomic client-user provisioning, safe expected-failure handling, and the compact icon-based Add menu without changing credentials or seeding data.
- Prepare the next release with generated one-time client-user credentials, first-login password replacement, and Next.js deployment-skew protection; apply the additive production migration only after its separate live-operation authorization.
- Deploy release `20260717T132949Z` after applying the authorized additive credential migration. Verify public/origin health, Auth.js URLs, negative login behavior, non-root execution, persisted network configuration, and record preservation without changing existing passwords.

## Validation

- New TypeScript, JSON, and deployment-document content passed targeted formatting checks; existing repository Markdown table style was preserved to keep the review diff focused.
- TypeScript validation passed for the web, database, MCP, shared, and UI packages.
- The clean Linux production container build passed. It ran 17 unit tests, generated Prisma Client, and compiled the standalone Next.js application, including `/api/health`.
- The exact production image ran as user `nextjs`, published only on `127.0.0.1:39732`, logged no startup errors, and returned HTTP 200 with `{"status":"ok"}` from `/api/health`.
- The Sheldon CLI's non-mutating plan passed: target `portal.digicolony.net`, loopback origin `http://127.0.0.1:39732`, and health URL `http://127.0.0.1:39732/api/health`.
- Markdown links, Prettier formatting, and `git diff --check` passed.
- The local dependency tree contains Intel-native optional packages while the active Node runtime is Apple silicon, so direct local Vitest/Next execution could not load Rollup/SWC. Clean Linux container validation superseded those local attempts without rewriting the user's dependency tree.
- Full Playwright scenarios were not run because they require the database-backed review environment; the new deployment route was exercised directly against the production container.
- Generated files contain no live secret values. The Sheldon release tooling excludes `.env*`, dependency directories, build output, caches, Git metadata, uploads, and browser-test output; no release-eligible symlink was introduced.
- Release `20260716T231115Z` deployed successfully from a 340-file clean staging tree. The container runs non-root and publishes only `127.0.0.1:39732`.
- Release `20260717T122439Z` deployed successfully from 349 directly packaged files. Its container build passed 26 tests and the production build; origin health, public health, canonical Auth.js URLs, non-root execution, and the persisted `172.30.0.0/16` network passed.
- A read-only post-deployment check confirmed the existing one user, one password credential, two clients, four projects, and zero work items were preserved.
- The 390 × 844 Add-modal audit captured the closed board, long feature-request flow, and short client-user flow. The audit recommends a two-step full-screen mobile pattern while retaining the desktop side-by-side layout.
- The temporary-credential release passed 28 unit tests, web/database TypeScript checks, all 17 Playwright scenarios, and a clean production container build. The focused browser path verified creation, copy state, duplicate-email handling, forced-route enforcement, password replacement, and sign-in with the replacement credential.
- Sheldon plugin `0.1.0+codex.20260717125641` passed skill/plugin validation and was reinstalled after adding BuildKit-only Server Action secrets and per-release deployment IDs. Sheldon preflight passed with all required environment names present.
- Release `20260717T132949Z` deployed successfully from 357 packaged files. Its image build passed 28 tests and the production build; origin/public health, canonical Auth.js URLs, expected invalid-login UI, non-root execution, and the persisted `172.30.0.0/16` network passed.
- A read-only post-deployment check confirmed two users, two credentials, two clients, four projects, and zero work items. Bryan Kofsky's pre-release credential remained unchanged with no forced-change flag; the legacy flow sent no email.
- After explicit authorization, Bryan Kofsky's legacy account was deleted transactionally after confirming zero memberships, comments, or work-item relationships. The cascading credential was removed, leaving one admin user, one credential, and zero client users; public health remained HTTP 200.
- The application network was pinned to `172.30.0.0/16` after its automatically allocated subnet collided with PostgreSQL's rootful network; database connectivity then passed.
- Prisma synchronized the empty schema and seeded 2 users, 3 clients, and 8 work items using a generated server-only password.
- Origin health, public health, `/sign-in`, and `/api/auth/providers` returned HTTP 200. Auth.js advertised `https://portal.digicolony.net` callback URLs, and the seeded admin credential produced a valid session cookie.
- Date checked: 2026-07-16.

## Human Validation

- Owner: Matthew.
- Exact steps: Open `https://portal.digicolony.net`, sign in with a controlled seeded account using the server-only password, review primary workflows, and decide whether uploads should use a persistent volume or external object storage.
- Expected evidence: Primary screens render correctly and the selected upload strategy is recorded before relying on attachments.
- Evidence location: Append results to this plan or the deployment PR.
- Blocks merge: No; blocks reliance on durable uploads.

## Documentation

- Update `docs/AUTOMATIONS.md` and `docs/PROJECT_CONTEXT.md` with the local deployment contract.
- Keep this plan active as `ready for review` because the repository has no remote, even though the authorized live deployment is complete.

## Closeout

- Final status: Ready for review; project initialization and authorized live deployment are complete.
- Merge or abandonment notes: A pull request cannot be created until an `origin` remote is configured.
- Follow-up work items: Redesign the Add modal as a two-step full-screen mobile flow; configure the remote; add durable upload storage; and complete remaining visual human validation.
