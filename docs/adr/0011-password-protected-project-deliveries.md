# ADR 0011: Password-Protected Project Deliveries

## Status

Accepted

## Context

DigiColony needs to deliver project files to client contacts who may not have a portal account. Existing assets can already be linked to projects and stored through the storage-provider abstraction, but authenticated asset access does not satisfy a no-login client handoff.

## Decision

- Treat a deliverable as an existing `Asset` linked directly to one `Project`; do not create a second file-storage domain.
- Allow only administrators to upload project deliverables and create or revoke public shares.
- Scope each `DeliverableShare` to exactly one project and one asset.
- Use a 192-bit random public token in the URL and a separately generated password. Store the token so an administrator can copy the link again, but persist only a bcrypt cost-12 hash of the password.
- Show the password once at creation. If it is lost, create a new share and revoke the old one.
- Require an expiry of 7, 14, or 30 days, with 14 days as the default.
- Lock a share for 15 minutes after five failed password attempts. Return generic failures for missing, expired, revoked, locked, and incorrect-password requests.
- Stream the file through the application after authorization; do not reveal filesystem paths or provider object keys.
- Record upload, share creation, revocation, and successful download as admin-only activity without logging tokens or passwords.

## Consequences

- Clients can receive one file per link without an account.
- A leaked URL is insufficient by itself, but the link and password still need to be sent through appropriately separated or trusted channels.
- Administrators can recover the link but not the password.
- Application streaming is acceptable for the bounded MVP file size but may later move to short-lived signed provider URLs after equivalent authorization and audit behavior is preserved.
- Local filesystem storage remains unsuitable for dependable external production delivery until persistent or S3-compatible storage is configured.
