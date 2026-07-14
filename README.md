# DigiColony AI-First Client Operations Platform

This workspace contains the Phase 0 development harness for the DigiColony AI-First Client Operations Platform.

The product is a client-facing operations platform that serves as the shared operational memory between DigiColony, client users, and authorized AI agents. The current milestone is **Phase 0 Harness Green**: a new developer can install dependencies, run the local app, generate Prisma client, run lint, and run tests.

## Product Source Of Truth

- DPAF pack: [docs/dpaf/](docs/dpaf/)
- PRD launch decisions: [docs/prd/launch-decisions-addendum.md](docs/prd/launch-decisions-addendum.md)
- Accepted ADRs: [docs/adr/](docs/adr/)
- Local development guide: [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md)

## Quick Start

```sh
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm lint
pnpm test
pnpm dev
```

The web app runs from `apps/web` through the root `pnpm dev` script.

## Workspace Layout

- `apps/web`: Next.js App Router application.
- `packages/db`: Prisma schema and database package.
- `packages/shared`: roles, permissions, activity, asset, storage, MCP, and work item contracts.
- `packages/ui`: shared UI package placeholder.
- `packages/mcp`: MCP tool contract and authorization helpers.
- `tests/e2e`: Playwright placeholder.
- `docs/`: DPAF, PRD addendum, ADRs, local development, and original harness docs.

## Phase 0 Commands

```sh
pnpm dev
pnpm lint
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
pnpm --filter @digicolony/db prisma:generate
```

## Phase 0 Scope Boundary

This milestone intentionally stops at scaffolding and contracts. Phase 1A begins real database and Auth.js implementation.

---

# Development Harness

This repository is a lightweight starter harness for AI-assisted software and automation projects. It provides a durable documentation structure, execution-plan workflow, and collaboration rules that can be copied into a new project and customized without carrying project-specific paths or assumptions.

## What Is Here
- `AGENTS.md`: short operating instructions for coding agents.
- `docs/PROJECT_CONTEXT.md`: current repo facts, constraints, and unknowns.
- `docs/ARCHITECTURE.md`: system boundaries, data flow, and design decisions.
- `docs/AUTOMATIONS.md`: operational jobs, commands, automations, and entrypoints.
- `docs/WORKFLOW.md`: standard change process from orientation through PR review.
- `docs/CURRENT_STATE_GATE.md`: required remote, branch, and PR-state check before starting or resuming work.
- `docs/GITHUB_ISSUE_WORKFLOW.md`: workflow for importing GitHub issues into triageable issue sessions.
- `docs/HARNESS_BOUNDARIES.md`: protected-core versus project-owned file policy.
- `docs/SETUP.md`: Git initialization, remote, branch, and sync checklist.
- `docs/PULL_REQUESTS.md`: branch naming, PR expectations, review, and merge policy.
- `docs/WORK_STATE.md`: execution-plan statuses and durable work-state protocol.
- `docs/VALIDATION.md`: automated and human validation protocol.
- `docs/BOOTSTRAP_CHECKLIST.md`: checklist for adapting the harness to a real project.
- `docs/LIFEOS_INTEGRATION.md`: lifeOS MCP context, project registration, review queue, and status guidance.
- `docs/PROJECT_INTAKE_WORKFLOW.md`: agent-led workflow for repo review, user intake, and repo-map creation.
- `docs/REPO_MAP.md`: concise map of important files, commands, risks, and validation paths.
- `docs/INBOX.md`: rules for repo-tracked supplemental context that is not active source by default.
- `docs/HARNESS_SYNC.md`: workflow for updating project copies from the upstream harness.
- `docs/ISSUES_AND_BACKLOG.md`: conventions for execution plans, issues, and backlog items.
- `docs/REPOSITORY_HEALTH.md`: readiness checklist for shared development.
- `docs/TOOL_ADAPTERS.md`: guidance for thin tool-specific instruction adapters.
- `docs/REFERENCES.md`: external references, links, and compatibility notes.
- `scripts/check-doc-links.sh`: local Markdown link check.
- `scripts/check-current-state.sh`: fast local current-state check, with `--full` for remote and PR freshness.
- `scripts/check-inbox.sh`: local inbox index consistency check.
- `scripts/bootstrap-install.sh`: tiny hosted bootstrap script for `https://harness.digicolony.com/install`.
- `scripts/install-harness.sh`: canonical install/update entrypoint for new and existing projects.
- `scripts/new-project.sh`: create a new project folder from this harness.
- `scripts/start-issue-session.sh`: create a session branch and import GitHub issues for triage/work.
- `scripts/update-harness.sh`: local convenience wrapper for updating from the upstream harness.
- `.harness/version.json`: local marker for upstream harness version and source commit.
- `.harness/core-files.txt`: allowlist of files managed by harness sync.
- `docs/exec-plans/`: active and completed execution plans.
- `docs/templates/`: reusable templates for specs, plans, and runbooks.

## Start Here
- Agent entrypoint: [AGENTS.md](AGENTS.md)
- Repo context: [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)
- System behavior: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Operational inventory: [docs/AUTOMATIONS.md](docs/AUTOMATIONS.md)
- Working method: [docs/WORKFLOW.md](docs/WORKFLOW.md)
- Current-state gate: [docs/CURRENT_STATE_GATE.md](docs/CURRENT_STATE_GATE.md)
- GitHub issue workflow: [docs/GITHUB_ISSUE_WORKFLOW.md](docs/GITHUB_ISSUE_WORKFLOW.md)
- Harness boundaries: [docs/HARNESS_BOUNDARIES.md](docs/HARNESS_BOUNDARIES.md)
- Setup and sync: [docs/SETUP.md](docs/SETUP.md)
- Pull requests: [docs/PULL_REQUESTS.md](docs/PULL_REQUESTS.md)
- Work state: [docs/WORK_STATE.md](docs/WORK_STATE.md)
- Validation: [docs/VALIDATION.md](docs/VALIDATION.md)
- Bootstrap checklist: [docs/BOOTSTRAP_CHECKLIST.md](docs/BOOTSTRAP_CHECKLIST.md)
- lifeOS integration: [docs/LIFEOS_INTEGRATION.md](docs/LIFEOS_INTEGRATION.md)
- Project intake workflow: [docs/PROJECT_INTAKE_WORKFLOW.md](docs/PROJECT_INTAKE_WORKFLOW.md)
- Repo map: [docs/REPO_MAP.md](docs/REPO_MAP.md)
- Inbox: [docs/INBOX.md](docs/INBOX.md)
- Harness sync: [docs/HARNESS_SYNC.md](docs/HARNESS_SYNC.md)
- Issue and backlog conventions: [docs/ISSUES_AND_BACKLOG.md](docs/ISSUES_AND_BACKLOG.md)
- Repository health: [docs/REPOSITORY_HEALTH.md](docs/REPOSITORY_HEALTH.md)
- Tool adapters: [docs/TOOL_ADAPTERS.md](docs/TOOL_ADAPTERS.md)
- Harness backlog: [docs/HARNESS_IMPROVEMENT_BACKLOG.md](docs/HARNESS_IMPROVEMENT_BACKLOG.md)

## Intended Use
1. Install or update the harness in the current project:
   ```sh
   curl -fsSL https://harness.digicolony.com/install | bash
   ```
   To target a specific folder, run:
   ```sh
   curl -fsSL https://harness.digicolony.com/install | bash -s -- --target /path/to/project
   ```
2. For local development from this checkout, create a new project with:
   ```sh
   scripts/new-project.sh --init-git /path/to/new-project
   ```
3. Replace placeholder facts in `docs/` with project-specific reality.
4. If lifeOS MCP is available, load `project_harness` context, check whether lifeOS knows the project, and propose registration if it is missing.
5. Initialize Git, add a remote, and protect the main branch before production work begins.
6. Use execution plans for non-trivial changes.
7. Keep docs, validation notes, and PRs aligned with every behavior change.
8. Keep project-specific deviations in `docs/PROJECT_OVERRIDES.md`, not protected harness core files.

## Install And Update
The hosted installer at `https://harness.digicolony.com/install` contains no protected harness content. It clones the private upstream repo with the machine's configured GitHub SSH identity, then runs `scripts/install-harness.sh` from that checkout.

The installer is safe to rerun. It updates protected harness files listed in `.harness/core-files.txt`, preserves project-owned files, creates missing starter docs when needed, and updates `.harness/version.json` with the upstream version and commit.

After the harness is installed, this local wrapper is equivalent for routine updates:

```sh
scripts/update-harness.sh
```

Use the hosted curl command as the recovery path when a project has an old or broken local update script.

## Kick Off Project Intake
After creating or copying the harness into a real repo, ask an agent to run intake:

```text
Run the project intake workflow. Review this repo, interview me for missing context, build or update the repo map, and fill in the harness docs with facts, unknowns, validation commands, and follow-up work.
```

The agent should combine repo inspection with a focused user interview, check lifeOS project registration when available, record returned review keys such as `CTX-*` when proposals are submitted, then update [docs/REPO_MAP.md](docs/REPO_MAP.md), [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/AUTOMATIONS.md](docs/AUTOMATIONS.md), and [docs/VALIDATION.md](docs/VALIDATION.md). Use [docs/PROJECT_INTAKE_WORKFLOW.md](docs/PROJECT_INTAKE_WORKFLOW.md) for the full workflow.

## Kick Off Issue Work
To pull GitHub issues into an agent work session, ask:

```text
Start an issue session for these GitHub issues: <issue numbers or URLs>. Triage each issue, comment back on GitHub with status/questions, create issue branches for confirmed work, roll completed issue branches into one session branch, and prepare a final session PR for testing.
```

Use [docs/GITHUB_ISSUE_WORKFLOW.md](docs/GITHUB_ISSUE_WORKFLOW.md) for the full process.

## Collaboration Defaults
- Work on short-lived branches.
- Run the current-state gate before starting or resuming work.
- Use the fast current-state gate for local iteration and `scripts/check-current-state.sh --full` before pushing or opening a PR.
- Pull from the remote before shared work and before opening a PR.
- Push work to the remote regularly so state is not trapped locally.
- Open a pull request for review before merging.
- Record manual validation steps when automated tests are not enough or not available.

## Local Validation
Run the documentation link check before opening documentation-heavy PRs:

```sh
scripts/check-current-state.sh
scripts/check-doc-links.sh
scripts/check-inbox.sh
```

Preview a new project copy without writing files:

```sh
scripts/new-project.sh --dry-run /path/to/new-project
```

Preview an in-place harness install or update:

```sh
scripts/install-harness.sh --dry-run --target /path/to/project
```

Before pushing or opening a PR, run:

```sh
scripts/check-current-state.sh --full
```

## Current Caveat
This harness starts generic. A project is not ready for routine development until the project intake workflow has filled in repo-specific context, architecture, operational inventory, validation commands, repo map, remote, and review rules.
