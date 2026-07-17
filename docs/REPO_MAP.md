# Repo Map

This file helps agents target future reads and avoid scanning the whole repo for every request. Keep it concise and update it when the project structure changes.

## Project Summary

- Purpose: AI-first client operations platform and shared operational memory for DigiColony, clients, and authorized AI agents.
- Primary language/framework: TypeScript, Next.js App Router, Prisma, PostgreSQL-ready schema.
- Package manager: pnpm 9.15.4 through Corepack.
- Runtime entrypoints: `pnpm dev` for the web app, `pnpm start` after `pnpm build` for production-like review.
- Test entrypoints: `pnpm lint`, `pnpm test`, focused Playwright specs, `pnpm prisma:generate`.
- Deployment entrypoint: `sheldon.json` and `Dockerfile` through the `$deploy-to-sheldon` skill.

## High-Value Files

| Path                                    | Why it matters                                                                | When to read                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `README.md`                             | Project overview and quick start                                              | Before broad project work                                                       |
| `AGENTS.md`                             | Agent instructions and read order                                             | At the start of agent work                                                      |
| `docs/PROJECT_CONTEXT.md`               | Current facts, constraints, unknowns                                          | Before planning changes                                                         |
| `docs/ARCHITECTURE.md`                  | System boundaries and contracts                                               | Before behavior or integration changes                                          |
| `docs/AUTOMATIONS.md`                   | Commands, jobs, and operational entrypoints                                   | Before validation or operations work                                            |
| `docs/GITHUB_ISSUE_WORKFLOW.md`         | GitHub issue-session process                                                  | Before pulling issues into agent work                                           |
| `docs/LIFEOS_INTEGRATION.md`            | lifeOS MCP context, project registration, review queue, and status guidance   | During orientation, intake, closeout, and lifeOS review work                    |
| `docs/INBOX.md`                         | Supplemental context rules                                                    | When user provides extra files or references                                    |
| `.harness/version.json`                 | Harness version marker                                                        | Before syncing harness changes                                                  |
| `scripts/install-harness.sh`            | Canonical install/update behavior                                             | Before changing bootstrap or sync behavior                                      |
| `scripts/bootstrap-install.sh`          | Hosted curl bootstrap content                                                 | Before publishing `https://harness.digicolony.com/install`                      |
| `docs/dpaf/`                            | DPAF planning source                                                          | Before product or architecture changes                                          |
| `docs/prd/launch-decisions-addendum.md` | Launch decisions folded into PRD support docs                                 | Before launch-scope behavior changes                                            |
| `docs/adr/`                             | Accepted architecture decisions                                               | Before changing boundaries, auth, audit, storage, search, or work item modeling |
| `packages/db/prisma/schema.prisma`      | Prisma schema skeleton                                                        | Before database or domain model changes                                         |
| `packages/shared/src/`                  | Shared contracts and permissions                                              | Before web, MCP, or domain behavior changes                                     |
| `packages/mcp/src/`                     | MCP tool and scope contracts                                                  | Before MCP work                                                                 |
| `apps/web/app/`                         | Next.js app shell                                                             | Before UI or route work                                                         |
| `sheldon.json`                          | Sheldon hostname, port, health, Dockerfile, and required environment contract | Before planning, deploying, inspecting, or rolling back on Sheldon              |
| `SHELDON_DEPLOY.md`                     | Project-specific deployment prerequisites and live-operation guardrails       | Before any Sheldon operation                                                    |
| `Dockerfile`                            | Production standalone Next.js image                                           | Before changing runtime dependencies or deployment behavior                     |
| `docs/MVP_REVIEW_CHECKLIST.md`          | Basic usage review checklist                                                  | Before UI/UX and workflow review                                                |

## Source Layout

| Area               | Purpose                                            | Notes                                                                                                                                                            |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/`        | Next.js App Router app                             | Authenticated admin and client MVP surfaces, including `/work-items`, `/report`, `/clients`, `/projects/[projectId]`, `/status-report`, and `/settings/password` |
| `packages/db/`     | Prisma schema and database package                 | No migrations yet                                                                                                                                                |
| `packages/shared/` | Shared contracts, permission predicates, and tests | Source of truth for web/MCP policy helpers                                                                                                                       |
| `packages/ui/`     | Shared UI package                                  | Placeholder in Phase 0                                                                                                                                           |
| `packages/mcp/`    | MCP tool contract helpers                          | Placeholder in Phase 0                                                                                                                                           |
| `tests/e2e/`       | Playwright test home                               | Authenticated admin/client scenario tests                                                                                                                        |
| `Inbox/`           | Supplemental context drops                         | Repo-tracked, not active source by default                                                                                                                       |
| `.harness/`        | Harness version and sync metadata                  | Keep generic; update through harness sync                                                                                                                        |

## Commands

| Command                                                                                     | Purpose                                                                                               | Notes                                                             |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `corepack prepare pnpm@9.15.4 --activate`                                                   | Activate pinned package manager                                                                       | Run before install if pnpm is unavailable                         |
| `pnpm install`                                                                              | Install workspace dependencies                                                                        | Creates `pnpm-lock.yaml`                                          |
| `pnpm dev`                                                                                  | Start Next.js app                                                                                     | Serves `apps/web` on localhost                                    |
| `pnpm start`                                                                                | Start built Next.js app                                                                               | Run after `pnpm build` for production-like review                 |
| `pnpm lint`                                                                                 | Typecheck/lint workspace packages                                                                     | Phase 0 static validation                                         |
| `pnpm test`                                                                                 | Run Vitest across workspace packages                                                                  | Shared permission tests included                                  |
| `pnpm prisma:generate`                                                                      | Generate Prisma client                                                                                | Uses `packages/db/prisma/schema.prisma`                           |
| `$deploy-to-sheldon` plan                                                                   | Preview target, allocated loopback port, health URL, required environment names, and Cloudflare route | Non-mutating; run before requesting live deployment authorization |
| `scripts/check-doc-links.sh`                                                                | Check local Markdown links                                                                            | Harness structural validation                                     |
| `scripts/check-inbox.sh`                                                                    | Check inbox index consistency                                                                         | Run when `Inbox/` changes                                         |
| `curl -fsSL https://harness.digicolony.com/install \| bash`                                 | Install or update harness in current directory                                                        | Requires GitHub SSH access to private upstream                    |
| `curl -fsSL https://harness.digicolony.com/install \| bash -s -- --target /path/to/project` | Install or update harness in a specific directory                                                     | Preferred path for existing projects                              |
| `scripts/new-project.sh --dry-run /path/to/new-project`                                     | Preview creating a new project from the harness                                                       | Run before first real project bootstrap                           |
| `scripts/install-harness.sh --dry-run --target /path/to/project`                            | Preview local install/update from this checkout                                                       | Use while developing the harness itself                           |
| `scripts/update-harness.sh --dry-run`                                                       | Preview harness sync from private upstream                                                            | Run from downstream project repo                                  |
| `scripts/start-issue-session.sh <session> <issues...>`                                      | Import GitHub issues into a session branch                                                            | Run when user starts issue work                                   |

## Test And Validation Map

| Change type            | First files to inspect                                                                                                               | Checks to run                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Documentation          | `README.md`, `AGENTS.md`, `docs/`                                                                                                    | `scripts/check-doc-links.sh`                                                                         |
| Inbox context          | `docs/INBOX.md`, `Inbox/README.md`, `Inbox/`                                                                                         | `scripts/check-inbox.sh`; `scripts/check-doc-links.sh`                                               |
| GitHub issue session   | `docs/GITHUB_ISSUE_WORKFLOW.md`, generated `docs/issue-sessions/`                                                                    | `scripts/check-current-state.sh`; `scripts/check-doc-links.sh`; GitHub issue comments                |
| lifeOS integration     | `docs/LIFEOS_INTEGRATION.md`, `docs/PROJECT_INTAKE_WORKFLOW.md`, `docs/PROJECT_CONTEXT.md`                                           | Verify startup, context discovery, project registration, review queue, and status guidance           |
| Harness install/update | `scripts/install-harness.sh`, `scripts/bootstrap-install.sh`, `scripts/update-harness.sh`, `docs/HARNESS_SYNC.md`                    | `bash -n` scripts; temp empty, existing, and older-version installs                                  |
| New project bootstrap  | `scripts/new-project.sh`, `scripts/install-harness.sh`, `docs/SETUP.md`, `docs/BOOTSTRAP_CHECKLIST.md`, `docs/LIFEOS_INTEGRATION.md` | `bash -n scripts/new-project.sh`; dry-run and temporary real copy                                    |
| Runtime behavior       | `apps/web/`, `packages/shared/`, `packages/db/`                                                                                      | `pnpm lint`; `pnpm test`; focused Playwright specs; `pnpm build`; `pnpm prisma:generate`; `pnpm dev` |
| Operations             | `docs/AUTOMATIONS.md`, `docs/LOCAL_DEVELOPMENT.md`, runbooks                                                                         | Relevant command from docs plus smoke check                                                          |
| Sheldon deployment     | `sheldon.json`, `SHELDON_DEPLOY.md`, `Dockerfile`, health route                                                                      | Lint, tests, production build, local container build when available, non-mutating deployment plan    |

## Risky Areas

| Area                 | Risk                                                  | Required caution                                         |
| -------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Web/MCP policy split | Permission drift or audit gaps                        | Route all future writes through shared services/policies |
| AI action visibility | Client users could see internal agent work            | Keep AI events admin-only by default                     |
| Asset storage        | Local filesystem assumptions could block S3 migration | Use storage provider contract                            |
| Search               | Client data leakage                                   | Apply client-scoped filters at query construction        |

## External Systems

| System     | Used by                                                                                     | Access or validation notes                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| lifeOS MCP | Project orientation, registration proposals, context review queue, and outcome-level status | Use `project_harness` first; do not disclose private context externally or edit lifeOS profile files from project workspaces |

## Known Gaps

- Local Git repository exists, but no `origin` remote is configured yet.
- CI provider is not selected.
- CI and remote PR review remain blocked until a remote exists.
- Sheldon is live; durable upload storage remains unresolved. The deployment plugin excludes runtime uploads and allocates collision-checked application subnets.
