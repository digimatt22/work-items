# Discovery

## Problem Statement

DigiColony needs a durable client operations platform that keeps client work, project context, decisions, assets, comments, and AI actions in one reliable system. The platform should reduce context loss across long-running engagements and allow human users and AI agents to collaborate against the same source of truth.

## Product Intent

This is an operational memory system, not a Jira clone. Ticket-like workflows exist, but the differentiator is that every client, project, and work item carries enough human and machine-readable context for future collaboration.

## Primary Outcomes

- DigiColony admins can manage clients, projects, work, assets, activity, and pipelines.
- Client users can report bugs, request features, comment, upload assets, and follow progress.
- AI agents can safely read, create, comment, summarize, and update status through MCP when their system and client scopes authorize it.
- Every meaningful action is recorded in an immutable activity timeline.
- AI actions are transparent to admins and separated from ordinary user-visible activity where required.

## Primary Actors

- DigiColony Admin
- Client User
- AI Agent through MCP
- System actor for generated summaries, previews, notifications, and audit events

## Entity Context Strategy

Every client, project, and work item should support four context layers:

- Human description: plain-language explanation for users.
- Structured context: typed fields used by application workflows and filters.
- AI context: machine-oriented guidance and durable memory for agents.
- AI summary: generated synopsis that can be refreshed and audited.

This structure should be consistent across entity types so MCP tools and UI surfaces do not need one-off logic for each entity.

## Collaboration Model

The collaboration model is entity-centered:

- Comments attach to work items first.
- Assets attach to work items and projects, with room to attach to clients later if needed.
- Activity attaches to clients, projects, work items, comments, assets, and AI actions.
- Watchers subscribe users to relevant work item changes.
- Mentions create notification-ready references even before full notifications ship.

## Core Constraints

- Local development on macOS must be first-class.
- Architecture must remain AWS-compatible.
- Storage begins locally but must be abstracted for future S3.
- Work item types must be extensible.
- Pipelines begin with one default workflow but must support configurable statuses and colors.
- Permission rules must be enforced in server-side services, not only in UI.
- MCP write operations must use the same permission and audit policies as human UI actions.
- Client users belong to one client for launch and can see all projects for that client.
- All AI activity, audit traces, tool calls, and agent existence are admin-only.

## Non-Goals For Initial Build

- Full custom RBAC matrix.
- Fully custom per-project workflows.
- Analytics dashboards.
- Production AWS deployment automation.
- Rich real-time collaboration.
- External client SSO unless selected as an explicit ADR.

## Success Signals

- A user can understand the state of a client engagement from the client workspace.
- A project workspace shows the work, assets, comments, and context needed to continue execution.
- A work item contains the history and structured fields needed to act without asking for repeated context.
- Admins can distinguish human and AI actions.
- Client users see ordinary activity without seeing AI action details.
- MCP tools can safely operate on the same records that the UI uses.
