# Project Context

## Purpose
This repo is a generic starter harness for AI-assisted development. Replace this section with the specific purpose of the project after the harness is copied into a real codebase.

## Current State
- The harness contains documentation, workflow rules, templates, and execution-plan folders.
- No application runtime, package manager, test command, deployment target, or production environment is assumed by default.
- Repo-specific source files should be inventoried here once they exist.

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
- Private GitHub repository: `MATT-Agent/DigiColony-Harness`.
- Default branch: `main`.
- Branch protection and repository rulesets are currently unavailable for this private repo on the active GitHub account plan. GitHub API calls return a `403` requiring GitHub Pro or a public repository.
- Until protection is available, treat direct pushes to `main` as an explicit exception that must be documented in an execution plan.

## Runtime Assumptions
- `Unknown` until the target project defines its language, framework, package manager, and runtime.
- Record local setup commands, required versions, and environment variables here.
- Record anything that cannot be reproduced locally, including third-party systems, live data dependencies, and manual-only validation.

## Repository Inventory
| Area | Current role | Notes |
| --- | --- | --- |
| `AGENTS.md` | Compact agent entrypoint | Keep short and link to durable docs |
| `.harness/version.json` | Harness version marker | Update during harness sync |
| `.harness/core-files.txt` | Allowlist of files managed by harness sync | Keep project-owned docs out unless intentional |
| `.harness/version.template.json` | Template for downstream version marker | Core sync file |
| `docs/WORKFLOW.md` | Standard collaboration and delivery process | Update when team workflow changes |
| `docs/ARCHITECTURE.md` | System model and design record | Replace generic sections with project facts |
| `docs/AUTOMATIONS.md` | Jobs, automations, commands, and operational entrypoints | Keep aligned with scripts and CI |
| `docs/BOOTSTRAP_CHECKLIST.md` | Checklist for adapting the harness to a new project | Complete before routine project work |
| `docs/HARNESS_BOUNDARIES.md` | Protected-core versus project-owned file policy | Read before syncing harness changes |
| `docs/HARNESS_SYNC.md` | Workflow for updating downstream project harness copies | Use with `.harness/core-files.txt` |
| `docs/INBOX.md` | Rules for supplemental repo-tracked context | Use when users provide extra files or references |
| `docs/LIFEOS_INTEGRATION.md` | lifeOS MCP context, project registration, review queue, and status guidance | Read during orientation, project intake, closeout, and lifeOS review work |
| `docs/PROJECT_INTAKE_WORKFLOW.md` | Agent-led workflow for repo review, user intake, and repo-map creation | Run after copying harness into a real repo |
| `docs/PROJECT_OVERRIDES.md` | Project-specific deviations from protected harness core | Project-owned; do not overwrite during sync |
| `docs/REPO_MAP.md` | Concise map of important files, commands, risks, and validation paths | Keep updated as structure changes |
| `docs/ISSUES_AND_BACKLOG.md` | Conventions for work tracking across plans, issues, and backlog docs | Link external trackers from plans |
| `docs/REPOSITORY_HEALTH.md` | Readiness checklist for shared development | Use before importing into first project |
| `docs/TOOL_ADAPTERS.md` | Guidance for thin tool-specific instruction adapters | Add adapters only when tools are active |
| `docs/VALIDATION.md` | Validation levels, contracts, and human checks | Keep aligned with `docs/AUTOMATIONS.md` |
| `docs/REFERENCES.md` | External references and compatibility notes | Add source links and dates when relevant |
| `docs/exec-plans/active/` | In-progress work plans | One plan per non-trivial change |
| `docs/exec-plans/completed/` | Completed work plans | Move plans here when merged or closed |
| `docs/templates/` | Reusable spec, plan, and runbook templates | Update templates when repeated gaps appear |
| `scripts/install-harness.sh` | Canonical harness install/update entrypoint | Used by hosted bootstrap and local wrappers |
| `scripts/bootstrap-install.sh` | Tiny bootstrap script for `https://harness.digicolony.com/install` | Contains no protected harness content; clones private upstream over SSH |
| `scripts/check-doc-links.sh` | Local Markdown link checker | Run before documentation-heavy PRs |
| `scripts/check-inbox.sh` | Local inbox index checker | Run when `Inbox/` changes |
| `scripts/update-harness.sh` | Local harness update wrapper | Run from downstream project repos after install |

## Collaboration Assumptions
- A real project should use Git with a configured remote.
- Mainline work should be protected by pull requests.
- Agents should sync with the remote before starting work and before opening a PR.
- Work state should be recorded in execution plans, not only in chat.
- Validation evidence should be captured in the plan or PR notes.

## Repo Constraints
- No project-specific runtime has been selected.
- No project-specific automated test command is defined yet.
- No CI workflow is included yet.
- No deployment or release process is defined yet.
- Branch protection policy is defined in docs but cannot be enforced on the private remote with the current GitHub account plan.

## Known Unknowns
- Project language, framework, and package manager
- Build, lint, test, and formatting commands
- Production and staging environments
- Secrets and environment variable requirements
- CI provider and required checks
- Reviewers, code owners, and merge policy
- Release and rollback process
