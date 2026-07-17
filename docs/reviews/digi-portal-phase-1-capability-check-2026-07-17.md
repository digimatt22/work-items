# Digi-Portal Phase 1 Capability Check

## Decision

Phase 1 is feasible as a reusable Digi-Portal plugin backed by a remote MCP service, but the binding handshake must differ by host:

- Local Codex and ChatGPT desktop project work may verify `.work-items/project.json` because the agent can operate in the trusted repository workspace.
- Hosted ChatGPT Work cannot depend on that local file or `.codex/config.toml`. Its remote MCP authorization must derive the Work Items project from a server-side OAuth grant/binding, with an explicit binding verification or selection step when needed.

The config file remains valuable as a local routing assertion. It is not the authorization source and is not a universal ChatGPT web transport.

## Verified Platform Facts

Checked against the current OpenAI Codex manual on 2026-07-17:

- Plugins can bundle skills and MCP-backed apps and are available in Work mode on ChatGPT web and in Work mode/Codex in the desktop app. Source: [Build plugins](https://learn.chatgpt.com/docs/build-plugins) and [Plugins](https://learn.chatgpt.com/docs/plugins).
- ChatGPT web Work mode can use remote MCP tools supplied by installed plugins. It does not read local Codex configuration files or expose the local command menu. Source: [Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp).
- Local Codex clients support project-scoped `.codex/config.toml` in trusted repositories, but project config cannot redirect provider credentials or authentication. Source: [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic).
- Remote Streamable HTTP MCP servers can use OAuth, with credentials retained by the host rather than the repository. Source: [Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp).
- The desktop app supports repository marketplaces at `$REPO_ROOT/.agents/plugins/marketplace.json`. The DigiColony private marketplace already follows that layout and can accept a second `digi-portal` entry after local plugin validation. Source: [Build plugins](https://learn.chatgpt.com/docs/build-plugins).

## Revised Phase 1 Architecture

1. Scaffold `plugins/digi-portal/` with the official plugin-creator workflow.
2. Build a remote MCP app/server with OAuth and read-only tools.
3. Bind each OAuth grant to one active `ProjectBinding`; derive `bindingId`, `projectId`, tenant/client scope, and allowed tools server-side on every request.
4. Add `binding.get` and `binding.verify` before queue tools.
5. For local repository sessions, parse `.work-items/project.json` and require its project/binding identifiers to match the authenticated grant.
6. For hosted Work mode, use a server-mediated connect/verify flow or an explicit authorized binding selection. Never require access to a local repository file.
7. Implement `queue.list`, `queue.next`, and `work_items.get` only after binding verification succeeds.
8. Validate local desktop and hosted Work mode as separate acceptance paths.
9. Add the validated plugin to `/Users/mwood/Documents/Digicolony/digicolony-codex-marketplace/.agents/plugins/marketplace.json`.

## Phase 1 Go/No-Go Gates

Proceed with the plugin and read-only MCP build when:

- An internal DigiColony Work Items project is selected for the spike.
- A development OAuth redirect/origin is available for the remote MCP app.
- Matthew can complete the developer-mode app connection in the target ChatGPT workspace.
- The server can issue a grant bound to exactly one active project binding.

Do not enable agent reads until:

- Cross-project denial tests pass at repository, service, and MCP layers.
- Revoked, inactive, mismatched, and absent bindings fail closed.
- Local config mismatch and hosted binding-selection failure return actionable diagnostics without leaking other project identifiers.
- Clean plugin install succeeds in both the desktop/local path and hosted Work mode path selected for the pilot.

## Next Recommended Slice

Run Task 1.1 and a narrow Task 1.2 spike together: scaffold Digi-Portal, register the development MCP-backed app, implement OAuth plus `binding.get`/`binding.verify`, and prove one successful binding and one cross-project denial before building the queue tools.
