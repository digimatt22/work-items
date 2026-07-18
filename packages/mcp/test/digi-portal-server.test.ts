import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import type {
  DigiPortalReadContext,
  DigiPortalReadRepository,
  DigiPortalWorkItem,
} from "@digicolony/shared";
import { createDigiPortalMcpServer } from "../src/digi-portal-server";

const now = new Date("2026-07-17T12:00:00.000Z");
const item: DigiPortalWorkItem = {
  id: "phase-1",
  dispatchId: "dispatch-1",
  projectId: "work-items-project",
  type: "FEATURE",
  title: "Implement Digi-Portal Phase 1",
  description: "Build the internal pilot.",
  acceptanceCriteria: "Project isolation passes.",
  priority: 100,
  availableAt: now,
};
const binding = {
  id: "binding-1",
  projectId: "work-items-project",
  projectName: "Work Items",
  clientName: "DigiColony",
  environment: "PILOT" as const,
  status: "ACTIVE" as const,
  platformUrl: "https://portal.digicolony.net",
  repositoryRef: "digicolony/work-items",
  configFingerprint: "sha256:test",
  createdAt: now,
};
const context: DigiPortalReadContext = {
  id: "grant-1",
  agentId: "chatgpt-work:test",
  clientId: "oauth-client",
  bindingId: binding.id,
  projectId: binding.projectId,
  scopes: ["bindings:read", "queue:read", "work_items:read", "search:read"],
  resource: "https://portal.digicolony.net/mcp",
  expiresAt: new Date("2026-07-18T12:00:00.000Z"),
  binding,
};
const repository: DigiPortalReadRepository = {
  async getAccessGrant() { return context; },
  async getBinding() { return binding; },
  async listReadyWork(bindingId) { return bindingId === binding.id ? [item] : []; },
  async getReadyWork(bindingId, id) { return bindingId === binding.id && id === item.id ? item : null; },
  async searchReadyWork(bindingId, query) { return bindingId === binding.id && item.title.toLowerCase().includes(query.toLowerCase()) ? [item] : []; },
};

describe("Digi-Portal MCP server", () => {
  it("exposes read-only tools and verifies the pilot binding", async () => {
    const server = createDigiPortalMcpServer(repository, context);
    const client = new Client({ name: "pilot-test", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual(expect.arrayContaining(["work_items_binding_verify", "work_items_queue_next", "search", "fetch"]));
    expect(tools.tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);

    const verified = await client.callTool({ name: "work_items_binding_verify", arguments: { projectId: binding.projectId, bindingId: binding.id, repositoryRef: binding.repositoryRef } });
    expect(verified.structuredContent).toMatchObject({ verified: true });

    const next = await client.callTool({ name: "work_items_queue_next", arguments: {} });
    expect(next.structuredContent).toMatchObject({ item: { id: item.id, projectId: binding.projectId } });
    await Promise.all([client.close(), server.close()]);
  });
});
