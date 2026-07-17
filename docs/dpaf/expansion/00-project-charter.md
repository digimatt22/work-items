# Project Charter

## Purpose
Expand the existing client operations MVP into a trusted intake-to-agent delivery platform. Customers continue to submit bugs and feature requests in Work Items; authorized AI agents then discover, claim, execute, and report on that work from the correct ChatGPT Work project workspace.

## Owner And Stakeholders
- Owner: Matthew / DigiColony
- Reviewers: DigiColony engineering; a human project owner for workspace binding and production authority

## Desired Outcome
Create the reusable **Digi-Portal** plugin and server-side integration contract that binds each repository/workspace to exactly one Work Items project, supplies agents with implementation-ready work packages, prevents duplicate execution, and writes progress and evidence back to the same audited work item.

## Users
- Customer reporters
- DigiColony admins and triagers
- AI implementation agents running inside project workspaces
- Human project owners who approve bindings, scope, and delivery

## MVP Scope
- Project/workspace binding by immutable Work Items project ID.
- Read-only discovery and triage tools.
- Lease-based claim, heartbeat, release, and completion workflow.
- Context package containing request, attachments, comments, project metadata, acceptance criteria, and repository guidance.
- Audited agent progress, evidence, questions, and delivery result updates.
- A reusable project config file with no secrets.
- Human approval for the initial binding and sensitive mutations.

## Non-Goals
- Fully autonomous merge, deploy, or customer communication.
- A general-purpose issue tracker replacement.
- Automatic routing based only on AI inference.
- Storing credentials in repository config.
- Depending on an undocumented ChatGPT Work API.

## Success Criteria
- At least 95% of approved requests are routed to the correct project without manual re-entry.
- Two agents cannot actively own the same work item.
- Every agent mutation is attributable, scoped, and visible to admins.
- A fresh agent can start an approved item without re-interviewing the customer.
- Failed or abandoned claims return safely to the queue.
- The customer-facing status remains understandable without exposing internal AI activity.

## Open Questions
- See `17-open-questions.md`; binding UX, ChatGPT Work automation surfaces, credential issuance, and production retention remain human decisions.
