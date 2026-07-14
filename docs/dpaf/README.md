# DPAF: AI-First Client Operations Platform

This directory contains the DPAF planning pack for the DigiColony AI-First Client Operations Platform.

For this project, DPAF is organized as:

- Discovery: canonical PRD ingestion, goals, constraints, actors, and operating principles.
- Product: requirements, user flows, acceptance criteria, and phased scope.
- Architecture: system boundaries, domain model, data ownership, MCP surface, security, audit, and deployment posture.
- Forward Plan: implementation sequence, accepted ADRs, testing strategy, risks, and resolved open questions.

The primary source artifact is:

`DigiColony-AI-First-Client-Operations-Platform-PRD-v1.md`

The PRD is treated as canonical. These documents refine it into implementation-ready planning without changing the product intent.

Launch-specific decisions are recorded in [PRD Launch Decisions Addendum](../prd/launch-decisions-addendum.md). Accepted architecture decisions are recorded in [ADRs](../adr/).

## Documents

- [00 PRD Ingestion Summary](./00-prd-ingestion-summary.md)
- [01 Discovery](./01-discovery.md)
- [02 Product Requirements](./02-product-requirements.md)
- [03 Architecture Plan](./03-architecture-plan.md)
- [04 Implementation Plan](./04-implementation-plan.md)
- [05 Risks Decisions And Open Questions](./05-risks-decisions-open-questions.md)

## Guiding Test

Every architecture and product decision should answer yes to:

> Does this improve long-term collaboration between humans and AI while preserving a single source of truth?
