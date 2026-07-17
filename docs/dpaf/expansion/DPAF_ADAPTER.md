# DPAF Project Adapter

Use this adapter in a target project that should use the DigiColony Product Architecture Framework without copying the whole framework into the project.

## DPAF Runtime
- Distribution: installed Codex plugin
- Plugin: `digi-cto`
- Plugin version used: `0.3.0`
- Adapter contract: `1`
- Invocation: `Work with me as the CTO partner for this project.`
- Local source override: `None`

Do not add an absolute DPAF repository path for normal project work. A local source override is allowed only for explicit plugin development or source testing; record both the override path and its manifest version when used.

## Project Context
- Project name: `Work Items Agent Delivery Platform Expansion`
- Primary outcome: `Customer bug and feature requests become safely claimable, project-bound work for AI agents operating in the correct ChatGPT Work project workspace.`
- Source artifacts to read first: `README.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/dpaf/`, `docs/adr/`, `packages/db/prisma/schema.prisma`, `packages/shared/src/`, and `packages/mcp/src/`
- Generated DPAF docs path: `docs/dpaf/expansion/`
- Implementation source path: repository root

## When To Use DPAF
Use DPAF when:
- starting a new project or major feature from a rough idea
- converting artifacts into implementation-ready specs
- creating a PRD and Codex build plan
- reviewing architecture, AI/MCP design, security, or Codex readiness

## Target Project Outputs
Put generated project artifacts in:

```text
docs/dpaf/expansion/
```

Copy or create:
- `00-project-charter.md`
- `01-product-vision.md`
- `02-design-principles.md`
- `03-discovery-notes.md`
- `04-domain-model.md`
- `05-information-architecture.md`
- `06-user-flows.md`
- `07-wireframes.md`
- `08-database-design.md`
- `09-api-specification.md`
- `10-mcp-specification.md`
- `11-ai-architecture.md`
- `12-frontend-architecture.md`
- `13-backend-architecture.md`
- `14-testing-strategy.md`
- `15-deployment.md`
- `16-roadmap.md`
- `17-open-questions.md`
- `18-codex-build-plan.md`
- `19-implementation-kickoff-prompts.md`
- `PRD.md`

## Boundaries
- Keep reusable DPAF methodology inside the versioned Digi-CTO plugin.
- Keep target-project implementation facts in this project.
- Do not copy private context from unrelated systems or projects into generated project docs.
- Record unknowns as `Unknown` or `TBD`; do not invent missing production contracts.

## Plugin Update Policy
- Continue using the recorded plugin version until an upgrade is intentionally reviewed.
- When upgrading, record the old and new versions in the project change history.
- Re-run the DPAF readiness review when a major plugin version changes or release notes identify a changed artifact contract.
- Never silently switch to a different source checkout because it happens to exist on the machine.

## Validation
Before implementation handoff:
- run project-specific validation commands
- review `PRD.md` against DPAF rubrics
- review `18-codex-build-plan.md` for Codex readiness
- review `19-implementation-kickoff-prompts.md` for executable phase prompts
- assign human-only validation with owner, steps, and expected evidence
