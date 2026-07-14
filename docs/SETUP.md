# Setup And Remote Sync

Use this checklist when installing the harness into a new project or adding it to an existing folder for shared work.

## Install The Harness
Install or update the harness in the current directory:

```sh
curl -fsSL https://harness.digicolony.com/install | bash
```

Install or update a specific directory:

```sh
curl -fsSL https://harness.digicolony.com/install | bash -s -- --target /path/to/project
```

The hosted bootstrap script uses the machine's configured GitHub SSH identity to clone the private upstream harness repo, then runs `scripts/install-harness.sh`. It contains no protected harness content.

To preview changes before writing:

```sh
curl -fsSL https://harness.digicolony.com/install | bash -s -- --dry-run --target /path/to/project
```

## New Project Setup
1. From a local harness checkout, create the project folder:
   ```sh
   scripts/new-project.sh --init-git /path/to/new-project
   ```
   To preview first, run:
   ```sh
   scripts/new-project.sh --dry-run /path/to/new-project
   ```
2. Confirm the project folder contains the harness files.
3. Initialize Git if needed:
   ```sh
   git init
   ```
4. Choose the default branch name:
   ```sh
   git branch -M main
   ```
5. Make the initial commit after project-specific placeholders are reviewed:
   ```sh
   git add .
   git commit -m "Initialize development harness"
   ```
6. Create a private remote repository unless the project is intentionally public.
7. Add the remote:
   ```sh
   git remote add origin <remote-url>
   ```
8. Push the default branch:
   ```sh
   git push -u origin main
   ```

`scripts/new-project.sh` and the hosted installer do not configure a remote. Add the remote only after the destination repository exists and the project owner confirms visibility.

## Existing Project Setup
1. Run the hosted installer from the existing project root:
   ```sh
   curl -fsSL https://harness.digicolony.com/install | bash
   ```
2. Review the diff. Protected harness files may be created or updated; existing project-owned files should be preserved.
3. Run project intake so the newly added docs describe the actual repo.
4. Commit the harness install on a branch and open a PR unless this is an explicit bootstrap exception.

## Updating An Installed Harness
Rerun the hosted installer, or use the local wrapper after the harness is installed:

```sh
scripts/update-harness.sh
```

If a project has an older or broken local update script, rerun the hosted curl command. For very old installs missing `.harness/core-files.txt`, preview first and rerun with `--yes` after review.

## Remote Readiness Check
Before shared work begins, verify:
- `git status --short` shows only intentional local changes.
- `git remote -v` shows the expected remote.
- `git fetch origin` succeeds.
- `git branch --show-current` shows the expected working branch.
- The remote default branch exists and is visible to collaborators.

## GitHub CLI Check
Use `gh` for GitHub tasks when available. On this machine, MacPorts installs it at `/opt/local/bin/gh`.

Check access with:
```sh
/opt/local/bin/gh auth status
/opt/local/bin/gh api user --jq '{login: .login, id: .id, name: .name, type: .type}'
```

Do not assume Homebrew paths on macOS 12 machines. Check `/opt/local/bin` first when MacPorts is used.

## Starting Shared Work
1. Fetch the latest remote state:
   ```sh
   git fetch origin
   ```
2. Update the local default branch:
   ```sh
   git checkout main
   git pull --ff-only origin main
   ```
3. Create a short-lived branch:
   ```sh
   git checkout -b codex/<short-description>
   ```
4. Create or update an execution plan for non-trivial work.
5. Push regularly:
   ```sh
   git push -u origin codex/<short-description>
   ```

## Branch Protection Expectations
Before production work begins, protect the default branch with:
- Pull request required before merge
- At least one reviewer
- Required status checks once CI exists
- Stale review dismissal or re-review when the branch changes, when appropriate
- Administrator bypass policy documented by the project owner

If GitHub branch protection or rulesets are unavailable for the repository plan, record the limitation in `docs/PROJECT_CONTEXT.md` and treat direct pushes to the default branch as documented exceptions until enforcement is available.

## Direct-To-Main Exception
Direct commits to `main` are allowed only for initial bootstrap or emergency recovery. Record the reason, validation performed, and follow-up review path in the active execution plan.
