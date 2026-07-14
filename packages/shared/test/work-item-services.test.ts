import { describe, expect, it } from "vitest";
import {
  changeWorkItemStatusForLaunch,
  createWorkItemForLaunch,
  listVisibleWorkItems,
  type WorkItemRecord,
  type WorkItemRepository
} from "../src";

function repository(): WorkItemRepository {
  const statuses = [
    { id: "reported", key: "REPORTED", label: "Reported", color: "#64748b", sortOrder: 10, isDefault: true },
    { id: "done", key: "DONE", label: "Done", color: "#15803d", sortOrder: 40, isDefault: false }
  ];
  const items: WorkItemRecord[] = [
    {
      id: "w1",
      projectId: "p1",
      clientId: "c1",
      type: "BUG",
      title: "Visible bug",
      description: "Bug",
      creatorId: "client-user",
      reporterId: "client-user",
      pipelineStatusId: "reported",
      pipelineStatusLabel: "Reported",
      createdAt: new Date()
    },
    {
      id: "w-admin",
      projectId: "p1",
      clientId: "c1",
      type: "FEATURE",
      title: "Internal admin feature",
      description: "Admin-only planning item",
      creatorId: "admin",
      reporterId: "admin",
      pipelineStatusId: "reported",
      pipelineStatusLabel: "Reported",
      createdAt: new Date()
    },
    {
      id: "w2",
      projectId: "p2",
      clientId: "c2",
      type: "FEATURE",
      title: "Hidden feature",
      description: "Feature",
      creatorId: "u2",
      reporterId: "u2",
      pipelineStatusId: "reported",
      pipelineStatusLabel: "Reported",
      createdAt: new Date()
    }
  ];

  return {
    async getProject(projectId) {
      return { id: projectId, clientId: projectId === "p1" ? "c1" : "c2", name: "Project" };
    },
    async listProjects() {
      return [{ id: "p1", clientId: "c1", name: "Project" }];
    },
    async listPipelineStatuses() {
      return statuses;
    },
    async getDefaultPipelineStatus() {
      return statuses[0] ?? null;
    },
    async listWorkItems() {
      return items;
    },
    async createWorkItem(input) {
      return {
        id: "created",
        clientId: "c1",
        pipelineStatusLabel: "Reported",
        createdAt: new Date(),
        ...input
      };
    },
    async changeStatus(input) {
      const existing = items[0];

      if (!existing) {
        throw new Error("Missing fixture work item.");
      }

      return {
        ...existing,
        ...input,
        pipelineStatusLabel: "Done"
      };
    },
    async recordActivity() {
      return undefined;
    }
  };
}

describe("work item services", () => {
  it("filters work items by launch client access", async () => {
    const visible = await listVisibleWorkItems(repository(), {
      kind: "user",
      user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" }
    });

    expect(visible.map((item) => item.id)).toEqual(["w1"]);
  });

  it("creates bug work items for client users in their client", async () => {
    await expect(
      createWorkItemForLaunch(
        repository(),
        { kind: "user", user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" } },
        {
          projectId: "p1",
          type: "BUG",
          title: " Login fails ",
          description: "Cannot sign in",
          reporterId: "client-user",
          bugDetails: {
            stepsToReproduce: "Try to sign in",
            expectedBehavior: "Dashboard opens",
            actualBehavior: "Error appears"
          }
        }
      )
    ).resolves.toMatchObject({
      id: "created",
      type: "BUG",
      title: "Login fails",
      pipelineStatusId: "reported"
    });
  });

  it("requires feature details for feature work items", async () => {
    await expect(
      createWorkItemForLaunch(
        repository(),
        { kind: "user", user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" } },
        {
          projectId: "p1",
          type: "FEATURE",
          title: "Export",
          description: "Need export",
          reporterId: "client-user"
        }
      )
    ).rejects.toThrow("Feature details are required");
  });

  it("allows admins to move status", async () => {
    await expect(
      changeWorkItemStatusForLaunch(
        repository(),
        { kind: "user", user: { id: "admin", role: "ADMIN" } },
        { workItemId: "w1", pipelineStatusId: "done" }
      )
    ).resolves.toMatchObject({
      id: "w1",
      pipelineStatusId: "done"
    });
  });
});
