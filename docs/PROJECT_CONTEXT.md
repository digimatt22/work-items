# Project Context

## Purpose

This repo contains the DigiColony AI-First Client Operations Platform, a Next.js application that provides shared operational memory for DigiColony, client users, and authorized AI agents.

## Current State

- The product is a pnpm monorepo with a Next.js App Router web application, Prisma/PostgreSQL persistence, Auth.js credentials authentication, shared contracts, and Playwright/Vitest coverage.
- The project is initialized for deployment to the Sheldon development server through `sheldon.json`, `Dockerfile`, `SHELDON_DEPLOY.md`, and `server-configuration-report.md`.
- Sheldon release `20260717T132949Z` is live at `https://portal.digicolony.net`; origin and public health, Auth.js callbacks, generic invalid-credential handling, non-root execution, the persisted application network, and database preservation were verified on 2026-07-17.
- The live database contains the sole admin and password credential, four required pipeline statuses, two user-created clients, four projects, and no work items. Existing user-created data must be preserved during deployment and diagnostics.
- Client-user identity and credential creation are atomic, and expected failures remain in the form. The deployed release passed 26 unit tests locally, 26 tests in the Sheldon image build, a targeted success/duplicate-email browser test, and production builds locally and on Sheldon.
- The deployed client-user flow generates unique temporary passwords, shows copy-ready username/password credentials once to the creating admin, and forces replacement before any other authenticated route. Validation passed 28 unit tests, TypeScript checks, all 17 browser scenarios, and clean local and Sheldon production container builds.
- Bryan's account was created immediately before the new release by the legacy flow and received no email because outbound email is not implemented. After confirming it had no memberships, comments, or work-item relationships, the account and cascading credential were explicitly deleted on 2026-07-17 so it can be recreated through the deployed one-time credential flow.
- Sheldon plugin `0.1.0+codex.20260717125641` adds per-release Next.js deployment IDs and exposes stable Server Action encryption keys to builds only through BuildKit secrets, reducing stale-tab failures without embedding the key in an image or release archive.
- The mobile Add modal audit is recorded in `docs/reviews/mobile-add-modal-audit-2026-07-17/`; its recommended follow-up is a two-step full-screen mobile flow with a separate chooser and form.

## lifeOS Registration

- Status: Proposed
- lifeOS project name: Development Harness
- Project registration proposal key: CTX-7
- Latest status update key: TBD
- Review status: Pending Matthew review
- Last checked: 2026-06-22
- Notes: When lifeOS MCP is available, run `lifeos.use(project_harness)` and `lifeos.find_project`. If the project is missing from lifeOS, submit `lifeos.propose_project_registration` and record the returned `CTX-*` key here. Record `STATUS-*` keys only when they matter for follow-up planning. Do not edit lifeOS profile files from this project workspace.

## Local Machine Notes

- This Mac uses MacPorts rather than Homebrew because it is running macOS 12.
- GitHub CLI is installed at `/opt/local/bin/gh`.
- GitHub CLI is authenticated as `MATT-Agent` and uses SSH for Git operations.
- Future agents should check `/opt/local/bin` before assuming Homebrew paths such as `/usr/local/bin` or `/opt/homebrew/bin`.

## Remote Repository Notes

- The local checkout currently has no `origin` remote configured, so push and pull-request review are blocked.
- The older harness documentation identifies `MATT-Agent/DigiColony-Harness` as its upstream source; that is not configured as this product checkout's remote.
- Default branch: `main`.
- Branch protection and repository rulesets are currently unavailable for this private repo on the active GitHub account plan. GitHub API calls return a `403` requiring GitHub Pro or a public repository.
- Until protection is available, treat direct pushes to `main` as an explicit exception that must be documented in an execution plan.

## Runtime Assumptions

- Node.js 22 or newer and pnpm 9.15.4 are required.
- The web app builds with Next.js 15 and serves production traffic on `0.0.0.0:3000`.
- Runtime persistence requires PostgreSQL through `DATABASE_URL`; authentication requires `AUTH_SECRET` and trusted-host configuration.
- Sheldon allocates a deterministic loopback host port, fronts it with Caddy, and requires a separate Cloudflare Tunnel route for public HTTPS.
- The deployed rootless application network uses `172.30.0.0/16` so it does not collide with PostgreSQL's rootful `172.18.0.0/16` network.

## Repository Inventory

| Area                              | Current role                                                                | Notes                                                                     |
| --------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `AGENTS.md`                       | Compact agent entrypoint                                                    | Keep short and link to durable docs                                       |
| `.harness/version.json`           | Harness version marker                                                      | Update during harness sync                                                |
| `.harness/core-files.txt`         | Allowlist of files managed by harness sync                                  | Keep project-owned docs out unless intentional                            |
| `.harness/version.template.json`  | Template for downstream version marker                                      | Core sync file                                                            |
| `docs/WORKFLOW.md`                | Standard collaboration and delivery process                                 | Update when team workflow changes                                         |
| `docs/ARCHITECTURE.md`            | System model and design record                                              | Replace generic sections with project facts                               |
| `docs/AUTOMATIONS.md`             | Jobs, automations, commands, and operational entrypoints                    | Keep aligned with scripts and CI                                          |
| `docs/BOOTSTRAP_CHECKLIST.md`     | Checklist for adapting the harness to a new project                         | Complete before routine project work                                      |
| `docs/HARNESS_BOUNDARIES.md`      | Protected-core versus project-owned file policy                             | Read before syncing harness changes                                       |
| `docs/HARNESS_SYNC.md`            | Workflow for updating downstream project harness copies                     | Use with `.harness/core-files.txt`                                        |
| `docs/INBOX.md`                   | Rules for supplemental repo-tracked context                                 | Use when users provide extra files or references                          |
| `docs/LIFEOS_INTEGRATION.md`      | lifeOS MCP context, project registration, review queue, and status guidance | Read during orientation, project intake, closeout, and lifeOS review work |
| `docs/PROJECT_INTAKE_WORKFLOW.md` | Agent-led workflow for repo review, user intake, and repo-map creation      | Run after copying harness into a real repo                                |
| `docs/PROJECT_OVERRIDES.md`       | Project-specific deviations from protected harness core                     | Project-owned; do not overwrite during sync                               |
| `docs/REPO_MAP.md`                | Concise map of important files, commands, risks, and validation paths       | Keep updated as structure changes                                         |
| `docs/ISSUES_AND_BACKLOG.md`      | Conventions for work tracking across plans, issues, and backlog docs        | Link external trackers from plans                                         |
| `docs/REPOSITORY_HEALTH.md`       | Readiness checklist for shared development                                  | Use before importing into first project                                   |
| `docs/TOOL_ADAPTERS.md`           | Guidance for thin tool-specific instruction adapters                        | Add adapters only when tools are active                                   |
| `docs/VALIDATION.md`              | Validation levels, contracts, and human checks                              | Keep aligned with `docs/AUTOMATIONS.md`                                   |
| `docs/REFERENCES.md`              | External references and compatibility notes                                 | Add source links and dates when relevant                                  |
| `docs/exec-plans/active/`         | In-progress work plans                                                      | One plan per non-trivial change                                           |
| `docs/exec-plans/completed/`      | Completed work plans                                                        | Move plans here when merged or closed                                     |
| `docs/templates/`                 | Reusable spec, plan, and runbook templates                                  | Update templates when repeated gaps appear                                |
| `scripts/install-harness.sh`      | Canonical harness install/update entrypoint                                 | Used by hosted bootstrap and local wrappers                               |
| `scripts/bootstrap-install.sh`    | Tiny bootstrap script for `https://harness.digicolony.com/install`          | Contains no protected harness content; clones private upstream over SSH   |
| `scripts/check-doc-links.sh`      | Local Markdown link checker                                                 | Run before documentation-heavy PRs                                        |
| `scripts/check-inbox.sh`          | Local inbox index checker                                                   | Run when `Inbox/` changes                                                 |
| `scripts/update-harness.sh`       | Local harness update wrapper                                                | Run from downstream project repos after install                           |

## Collaboration Assumptions

- A real project should use Git with a configured remote.
- Mainline work should be protected by pull requests.
- Agents should sync with the remote before starting work and before opening a PR.
- Work state should be recorded in execution plans, not only in chat.
- Validation evidence should be captured in the plan or PR notes.

## Repo Constraints

- The local filesystem asset provider is not durable across Sheldon container replacement until persistent storage is added.
- The deployed Compose network retains its existing `172.30.0.0/16` application subnet; the updated Sheldon plugin persists existing networks and collision-checks new allocations.
- No CI workflow is included yet.
- Sheldon deployment and rollback procedures are defined, and the first live deployment has completed.
- Branch protection policy is defined in docs but cannot be enforced on the private remote with the current GitHub account plan.

## Known Unknowns

- The durable production asset storage strategy
- CI provider and required checks
- Reviewers, code owners, and merge policy
