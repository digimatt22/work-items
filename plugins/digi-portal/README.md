# Digi-Portal

Digi-Portal connects a Codex or ChatGPT Work workspace to the one DigiColony Work Portal project named in `.work-items/project.json`.

Phase 1 provides OAuth-protected, read-only MCP tools for binding verification, queue listing, item lookup, search, and fetch. An administrator must explicitly mark a work item agent-ready before the plugin can return it. Agent claims and all mutations remain disabled.

The hosted MCP endpoint is `https://portal.digicolony.net/mcp`. Local development can point a test client at `/mcp` on the local web application while keeping the same OAuth flow.
