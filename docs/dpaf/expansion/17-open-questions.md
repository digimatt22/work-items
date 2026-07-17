# Open Questions

## Blocking Before Specification
No unresolved question prevents review of this specification.

| Question | Owner | Needed by | Impact if unanswered | Current assumption |
| --- | --- | --- | --- | --- |
| None for this planning deliverable. | Matthew | Plan approval | The architecture can be reviewed with documented assumptions. | Proceed to review. |

## Blocking Before Implementation

No unresolved platform-capability question blocks the Phase 1 development spike. Hosted Work mode and local repository sessions require distinct binding-verification paths, as recorded in `docs/reviews/digi-portal-phase-1-capability-check-2026-07-17.md`.

## Non-Blocking During Implementation
These may use the documented reversible assumption during implementation.

| Question | Owner | Needed by | Impact if unanswered | Current assumption |
| --- | --- | --- | --- | --- |
| Should customer-visible pipeline status change when an agent claims work? | Product owner | Phase 2 | Affects status projection and customer messaging. | No; dispatch state is internal and separate. |
| What is the default lease duration and retry cooldown? | Engineering | Phase 2 | Affects recovery speed and long-running tasks. | 30-minute lease with heartbeat; values configurable after pilot measurement. |
| Which evidence types are mandatory before ready-for-review? | Project owner | Phase 2 | Affects completion rules. | Summary, changed files/commit reference when available, and relevant validation results. |

## Blocking Before Production
Resolve these before production, client review, or external access.

| Question | Owner | Needed by | Impact if unanswered | Current assumption |
| --- | --- | --- | --- | --- |
| What secrets manager and rotation owner will production use? | Matthew / operations | Production | Production credentials cannot be safely issued. | Use the Sheldon/deployment secret mechanism for development only. |
| What are retention/export/deletion requirements for customer content and agent audit? | Matthew / legal | Production | Data lifecycle and compliance remain undefined. | Preserve audit; no hard delete until policy is approved. |
| What CI provider, backup policy, and incident owner are required? | Matthew / engineering | Production | Production readiness and rollback evidence are incomplete. | Production launch remains blocked. |
| Is durable S3-compatible attachment storage required before customer agent delivery? | Matthew | Production pilot | Current container-local files can be lost. | Yes for external/customer pilot; internal text-only pilot may proceed without it. |

## Resolved
- `v0.0.0` identifies the pre-expansion baseline at commit `c008778`.
- The first architecture is pull-based and does not depend on undocumented ChatGPT Work task-creation APIs.
- Repository config contains identifiers only; credentials are stored separately.
- The pilot permits exactly one active repository/workspace binding per Work Items project; historical bindings remain for audit.
- Only admins may qualify work as agent-ready.
- The plugin is named `Digi-Portal` (`digi-portal` manifest identity).
- The private marketplace destination is `/Users/mwood/Documents/Digicolony/digicolony-codex-marketplace`.
- ChatGPT web Work mode uses a remote MCP-backed plugin and server-side binding grant; it cannot depend on `.work-items/project.json` or local Codex config.
- Local Codex/desktop repository sessions may use `.work-items/project.json` as an additional binding assertion, while credentials remain host-managed.
