# ADR 0006: Storage Provider And Asset Constraints

## Status

Accepted

## Context

The PRD requires assets for images, PDFs, videos, documents, and logs. Storage starts locally and must remain S3-compatible later.

## Decision

Store asset metadata in PostgreSQL and physical objects behind a storage provider abstraction.

Use local filesystem storage for launch. Keep object keys and provider behavior compatible with future S3 storage.

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
- S3 migration remains a provider swap rather than a domain rewrite.
- Rich previews for PDFs, office documents, and video remain out of launch scope.
