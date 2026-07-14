# MVP Launch Remote And PR Runbook

Date: 2026-07-14

Status: ready to run after Matthew provides or creates the remote repository

This runbook turns the current local launch-readiness stack into a shared PR review.

## Current Local State

- Branch: `main`
- Worktree expectation before starting: clean
- Latest local commit at time of writing: `6e49314 Add MVP launch completion audit`
- Current blocker: no `origin` remote is configured

Verify:

```sh
git status --short --branch
git log --oneline --decorate -7
git remote -v
scripts/check-current-state.sh
```

Expected current-state gate before remote setup:

```text
No origin remote configured
```

## Remote Setup

1. Create or choose the private remote repository.
2. Add `origin`:
   ```sh
   git remote add origin <remote-url>
   ```
3. Verify the remote:
   ```sh
   git remote -v
   git ls-remote --heads origin
   ```
4. Push the current local `main` branch:
   ```sh
   git push -u origin main
   ```

If `main` already exists remotely, stop and compare histories before pushing:

```sh
git fetch origin
git log --oneline --decorate --graph --all --max-count=30
```

Do not force-push unless Matthew explicitly approves the repository bootstrap overwrite.

## Preferred PR Path

If branch protection or shared review requires a PR instead of direct `main` review:

1. Create a review branch from the current local state:
   ```sh
   git checkout -b codex/mvp-launch-readiness-review
   git push -u origin codex/mvp-launch-readiness-review
   ```
2. Open a PR into `main`.
3. Use `docs/reviews/mvp-launch-pr-review-notes-2026-07-14.md` as the PR body.
4. Attach or link the production screenshot directory:
   ```text
   docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14/
   ```
5. Assign Matthew as human validation owner.

## Required Validation Before PR

Run or confirm these checks after the remote is configured:

```sh
scripts/check-current-state.sh
scripts/check-doc-links.sh
pnpm lint
pnpm test
pnpm build
```

Optional but recommended before opening the PR:

```sh
pnpm db:review:reset
pnpm exec playwright test tests/e2e/client-reporting.spec.ts --project=chromium
pnpm exec playwright test tests/e2e/admin-workflow.spec.ts --project=chromium
```

## Human Validation Gate

Matthew should complete:

```text
docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md
```

The PR should not merge as launch-ready until the checklist records one of:

- Go
- No-Go
- Go with follow-up fixes

If the decision is `Go with follow-up fixes`, the checklist must name which risks are accepted for limited MVP launch.

## Rollback / Correction

If the wrong remote was added:

```sh
git remote remove origin
git remote add origin <correct-remote-url>
```

If the wrong branch was pushed but no one has based work on it:

```sh
git push origin --delete codex/mvp-launch-readiness-review
```

If a commit author/committer identity must be corrected before push, set the desired local identity and amend as needed:

```sh
git config user.name "<name>"
git config user.email "<email>"
git commit --amend --reset-author
```

Only rewrite already-pushed history after explicit approval.
