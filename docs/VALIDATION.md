# Validation Protocol

## Product Phase 0 Validation

Run these commands for the DigiColony Client Operations Phase 0 harness:

```sh
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm prisma:generate
pnpm db:start
pnpm prisma:migrate
pnpm db:seed
pnpm lint
pnpm test
pnpm test:e2e
pnpm dev
```

Expected results:

- Dependencies install and a `pnpm-lock.yaml` exists.
- Prisma client generation succeeds for `packages/db/prisma/schema.prisma`.
- `pnpm db:start`, `pnpm prisma:migrate`, and `pnpm db:seed` run when Docker or a local PostgreSQL database is available.
- TypeScript lint/typecheck passes across workspace packages.
- Vitest runs shared package tests.
- Playwright request-level smoke tests verify the local app routes boot.
- The Next.js app starts from `apps/web` and binds to `0.0.0.0` for browser and local-network review.

Phase 0 does not require a running PostgreSQL instance because no migrations or database reads are executed yet.

---

Every change should leave evidence that the right level of validation happened.

## Validation Levels

- Structural: files exist, links work, docs match repo reality.
- Static: format, lint, typecheck, schema validation.
- Unit: isolated behavior tests.
- Integration: multiple modules or external service boundaries.
- Smoke: basic end-to-end confidence in a running app or workflow.
- Human: checks that require judgment, credentials, live systems, or visual review.

## Choosing Checks

Use the lightest checks that give meaningful confidence for the risk:

- Documentation-only changes need structural checks.
- Documentation link changes should run `scripts/check-doc-links.sh`.
- Shared behavior needs automated tests when available.
- User-facing UI needs visual or browser verification.
- Production-facing operations need rollback and human validation plans.
- External API or live-data changes need explicit blast-radius notes.

## Validation Contract

Each project should define its required checks in `docs/AUTOMATIONS.md` or a dedicated validation section. Use `TBD` only with an owner and follow-up.

| Change type                      | Expected checks                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Documentation only               | Markdown link check and consistency review                                                                                                             |
| Inbox context changes            | Inbox check; Markdown link check when docs are touched                                                                                                 |
| GitHub issue-session changes     | Current-state check; generated issue-session docs reviewed; GitHub comments posted for status/questions                                                |
| Harness bootstrap helper changes | Shell syntax check; dry-run copy; real copy to a temporary directory; Markdown link check                                                              |
| Formatting-only code changes     | Format check plus targeted smoke check when behavior risk exists                                                                                       |
| Shared runtime behavior          | Lint, typecheck when available, unit tests, and focused integration tests                                                                              |
| User-facing UI                   | Automated checks plus browser or visual verification using `docs/reviews/visual-review-rules.md`                                                       |
| Public file delivery             | Schema/type/unit/build checks plus private-browser wrong-password, correct-download, expiry, revocation, filename, and downloaded-content verification |
| Launch-readiness review package  | `pnpm audit:launch-evidence`, Markdown link check, screenshot review, and Matthew human validation checklist                                           |
| Data migrations                  | Dry run or backup verification, migration test, rollback plan                                                                                          |
| Deployment changes               | CI checks, release runbook, rollback runbook, human validation owner                                                                                   |

## CI Guidance

When CI is available, prefer required checks for:

- Markdown link check
- Inbox check when inbox material exists
- Format
- Lint
- Typecheck
- Unit tests
- Integration tests
- Build

Do not invent provider-specific CI files until the project chooses a provider. Record the chosen provider and required checks in `docs/AUTOMATIONS.md`.

## Validation Log

Record in the execution plan or PR:

- Command or manual step
- Result
- Date
- Relevant output summary
- Anything not validated and why

## Human Validation Requirements

When a check cannot be completed by the agent, record:

- Owner
- Exact steps
- Expected result
- Evidence location
- Whether the check blocks merge
- Risk of deferring the check

## Human Validation Template

```md
## Human Validation

- Owner:
- Exact steps:
- Expected result:
- Evidence location:
- Blocks merge: yes/no
- Risk if deferred:
```

## Merge Guidance

Do not mark work `completed` while required validation is missing. Use `needs human validation` until the check is done, or document an explicit deferral with owner and risk.
