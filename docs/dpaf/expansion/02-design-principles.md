# Design Principles

## Principles
1. One work item, one durable history.
2. Explicit identity beats inferred routing.
3. Agents pull eligible work; the platform does not push blindly into unknown workspaces.
4. Claim before mutate, lease before lock forever.
5. Least privilege by project, tool, and action.
6. Human approval at binding, scope, release, and destructive boundaries.
7. Customer clarity without exposing private agent mechanics.
8. Evidence is part of completion, not an afterthought.
9. Repository config identifies a project but never contains a credential.
10. The first integration is boring, observable, and reversible.

## Decision Criteria
Prefer the choice that improves routing correctness, auditability, recovery, and future agent interoperability. When convenience conflicts with trust, preserve the trust boundary. When automation conflicts with an undocumented external capability, use an explicit human- or agent-initiated pull.

## Tradeoffs
- A two-step triage/claim process adds friction but prevents low-quality requests from reaching coding agents.
- A server-side binding plus repo config duplicates identity, but enables mismatch detection.
- Lease-based claims are more complex than a status field, but recover from crashed agents.
- Plugin-first delivery is narrower than full orchestration, but can ship without relying on unavailable ChatGPT Work automation APIs.
