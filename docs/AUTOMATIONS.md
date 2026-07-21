# Automations

This file is the operational source of truth for jobs, scripts, scheduled tasks, CI workflows, manual runbooks, and other entrypoints. Keep trigger cadence as `Unknown` when it is not discoverable from code or project documentation.

## Inventory

Add one section per operational entrypoint.

## Product workspace commands

| Field                        | Details                                                                                                                                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                         | `pnpm` workspace commands                                                                                                                                                                                                           |
| Purpose                      | Install, run, validate, and generate the DigiColony Client Operations Phase 0 harness                                                                                                                                               |
| Trigger type                 | Manual local development                                                                                                                                                                                                            |
| Schedule or invocation       | `pnpm install`; `pnpm dev`; `pnpm build`; `pnpm start`; `pnpm lint`; `pnpm test`; `pnpm prisma:generate`; `pnpm db:review:reset`; `pnpm audit:launch-evidence`                                                                      |
| Inputs                       | `.env` copied from `.env.example`; package manifests; Prisma schema at `packages/db/prisma/schema.prisma`; Digi-Portal URL and independently gated binding/read/mutation flags                                                      |
| Secrets                      | Local `.env` values; do not commit real secrets                                                                                                                                                                                     |
| Systems touched              | Local filesystem, local Node package cache, optional local PostgreSQL in later phases                                                                                                                                               |
| Outputs or state transitions | `node_modules/`, `pnpm-lock.yaml`, generated Prisma client, running Next.js dev server, project deliverable assets/shares when used, and inert pending Digi-Portal bindings when the admin-only diagnostic flag is enabled          |
| Failure mode                 | Missing pnpm/Corepack, dependency registry unavailable, sandbox blocks port binding, Prisma engine cache permissions                                                                                                                |
| Retry or recovery            | Enable Corepack, rerun install, run Prisma generation with cache access, or use a free local port                                                                                                                                   |
| Automated verification       | `pnpm prisma:generate`; `pnpm lint`; `pnpm test`; `pnpm build`; `pnpm dev` or `pnpm start` plus HTTP 200 probe; `pnpm db:review:reset` before MVP screenshot review; `pnpm audit:launch-evidence` before launch-readiness PR review |
| Human verification           | Browser review of authenticated workflows plus private-browser verification of password-protected project delivery, wrong-password behavior, correct download, expiry, and revocation                                               |
| Owner or reviewer            | DigiColony engineering                                                                                                                                                                                                              |
| Unknowns / follow-up         | CI provider remains undecided; use the repository-pinned package-manager version when normalizing local dependencies                                                                                                                |

## Sheldon deployment

| Field                        | Details                                                                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                         | Sheldon project deployment                                                                                                                                                                                                                                                |
| Purpose                      | Build, release, inspect, and roll back the DigiColony Client Operations app on the Sheldon development server                                                                                                                                                             |
| Trigger type                 | Manual, through the `$deploy-to-sheldon` Codex skill                                                                                                                                                                                                                      |
| Schedule or invocation       | Non-mutating plan and remote preflight first; deploy, status, and rollback through the bundled deployment CLI using the project root                                                                                                                                      |
| Inputs                       | `sheldon.json`, production `Dockerfile`, application source, and server-side environment file                                                                                                                                                                             |
| Secrets                      | `~/.config/sheldon/secrets/digicolony-client-ops.env` on Sheldon, mode `0600`; required names come from `sheldon.json` and include database, authentication, and Garage S3 values; values must never enter the repo or deployment archive                                 |
| Systems touched              | Sheldon over SSH, rootless Docker context `rootless`, loopback-only application port, project network `172.30.0.0/16`, PostgreSQL's internal `172.18.0.0/16` network, Caddy, and public HTTPS through Cloudflare Tunnel                                                   |
| Outputs or state transitions | Versioned release, generated rootless Compose file, current-release symlink, Caddy application snippet, retained prior release for rollback                                                                                                                               |
| Failure mode                 | Stops on unavailable SSH, missing server environment names, invalid manifest or archive, occupied port or network collision, container build failure, failed `/api/health` probe, or invalid Caddy configuration; restores the prior release when health validation fails |
| Retry or recovery            | Correct the reported preflight or runtime issue and redeploy with authorization; use rollback with explicit authorization when a prior healthy release exists                                                                                                             |
| Automated verification       | `pnpm lint`; `pnpm test`; `pnpm build`; local container build when Docker is available; non-mutating Sheldon plan; post-deploy origin and public HTTPS health probes                                                                                                      |
| Human verification           | Review the live portal and repeat the password-protected file-delivery workflow after storage or authentication changes                                                                                                                                                   |
| Owner or reviewer            | DigiColony engineering                                                                                                                                                                                                                                                    |
| Unknowns / follow-up         | Release archive exclusions and collision-checked rootless subnet allocation are handled by the Sheldon plugin; off-server Garage backup cadence remains TBD                                                                                                               |

## Sheldon Garage storage

| Field                        | Details                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name                         | Shared Sheldon Garage object storage                                                                                                                                           |
| Purpose                      | Provide private S3-compatible storage for this project and future Sheldon applications without AWS                                                                             |
| Trigger type                 | Manual bootstrap and manual backup/restore drill                                                                                                                               |
| Schedule or invocation       | Run `scripts/provision-garage-on-sheldon-remote.sh` or `scripts/backup-and-verify-garage-on-sheldon-remote.sh` on Sheldon through an approved SSH session                      |
| Secrets                      | Garage configuration and application S3 credentials stay under `~/.config/sheldon/`, mode `0600`; scripts print identifiers and checksums only                                 |
| Systems touched              | Rootless Docker container `sheldon-garage`, private application network, named volumes `sheldon-garage-meta` and `sheldon-garage-data`, and `~/sheldon/shared/garage/backups/` |
| Outputs or state transitions | Version-pinned Garage service, per-application bucket/key, consistent archive, checksum, isolated temporary restore, and removal of temporary restore resources                |
| Failure mode                 | Stops on missing secrets/network/config, unhealthy Garage, failed bucket/key verification, failed archive extraction, or failed restored-node status                           |
| Retry or recovery            | Live-container restart is protected by a trap; correct the reported failure and rerun. Never remove the live Garage volumes during recovery                                    |
| Automated verification       | Garage status/stats, bucket/key checks, application health, provider-aware unit tests, and `tests/e2e/project-deliverable-live.spec.ts`                                        |
| Human verification           | Approve retention, off-server destination, and restore-drill cadence                                                                                                           |
| Owner or reviewer            | DigiColony engineering                                                                                                                                                         |
| Unknowns / follow-up         | Off-server target and schedule are TBD                                                                                                                                         |

## Hosted bootstrap installer

| Field                        | Details                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Name                         | `https://harness.digicolony.com/install`                                                                                                   |
| Purpose                      | Bootstrap harness install or update from a tiny hosted script                                                                              |
| Trigger type                 | Manual curl bootstrap                                                                                                                      |
| Schedule or invocation       | `curl -fsSL https://harness.digicolony.com/install \| bash`; pass options with `bash -s -- --target /path/to/project`                      |
| Inputs                       | Optional installer flags such as `--target`, `--dry-run`, `--force`, `--yes`, and `--ref`                                                  |
| Secrets                      | Uses the machine's configured GitHub SSH identity; no token is required by the bootstrap script                                            |
| Systems touched              | `harness.digicolony.com`; private GitHub repo `MATT-Agent/DigiColony-Harness`; local filesystem                                            |
| Outputs or state transitions | Clones the private harness repo to a temporary directory and runs `scripts/install-harness.sh`                                             |
| Failure mode                 | Stops when the bootstrap URL is unavailable, Git is missing, SSH access to GitHub fails, or the installer rejects local overwrite risk     |
| Retry or recovery            | Verify `git ls-remote git@github.com:MATT-Agent/DigiColony-Harness.git`, rerun with `--dry-run`, then rerun after resolving reported state |
| Automated verification       | Test the hosted script against temporary empty and existing repos before advertising it                                                    |
| Human verification           | Confirm `https://harness.digicolony.com/install` serves the reviewed `scripts/bootstrap-install.sh` content                                |
| Owner or reviewer            | Repo maintainer                                                                                                                            |
| Unknowns / follow-up         | Hosting deployment mechanism for `harness.digicolony.com` is TBD                                                                           |

## `scripts/install-harness.sh`

| Field                        | Details                                                                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                         | `scripts/install-harness.sh`                                                                                                                                                                                         |
| Purpose                      | Canonical install/update entrypoint for the harness                                                                                                                                                                  |
| Trigger type                 | Manual local install or hosted bootstrap                                                                                                                                                                             |
| Schedule or invocation       | `scripts/install-harness.sh [--target DIR] [--source DIR] [--dry-run] [--force] [--yes] [--init-git] [--name "Project Name"]`                                                                                        |
| Inputs                       | Target directory; source harness checkout; `.harness/core-files.txt`; optional project name and safety flags                                                                                                         |
| Secrets                      | None directly; the bootstrap path uses GitHub SSH before this script runs                                                                                                                                            |
| Systems touched              | Local filesystem; local Git metadata in the target when checking modified protected files; local Git repository when `--init-git` is used                                                                            |
| Outputs or state transitions | Installs or updates protected harness files, creates missing project-owned starter docs, creates execution-plan directories, updates `.harness/version.json`, and prints lifeOS-aware intake/registration next steps |
| Failure mode                 | Stops when source metadata is missing, target is inside the source checkout, older metadata requires confirmation, or protected files have local edits without `--force`                                             |
| Retry or recovery            | Run `--dry-run`, move local protected-file changes into `docs/PROJECT_OVERRIDES.md`, rerun with `--yes` for older installs or `--force` after review                                                                 |
| Automated verification       | Run `bash -n scripts/install-harness.sh`; install/update temporary empty, existing, and older-version repos                                                                                                          |
| Human verification           | Review the install/update diff before committing                                                                                                                                                                     |
| Owner or reviewer            | Repo maintainer                                                                                                                                                                                                      |
| Unknowns / follow-up         | Consider signed release archives only if SSH bootstrap becomes too slow or brittle                                                                                                                                   |

## `scripts/bootstrap-install.sh`

| Field                        | Details                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| Name                         | `scripts/bootstrap-install.sh`                                                                  |
| Purpose                      | Tiny script intended to be hosted at `https://harness.digicolony.com/install`                   |
| Trigger type                 | Manual curl bootstrap                                                                           |
| Schedule or invocation       | `curl -fsSL https://harness.digicolony.com/install \| bash`                                     |
| Inputs                       | Optional `--ref` plus installer arguments passed through to `scripts/install-harness.sh`        |
| Secrets                      | Uses existing GitHub SSH identity                                                               |
| Systems touched              | Private GitHub repo and local temporary directory                                               |
| Outputs or state transitions | Clones upstream harness and delegates to `scripts/install-harness.sh`                           |
| Failure mode                 | Stops when Git is missing, SSH auth fails, the requested ref is invalid, or the installer fails |
| Retry or recovery            | Verify SSH access and rerun; use `--ref` only for intentional testing                           |
| Automated verification       | Run `bash -n scripts/bootstrap-install.sh`; run against temp targets before hosting             |
| Human verification           | Confirm hosted script matches the reviewed repo version                                         |
| Owner or reviewer            | Repo maintainer                                                                                 |
| Unknowns / follow-up         | Add deployment notes once hosting is configured                                                 |

## `scripts/new-project.sh`

| Field                        | Details                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                         | `scripts/new-project.sh`                                                                                                                                                                           |
| Purpose                      | Convenience wrapper for creating a new project folder from the harness checkout                                                                                                                    |
| Trigger type                 | Manual local bootstrap                                                                                                                                                                             |
| Schedule or invocation       | `scripts/new-project.sh [--dry-run] [--init-git] [--force] [--name "Project Name"] <target-dir>`                                                                                                   |
| Inputs                       | Target directory; optional project name; optional Git initialization flag                                                                                                                          |
| Secrets                      | None                                                                                                                                                                                               |
| Systems touched              | Local filesystem; local Git repository in the target only when `--init-git` is used                                                                                                                |
| Outputs or state transitions | Delegates to `scripts/install-harness.sh`, creates or updates harness files in the target, optionally initializes Git on `main`, and prints lifeOS-aware intake and registration-review next steps |
| Failure mode                 | Stops when the source is not a Git checkout, the target is inside the source checkout, the target is a non-directory file, or the target directory is non-empty without `--force`                  |
| Retry or recovery            | Choose an empty target directory, inspect existing target contents before using `--force`, then rerun                                                                                              |
| Automated verification       | Run `bash -n scripts/new-project.sh`; run `scripts/new-project.sh --dry-run <tmp-dir>`; run a real copy to a temporary directory and inspect expected files                                        |
| Human verification           | Confirm the copied project should proceed through project intake and lifeOS project registration before routine development                                                                        |
| Owner or reviewer            | Repo maintainer                                                                                                                                                                                    |
| Unknowns / follow-up         | Add a Codex plugin or slash-command wrapper after the script interface is proven on the first real project                                                                                         |

## `scripts/check-current-state.sh`

| Field                        | Details                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name                         | `scripts/check-current-state.sh`                                                                                                                                         |
| Purpose                      | Quickly verify local branch/upstream/worktree state, with opt-in remote and PR checks                                                                                    |
| Trigger type                 | Manual local validation                                                                                                                                                  |
| Schedule or invocation       | `scripts/check-current-state.sh` from the repo root; use `--full` before push/PR work                                                                                    |
| Inputs                       | Optional flags: `--remote`, `--pr`, `--full`, `--untracked`                                                                                                              |
| Secrets                      | GitHub CLI authentication when PR state is checked                                                                                                                       |
| Systems touched              | Local Git repository by default; `origin` and GitHub API only when requested                                                                                             |
| Outputs or state transitions | Prints branch, upstream, ahead/behind from local refs, tracked working-tree state, and optional PR/untracked state                                                       |
| Failure mode                 | Exits non-zero when the repo has no remote, branch is behind its locally known upstream, detached HEAD is active, or current branch PR is merged/closed during PR checks |
| Retry or recovery            | Fetch/pull or create a fresh branch from latest target branch, then rerun                                                                                                |
| Automated verification       | Run the fast default before local work; run `--full` before pushing or updating a PR                                                                                     |
| Human verification           | Confirm intentional uncommitted changes belong to the current task                                                                                                       |
| Owner or reviewer            | Repo maintainer                                                                                                                                                          |
| Unknowns / follow-up         | Add CI or hook integration only after the project chooses enforcement style; consider project-specific timeout policy for very large repos                               |

## `scripts/check-doc-links.sh`

| Field                        | Details                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| Name                         | `scripts/check-doc-links.sh`                                          |
| Purpose                      | Check local Markdown links and reject absolute local filesystem links |
| Trigger type                 | Manual local validation                                               |
| Schedule or invocation       | `scripts/check-doc-links.sh` from the repo root                       |
| Inputs                       | Optional root path argument; defaults to current directory            |
| Secrets                      | None                                                                  |
| Systems touched              | Local filesystem only                                                 |
| Outputs or state transitions | Prints pass/fail messages; exits non-zero on broken links             |
| Failure mode                 | Reports broken or absolute local links                                |
| Retry or recovery            | Fix the reported links and rerun                                      |
| Automated verification       | Run directly before PRs that edit docs                                |
| Human verification           | Review whether intentionally external links should remain external    |
| Owner or reviewer            | Repo maintainer                                                       |
| Unknowns / follow-up         | Add CI integration when a provider is selected                        |

## `scripts/check-launch-audit-evidence.mjs`

| Field                        | Details                                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name                         | `scripts/check-launch-audit-evidence.mjs`                                                                                                                                                  |
| Purpose                      | Verify that the MVP launch-readiness screenshot evidence, screen/action inventory, completion audit, fresh-eyes notes, PR notes, and human validation checklist remain present and aligned |
| Trigger type                 | Manual local validation                                                                                                                                                                    |
| Schedule or invocation       | `pnpm audit:launch-evidence` from the repo root                                                                                                                                            |
| Inputs                       | `docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14/`; launch review docs under `docs/reviews/`                                                                           |
| Secrets                      | None                                                                                                                                                                                       |
| Systems touched              | Local filesystem only                                                                                                                                                                      |
| Outputs or state transitions | Prints pass/fail messages; exits non-zero on missing screenshots, stale inventory references, or missing launch-audit docs                                                                 |
| Failure mode                 | Reports missing or unexpected screenshot files, missing required docs, or missing required launch-audit evidence phrases                                                                   |
| Retry or recovery            | Refresh screenshots, update the screen/action inventory, or update launch review docs, then rerun                                                                                          |
| Automated verification       | Run before PR review and after any screenshot, route, or launch-review documentation change                                                                                                |
| Human verification           | Confirm screenshot content and launch decision quality using `docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md`                                                            |
| Owner or reviewer            | DigiColony engineering                                                                                                                                                                     |
| Unknowns / follow-up         | Update the expected screenshot list if the launch-review route inventory intentionally changes                                                                                             |

## `scripts/check-inbox.sh`

| Field                        | Details                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Name                         | `scripts/check-inbox.sh`                                                                             |
| Purpose                      | Verify that repo-tracked inbox files are indexed and indexed paths exist                             |
| Trigger type                 | Manual local validation                                                                              |
| Schedule or invocation       | `scripts/check-inbox.sh` from the repo root                                                          |
| Inputs                       | Optional inbox directory argument; defaults to `Inbox`                                               |
| Secrets                      | None                                                                                                 |
| Systems touched              | Local filesystem                                                                                     |
| Outputs or state transitions | Prints pass/fail messages; exits non-zero on unindexed files or missing paths                        |
| Failure mode                 | Reports files under `Inbox/` missing from `Inbox/README.md`, or index rows pointing at missing paths |
| Retry or recovery            | Update `Inbox/README.md`, move/remove stale files, and rerun                                         |
| Automated verification       | Run when `Inbox/`, `docs/INBOX.md`, or inbox templates change                                        |
| Human verification           | Confirm editing rules and sensitivity of newly added material                                        |
| Owner or reviewer            | Repo maintainer                                                                                      |
| Unknowns / follow-up         | Add CI integration when a provider is selected                                                       |

## `scripts/update-harness.sh`

| Field                        | Details                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Name                         | `scripts/update-harness.sh`                                                                                    |
| Purpose                      | Local convenience wrapper for updating an installed harness                                                    |
| Trigger type                 | Manual local maintenance                                                                                       |
| Schedule or invocation       | `scripts/update-harness.sh [--dry-run] [--force] [--yes] [--ref REF] [source-checkout]`                        |
| Inputs                       | Optional source checkout; otherwise clones `git@github.com:MATT-Agent/DigiColony-Harness.git`; installer flags |
| Secrets                      | Uses the machine's configured GitHub SSH identity when cloning upstream                                        |
| Systems touched              | Private GitHub repo when no source checkout is passed; local filesystem; local Git metadata                    |
| Outputs or state transitions | Delegates to `scripts/install-harness.sh` for protected-core sync and version marker update                    |
| Failure mode                 | Stops when Git or SSH access is unavailable, source metadata is missing, or installer safety checks fail       |
| Retry or recovery            | Use hosted curl command if the local wrapper is stale; otherwise resolve reported installer issue and rerun    |
| Automated verification       | Run current-state, doc-link, and inbox checks after sync                                                       |
| Human verification           | Review sync diff before PR                                                                                     |
| Owner or reviewer            | Repo maintainer                                                                                                |
| Unknowns / follow-up         | Hosting deployment for the bootstrap script is still TBD                                                       |

## `scripts/start-issue-session.sh`

| Field                        | Details                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Name                         | `scripts/start-issue-session.sh`                                                                                               |
| Purpose                      | Create a session branch and import GitHub issues into repo-tracked issue-session files                                         |
| Trigger type                 | Manual GitHub issue workflow                                                                                                   |
| Schedule or invocation       | `scripts/start-issue-session.sh [--base main] [--no-comments] <session-slug> <issue-number-or-url>...`                         |
| Inputs                       | Session slug and GitHub issue numbers or URLs                                                                                  |
| Secrets                      | GitHub CLI authentication for reading and commenting on issues                                                                 |
| Systems touched              | Local Git repository and GitHub issues via `gh`                                                                                |
| Outputs or state transitions | Creates `session/<slug>` branch, `docs/issue-sessions/active/<slug>/`, issue files, and GitHub import comments unless disabled |
| Failure mode                 | Stops on missing `gh`, stale branch state, failed issue lookup, or branch creation failure                                     |
| Retry or recovery            | Resolve auth/state issue and rerun with a new session slug or clean branch                                                     |
| Automated verification       | Review generated session files and run current-state/doc-link checks                                                           |
| Human verification           | Confirm triage disposition and questions posted back to issues                                                                 |
| Owner or reviewer            | Repo maintainer                                                                                                                |
| Unknowns / follow-up         | Add helpers for per-issue branch creation and session closeout if repeated use shows value                                     |

## Entry Template

| Field                        | Details   |
| ---------------------------- | --------- |
| Name                         | `TBD`     |
| Purpose                      | `TBD`     |
| Trigger type                 | `Unknown` |
| Schedule or invocation       | `Unknown` |
| Inputs                       | `TBD`     |
| Secrets                      | `TBD`     |
| Systems touched              | `TBD`     |
| Outputs or state transitions | `TBD`     |
| Failure mode                 | `TBD`     |
| Retry or recovery            | `TBD`     |
| Automated verification       | `TBD`     |
| Human verification           | `TBD`     |
| Owner or reviewer            | `TBD`     |
| Unknowns / follow-up         | `TBD`     |

## Required Coverage

Document these entrypoint types when they exist:

- Local development commands
- Build, lint, format, and test commands
- Database migrations and seed scripts
- Background workers and queues
- Scheduled jobs
- Webhooks and event consumers
- Deployment and rollback commands
- CI workflows and required checks
- Manual operational procedures

## Human Validation

When an operation cannot be fully tested by an agent, record:

- Who must perform the check
- Exact steps to run
- Expected evidence of success
- Where that evidence should be recorded
- Whether the work can merge before the check is complete
