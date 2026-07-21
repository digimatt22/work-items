# Enable Digi-Portal Administrator Bindings On Sheldon

## Status

- Status: completed
- Owner: Codex
- Branch: `codex/project-deliverable-sharing`
- PR: unavailable because no Git remote is configured
- Last updated: 2026-07-21

## Summary

Enable the administrator-only Digi-Portal binding form on Sheldon and set its canonical platform URL without enabling agent reads or mutations.

## Implementation

- Added all four Digi-Portal rollout variables to `sheldon.json` so future preflights fail if any setting is missing.
- Backed up the existing protected environment file before updating only its Digi-Portal lines.
- Set `DIGI_PORTAL_PLATFORM_URL=https://portal.digicolony.net` and `DIGI_PORTAL_ADMIN_BINDINGS_ENABLED=true`.
- Set `DIGI_PORTAL_AGENT_READS_ENABLED=false` and `DIGI_PORTAL_AGENT_MUTATIONS_ENABLED=false` explicitly.
- Deployed Sheldon release `20260721T205301Z`; port `39732` and subnet `172.30.0.0/16` were preserved.

## Validation

- Sheldon preflight passed with all required environment names present.
- The deployment image passed 53 tests and its production build.
- The running container reports the intended four Digi-Portal values.
- Public and origin health checks returned `{"status":"ok"}`.
- Auth.js sign-in and callback URLs remain canonical public HTTPS URLs.
- Application startup logs are clean.
- Protected database counts remain `2 users / 2 credentials / 2 clients / 5 projects / 1 work item`; there are no bindings or OAuth access grants.
- The form warnings are controlled directly by the now-active platform URL and administrator flag. A signed-in administrator should refresh the page to clear any stale render.

## Recovery Evidence

- Previous release: `20260721T201923Z`
- Environment backup: `/home/mwood/.config/sheldon/secrets/digicolony-client-ops.env.pre-digi-portal-flags-20260721T205226Z`
- Environment file and backup remain server-side and mode `0600`.

## Follow-up

- Creating or activating the first binding is a separate administrator action.
- Enabling agent reads or mutations remains a separate rollout decision.
