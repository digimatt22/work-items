import { describe, expect, it } from "vitest";
import {
  authorizeDigiPortalRead,
  getDigiPortalWorkItem,
  listDigiPortalQueue,
  type DigiPortalReadRepository,
  type DigiPortalWorkItem,
} from "../src";

const now = new Date("2026-07-17T12:00:00.000Z");
const workA: DigiPortalWorkItem = {
  id: "work-a",
  dispatchId: "dispatch-a",
  projectId: "project-a",
  type: "FEATURE",
  title: "Phase 1",
  description: "Build the read-only pilot.",
  acceptanceCriteria: "The pilot reads only its bound project.",
  priority: 10,
  availableAt: now,
};
const workB = {
  ...workA,
  id: "work-b",
  dispatchId: "dispatch-b",
  projectId: "project-b",
};

function repository(): DigiPortalReadRepository {
  const bindings = {
    "binding-a": {
      id: "binding-a",
      projectId: "project-a",
      projectName: "Work Items",
      clientName: "DigiColony",
      environment: "PILOT" as const,
      status: "ACTIVE" as const,
      platformUrl: "https://portal.digicolony.net",
      repositoryRef: "digicolony/work-items",
      configFingerprint: "fingerprint-a",
      createdAt: now,
    },
  };
  const allWork = [workA, workB];
  return {
    async getAccessGrant(hash) {
      if (hash !== "token-a") return null;
      return {
        id: "grant-a",
        agentId: "agent-a",
        clientId: "client-a",
        bindingId: "binding-a",
        projectId: "project-a",
        scopes: [
          "bindings:read",
          "queue:read",
          "work_items:read",
          "search:read",
        ],
        resource: "https://portal.digicolony.net/mcp",
        expiresAt: new Date("2026-07-18T12:00:00.000Z"),
      };
    },
    async getBinding(id) {
      return bindings[id as keyof typeof bindings] ?? null;
    },
    async listReadyWork(id, limit) {
      return allWork
        .filter((item) => id === "binding-a" && item.projectId === "project-a")
        .slice(0, limit);
    },
    async getReadyWork(id, workItemId) {
      return (
        allWork.find(
          (item) =>
            id === "binding-a" &&
            item.projectId === "project-a" &&
            item.id === workItemId,
        ) ?? null
      );
    },
    async searchReadyWork(id, query, limit) {
      return allWork
        .filter(
          (item) =>
            id === "binding-a" &&
            item.projectId === "project-a" &&
            item.title.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, limit);
    },
  };
}

describe("Digi-Portal read isolation", () => {
  it("returns only work from the authenticated binding", async () => {
    const repo = repository();
    const context = await authorizeDigiPortalRead(
      repo,
      "token-a",
      { adminBindings: true, agentReads: true, agentMutations: false },
      "https://portal.digicolony.net/mcp",
      now,
    );

    await expect(listDigiPortalQueue(repo, context)).resolves.toEqual([workA]);
    await expect(
      getDigiPortalWorkItem(repo, context, "work-b"),
    ).resolves.toBeNull();
  });

  it("rejects a grant when the resource or read flag does not match", async () => {
    const repo = repository();
    await expect(
      authorizeDigiPortalRead(
        repo,
        "token-a",
        { adminBindings: true, agentReads: false, agentMutations: false },
        "https://portal.digicolony.net/mcp",
        now,
      ),
    ).rejects.toThrow("disabled");
    await expect(
      authorizeDigiPortalRead(
        repo,
        "token-a",
        { adminBindings: true, agentReads: true, agentMutations: false },
        "https://wrong.example/mcp",
        now,
      ),
    ).rejects.toThrow("resource");
  });
});
