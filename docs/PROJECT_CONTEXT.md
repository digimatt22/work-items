# Project Context

## Purpose

This repo contains the DigiColony AI-First Client Operations Platform, a Next.js application that provides shared operational memory for DigiColony, client users, and authorized AI agents.

## Current State

- The product is a pnpm monorepo with a Next.js App Router web application, Prisma/PostgreSQL persistence, Auth.js credentials authentication, shared contracts, and Playwright/Vitest coverage.
- The project is initialized for deployment to the Sheldon development server through `sheldon.json`, `Dockerfile`, `SHELDON_DEPLOY.md`, and `server-configuration-report.md`.
- Sheldon release `20260724T140218Z`, packaged from clean committed source `7d92fbc`, is live at `https://portal.digicolony.net`; origin and public health, canonical Auth.js URLs, non-root execution, the persisted application network, per-client-user permission assignment, and the client/project picker source checksum were verified on 2026-07-24.
- The live database contains three users, three password credentials, three clients, six projects, and one work item as of the protected-count verification on 2026-07-24. Existing user-created data must be preserved during deployment and diagnostics.
- Client-user identity and credential creation are atomic, and expected failures remain in the form. The deployed release passed 26 unit tests locally, 26 tests in the Sheldon image build, a targeted success/duplicate-email browser test, and production builds locally and on Sheldon.
- The deployed client-user flow generates unique temporary passwords, shows copy-ready username/password credentials once to the creating admin, and forces replacement before any other authenticated route. Validation passed 28 unit tests, TypeScript checks, all 17 browser scenarios, and clean local and Sheldon production container builds.
- Bryan's account was created immediately before the new release by the legacy flow and received no email because outbound email is not implemented. After confirming it had no memberships, comments, or work-item relationships, the account and cascading credential were explicitly deleted on 2026-07-17 so it can be recreated through the deployed one-time credential flow.
- Sheldon plugin `0.1.0+codex.20260717125641` adds per-release Next.js deployment IDs and exposes stable Server Action encryption keys to builds only through BuildKit secrets, reducing stale-tab failures without embedding the key in an image or release archive.
- The mobile Add modal audit is recorded in `docs/reviews/mobile-add-modal-audit-2026-07-17/`; its recommended follow-up is a two-step full-screen mobile flow with a separate chooser and form.
- The pre-expansion platform state is preserved at commit `c008778` with annotated tag `v0.0.0`.
- A Digi-CTO v0.3.0 expansion pack defines the path from customer request intake to project-bound AI-agent delivery under `docs/dpaf/expansion/`.
- Digi-Portal provides the database foundation, non-secret `.work-items/project.json` contract, admin-only qualification policy, lease/dispatch transition guards, audit/outbox writes, OAuth-protected read tooling, independent rollout flags, and an admin binding screen. Sheldon migrations `0004_agent_delivery_foundation` and `0005_digi_portal_oauth` are applied, administrator binding setup is enabled against `https://portal.digicolony.net`, no live binding or OAuth grant exists yet, and agent reads and mutations remain disabled.
- Project workspaces support admin-only Garage-backed deliverable upload and one-file public shares with generated one-time passwords, required expiry, revocation, five-attempt lockout, and download evidence. Live validation covered wrong-password rejection, exact-byte anonymous download, and revocation.
- Shared Sheldon storage is `sheldon-garage` v2.2.0 with private bucket `digicolony-client-ops` and persistent `sheldon-garage-meta`/`sheldon-garage-data` volumes. Two S3-backed validation assets survived application redeployment and a Garage restart; both validation shares are revoked.
- Backup `garage-20260721T201449Z.tgz` restored successfully into isolated temporary volumes and passed Garage bucket, key, and statistics checks. Off-server backup and retention cadence remain operational follow-up decisions.
- Client users support enum-backed per-user permission grants. The initial `MOVE_WORK_ITEMS` grant lets an administrator authorize a client user to move only work items already visible to that user within their client; additive migration `0007_client_user_permissions` and release `20260724T140218Z` are live on Sheldon.
- Work-item intake uses client-first project selection for administrators to
  keep long project lists navigable. Single-client users never select a client;
  their report form lists only projects authorized by their authenticated
  client scope.
- The Work Items Sheldon Deploy 0.2.0 migration is active on
  `codex/sheldon-deploy-0-2-migration`. Read-only inventory reconfirmed the
  protected database counts, Garage object count/bytes, canonical Auth.js URLs,
  non-root runtime, resource gaps, backup metadata, and current release
  retention without changing live state.
- `/api/health` remains process-only liveness. The candidate adds `/api/ready`,
  which checks PostgreSQL and the configured Garage bucket in parallel with a
  bounded deadline and returns only sanitized `ok`/`unavailable` states.
- Manifest schema 2 is blocked on the released Sheldon Deploy 0.2.0 validator;
  the canonical plugin checkout currently contains unreleased, uncommitted
  packaging work and is not treated as the contract.

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

- The local checkout uses `git@github.com:digimatt22/work-items.git` as `origin`; feature work is published through pull requests.
- The older harness documentation identifies `MATT-Agent/DigiColony-Harness` as its upstream source; that is separate from this product checkout's configured remote.
- Default branch: `main`.
- Branch protection and repository rulesets are currently unavailable for this private repo on the active GitHub account plan. GitHub API calls return a `403` requiring GitHub Pro or a public repository.
- Until protection is available, treat direct pushes to `main` as an explicit exception that must be documented in an execution plan.

## Runtime Assumptions

- Node.js 22 or newer and pnpm 9.15.4 are required.
- The web app builds with Next.js 15 and serves production traffic on `0.0.0.0:3000`.
- Runtime persistence requires PostgreSQL through `DATABASE_URL`; authentication requires `AUTH_SECRET` and trusted-host configuration.
- Sheldon allocates a deterministic loopback host port, fronts it with Caddy, and requires a separate Cloudflare Tunnel route for public HTTPS.
- The deployed rootless application network uses `172.30.0.0/16` so it does not collide with PostgreSQL's rootful `172.18.0.0/16` network.
- Schema-2 rollout targets retain 2 GiB memory and 1.5 CPU limits and add a PID
  limit, deployment lock, exact-commit provenance, bounded release retention,
  dependency readiness, and drift reporting.

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

- Local development still defaults to filesystem storage; Sheldon requires the configured Garage S3 provider and fails preflight when its required environment names are absent.
- Public project deliveries stream through the application from Garage after authorization. Garage is a single-node development deployment, so a Sheldon disk/server failure remains a risk until backups are copied off-server.
- The deployed Compose network retains its existing `172.30.0.0/16` application subnet; the updated Sheldon plugin persists existing networks and collision-checks new allocations.
- No CI workflow is included yet.
- Sheldon deployment and rollback procedures are defined, and the first live deployment has completed.
- Database migration, database backup/restore, Garage topology/policy,
  secrets, Caddy, container recreation, deployment, and rollback remain
  separately approved operations.
- Branch protection policy is defined in docs but cannot be enforced on the private remote with the current GitHub account plan.

## Known Unknowns

- Off-server Garage backup target, retention schedule, and restore-drill cadence
- A real second application Garage bucket for live HTTP `403` isolation proof
- An isolated restore check for the latest Work Items PostgreSQL full backup
- Released and installed Sheldon Deploy 0.2.0 manifest schema and CLI
- CI provider and required checks
- Reviewers, code owners, and merge policy
- Hosted ChatGPT Work's project-to-binding selection and verification handshake; the web surface cannot depend on a local repository config file
- Production ownership and rotation policy for Digi-Portal OAuth grants and project-binding credentials
