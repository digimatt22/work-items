import { describe, expect, it } from "vitest";
import {
  createClientUserForLaunch,
  listVisibleProjectsForLaunch,
  type ClientOperationsRepository,
  type ClientUserRecord,
  type ProjectRecord
} from "../src";

function repository(projects: readonly ProjectRecord[] = []): ClientOperationsRepository {
  return {
    async createClientUser(input): Promise<ClientUserRecord> {
      return {
        id: "created-user",
        email: input.email,
        name: input.name,
        role: input.role,
        clientId: input.clientId,
        permissions: input.permissions
      };
    },
    async listProjects() {
      return projects;
    }
  };
}

describe("launch client operations services", () => {
  it("allows admins to create single-client client users", async () => {
    await expect(
      createClientUserForLaunch(
        repository(),
        { kind: "user", user: { id: "admin", role: "ADMIN" } },
        {
          email: " Client@Example.test ",
          name: "Demo Client",
          clientId: "client-1"
        }
      )
    ).resolves.toMatchObject({
      email: "client@example.test",
      role: "CLIENT_USER",
      clientId: "client-1",
      permissions: []
    });
  });

  it("assigns selected permissions when an admin creates a client user", async () => {
    await expect(
      createClientUserForLaunch(
        repository(),
        { kind: "user", user: { id: "admin", role: "ADMIN" } },
        {
          email: "client@example.test",
          clientId: "client-1",
          permissions: ["MOVE_WORK_ITEMS"]
        }
      )
    ).resolves.toMatchObject({
      permissions: ["MOVE_WORK_ITEMS"]
    });
  });

  it("blocks client users from creating other client users", async () => {
    await expect(
      createClientUserForLaunch(
        repository(),
        { kind: "user", user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" } },
        {
          email: "other@example.test",
          clientId: "c1"
        }
      )
    ).rejects.toThrow("Admin permission required.");
  });

  it("lists all active projects for the client user's single client", async () => {
    const visible = await listVisibleProjectsForLaunch(
      repository([
        { id: "p1", clientId: "c1", name: "Visible" },
        { id: "p2", clientId: "c2", name: "Hidden" },
        { id: "p3", clientId: "c1", name: "Archived", archivedAt: new Date() }
      ]),
      { kind: "user", user: { id: "client-user", role: "CLIENT_USER", clientId: "c1" } }
    );

    expect(visible).toEqual([{ id: "p1", clientId: "c1", name: "Visible" }]);
  });
});
