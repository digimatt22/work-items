# ADR 0002: Unified Work Item Model

## Status

Accepted

## Context

The platform starts with Bug and Feature work item types and expects future types such as Task, Research, Support, Question, and Enhancement. Comments, assets, labels, watchers, pipeline status, release target, AI summary, and activity should work consistently across all types.

## Decision

Use a unified `WorkItem` model with type-specific detail records for Bug and Feature fields.

Shared behavior remains on `WorkItem`. Type-specific records store fields such as bug reproduction details or feature acceptance criteria.

## Consequences

- Kanban, list views, search, comments, assets, MCP tools, and activity can operate on one work item surface.
- Future work item types can be added without duplicating lifecycle code.
- Type-specific forms and validation must ensure the correct detail record exists for each work item type.
