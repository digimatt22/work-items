# Deploy Digi-Portal Migrations To Sheldon

## Status

- Status: completed
- Owner: Codex
- Branch: `codex/project-deliverable-sharing`
- PR: unavailable because no Git remote is configured
- Last updated: 2026-07-21

## Summary

Apply the additive Digi-Portal database foundation and OAuth migrations to Sheldon so the administrator-only integration page can query its required tables. Existing users, credentials, clients, projects, and work items must remain unchanged.

## Implementation

- Confirmed `McpOAuthClient` existed in its expected pre-`0005` form and all `0004`/`0005` tables were absent.
- Created and validated a full custom-format PostgreSQL backup before migration.
- Copied repository-exact migration files to Sheldon and verified their SHA-256 hashes.
- Applied `0004_agent_delivery_foundation` and `0005_digi_portal_oauth` together with `ON_ERROR_STOP` in one transaction.
- Kept application release `20260721T201923Z`; no redeploy was required because it already contained the matching application code.

## Validation

- All nine new Digi-Portal tables exist.
- `McpOAuthClient.clientSecretHash` is nullable; `redirectUris` and `tokenEndpointAuthMethod` have the expected non-null defaults.
- The project-binding query that previously produced Prisma `P2021` and digest `2729481487` succeeds and returns zero bindings.
- Protected counts remained `2 users / 2 credentials / 2 clients / 5 projects / 1 work item`.
- Public and Sheldon-origin `/api/health` checks returned `{"status":"ok"}`.
- Recent application logs contained no post-migration errors.

## Recovery Evidence

- Backup: `/home/mwood/sheldon/apps/digicolony-client-ops/backups/pre-digi-portal-0004-0005-20260721T204511Z.dump`
- Mode: `0600`
- SHA-256: `fb9eab6fe8571aa240282ae2a7259f50b6ab4d2dd55a0cfde1274f2345895c03`

## Follow-up

- The live database still has no `_prisma_migrations` ledger. Formally baseline it before using `prisma migrate deploy` on Sheldon.
- Enabling Digi-Portal bindings or agent reads remains a separate feature-flag and operational decision.
