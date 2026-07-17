# ADR 0008: Digi-Portal Project Binding

## Status

Accepted

## Context

Customer requests must be pulled into the correct project workspace without relying on AI inference or storing credentials in a repository. The pilot permits exactly one active repository/workspace binding per Work Items project.

## Decision

- Use immutable Work Items project ID plus revocable binding ID as the routing identity.
- Store server-side lifecycle in `ProjectBinding`.
- Enforce one active `CODEX_WORKSPACE` binding per Work Items project through the nullable unique `activeKey`, set to the project ID during activation; pending and historical revoked bindings may coexist.
- Put only schema version, `digi-portal` plugin identity, platform URL, project ID, binding ID, environment, and repository reference in `.work-items/project.json`.
- Store connector credentials outside the repository and require config, credential grant, and server binding to agree.
- Keep a binding pending and inert until Phase 1 verification and explicit human activation.

## Consequences

- Routing is deterministic and mismatch fails closed.
- Repository config is safe to commit but still reveals non-secret project identifiers.
- Phase 1 must implement verification, credential issuance/rotation, activation, and revocation.
- Multi-repository projects require a future ADR rather than weakening the pilot invariant.
