import { describe, expect, it } from "vitest";
import {
  archiveWorkspaceProject,
  createWorkspaceClient,
  createWorkspaceProject,
  listVisibleClientActivity,
  listVisibleWorkspaceProjects,
  type WorkspaceRepository
} from "../src";

function repository(): WorkspaceRepository {
  const projects = [
    { id: "p1", clientId: "c1", name: "Client One Project" },
    { id: "p2", clientId: "c2", name: "Client Two Project" }
  ];
  const activity = [
    {
      id: "a1",
      entityType: "PROJECT",
      entityId: "p1",
      action: "CREATED",
      visibility: "USER_VISIBLE" as const,
      createdAt: new Date("2026-01-01T00:00:00.000Z")
    },
    {
      id: "a2",
      entityType: "AI_ACTION",
      entityId: "ai1",
      action: "MCP_TOOL_CALLED",
      visibility: "ADMIN_ONLY" as const,
      createdAt: new Date("2026-01-02T00:00:00.000Z")
    }
  ];

  return {
    async listClients() {
      return [{ id: "c1", name: "Client One" }];
    },
    async getClient(clientId) {
      return { id: clientId, name: "Client" };
    },
    async createClient(input) {
      return { id: "created-client", ...input };
    },
    async archiveClient(clientId) {
      return { id: clientId, name: "Archived", archivedAt: new Date() };
    },
    async listProjects() {
      return projects;
    },
    async listProjectsForClient(clientId) {
      return projects.filter((project) => project.clientId === clientId);
    },
    async createProject(input) {
      return { id: "created-project", ...input };
    },
    async archiveProject(projectId) {
      return { id: projectId, clientId: "c1", name: "Archived", archivedAt: new Date() };
    },
    async listActivityForClient() {
      return activity;
    },
    async recordActivity() {
      return undefined;
    }
  };
}

describe("workspace services", () => {
  it("allows admins to create clients and projects", async () => {
    const principal = { kind: "user" as const, user: { id: "admin", role: "ADMIN" as const } };

    await expect(
      createWorkspaceClient(repository(), principal, { name: " New Client " })
    ).resolves.toMatchObject({ id: "created-client", name: "New Client" });

    await expect(
      createWorkspaceProject(repository(), principal, {
        clientId: "c1",
        name: " New Project "
      })
    ).resolves.toMatchObject({
      id: "created-project",
      clientId: "c1",
      name: "New Project"
    });
  });

  it("blocks client users from archiving projects", async () => {
    await expect(
      archiveWorkspaceProject(
        repository(),
        { kind: "user", user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" } },
        "p1"
      )
    ).rejects.toThrow("Admin permission required.");
  });

  it("filters projects by client for launch client users", async () => {
    await expect(
      listVisibleWorkspaceProjects(repository(), {
        kind: "user",
        user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" }
      })
    ).resolves.toEqual([{ id: "p1", clientId: "c1", name: "Client One Project" }]);
  });

  it("hides admin-only AI activity from client users", async () => {
    const visible = await listVisibleClientActivity(
      repository(),
      { kind: "user", user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" } },
      "c1"
    );

    expect(visible.map((event) => event.id)).toEqual(["a1"]);
  });
});
