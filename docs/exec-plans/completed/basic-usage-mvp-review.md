# Basic Usage MVP Review Checkpoint

Status: completed for UI/workflow review; live database validation follow-up documented

Date: 2026-06-26

## Objective

Complete the Basic Usage MVP Review Checkpoint for the DigiColony AI-First Client Operations Platform.

## Current Evidence

Validated in this environment:

```sh
pnpm lint
pnpm test
pnpm test:e2e
scripts/check-doc-links.sh
```

Results:

- TypeScript lint/typecheck passed across workspace packages.
- Vitest passed with 17 shared service tests.
- Playwright smoke passed with 5 route tests, including `/mvp-review`.
- Markdown link check passed.
- `pnpm db:start` exists and fails clearly when Docker is unavailable.
- `/mvp-review` provides a database-free UI/workflow review surface.

## Review-Ready Work Added

- Real credentials sign-in form at `/sign-in`.
- Seed data now creates:
  - demo client
  - admin user
  - client user
  - demo project
  - default pipeline statuses
- Docker Compose PostgreSQL service.
- `pnpm db:start` command.
- MVP review checklist and local database setup docs.
- MVP review mode at `/mvp-review`.

## Checklist Audit

| Requirement | Current evidence | Status |
| --- | --- | --- |
| Admin can view workspace shell | `/workspaces` route exists; `/mvp-review` shows admin workspace setup flow | Review checkpoint complete |
| Admin can create a client | Server action and shared service exist; `/mvp-review` shows client creation outcome | Review checkpoint complete |
| Admin can create a project | Server action and shared service exist; `/mvp-review` shows project creation outcome | Review checkpoint complete |
| Admin can create a client user | Server action and shared service exist; `/mvp-review` shows client user creation outcome | Review checkpoint complete |
| Client user can view projects for their client | Permission/service tests cover client-scoped visibility; `/mvp-review` shows client-scoped access | Review checkpoint complete |
| User can create a Bug work item | Server action, repository, service tests, and `/mvp-review` Bug example exist | Review checkpoint complete |
| User can create a Feature work item | Server action, repository, service tests, and `/mvp-review` Feature example exist | Review checkpoint complete |
| Admin can move work item status | Server action and service tests exist; `/mvp-review` shows status transition | Review checkpoint complete |
| User can comment on a work item | Server action, repository, service tests, and `/mvp-review` comment example exist | Review checkpoint complete |
| Mentions are persisted from comment text | Mention parser test, Prisma model, and `/mvp-review` mention example exist | Review checkpoint complete |
| User can upload an allowed asset | Server action, local storage provider, asset tests, and `/mvp-review` asset example exist | Review checkpoint complete |
| Client users do not see AI action details | Permission/activity tests and `/mvp-review` privacy note exist | Review checkpoint complete |

## Live Database Follow-Up

This environment does not have Docker or local PostgreSQL tools:

```sh
docker --version
docker compose version
which psql
which initdb
```

All are unavailable here. Because of that, authenticated seeded persistence validation remains a follow-up for a machine with Docker or PostgreSQL. The database-free MVP review surface is complete and available for UI/UX and workflow review.

## Follow-Up Action

Run this on a machine with Docker available:

```sh
cp .env.example .env
pnpm db:start
pnpm prisma:migrate
pnpm db:seed
pnpm dev
```

Then complete the manual review in [MVP Review Checklist](../../MVP_REVIEW_CHECKLIST.md).
