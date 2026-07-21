# ADR 0006: Storage Provider And Asset Constraints

## Status

Accepted

## Context

The PRD requires assets for images, PDFs, videos, documents, and logs. Local development needs a zero-service default, while Sheldon needs storage that survives application container replacement and can be reused by future projects without adding AWS.

## Decision

Store asset metadata in PostgreSQL and physical objects behind a storage provider abstraction.

Use local filesystem storage as the default for local development. Select storage at runtime with `STORAGE_PROVIDER` and use a self-hosted Garage S3-compatible service on Sheldon. Keep one private bucket and restricted access key per application security boundary.

The application streams authorized public downloads through the web process rather than exposing Garage endpoints or object keys. Existing `LOCAL` asset records remain readable through provider-aware lookup after the configured provider changes to S3.

MVP asset constraints:

- Maximum file size: 100 MB per file.
- Maximum upload batch: 10 files per request.
- Allowed image types: PNG, JPEG, GIF, WebP.
- Allowed document/data types: PDF, TXT, Markdown, CSV, DOCX, XLSX.
- Allowed video types: MP4, MOV, WebM.
- Allowed log/archive types: LOG, JSON, ZIP.
- Block executable files, scripts, HTML uploads, and unknown binary formats.
- Generate basic previews for images only in MVP.
- Store metadata for other allowed file types and defer rich preview generation.

## Consequences

- MVP upload behavior is bounded and testable.
- Sheldon uploads survive application deployment because Garage data and metadata live in dedicated named volumes.
- Future Sheldon projects can reuse the shared Garage service with separate buckets and keys.
- A single Sheldon node remains one hardware failure domain and requires independent backups plus restore drills.
- Rich previews for PDFs, office documents, and video remain out of launch scope.
