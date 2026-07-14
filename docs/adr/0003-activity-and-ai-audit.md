# ADR 0003: Activity And AI Audit

## Status

Accepted

## Context

The PRD requires immutable activity history and admin-visible AI actions. Client users should see ordinary project activity but should not see agent work, agent use, agent thoughts, tool calls, audit traces, or agent existence.

## Decision

Use append-only `ActivityEvent` records for meaningful domain changes. Link AI-originated events to `AiAction` records that capture tool metadata, authorization scope, decision/result summary, and affected entity details.

All AI action records and AI-specific activity metadata are admin-only.

## Consequences

- The product keeps one activity model while preserving AI confidentiality.
- Admins can audit AI behavior.
- Permission filters must be applied consistently when reading activity.
- Every write service must create activity records as part of the mutation.
