import { describe, expect, it } from "vitest";
import { canMovePipelineStatus, canViewAiActivity, canViewClientProject } from "../src";

describe("launch permission predicates", () => {
  it("allows client users to view projects for their client", () => {
    expect(
      canViewClientProject(
        { kind: "user", user: { id: "u1", role: "CLIENT_USER", clientId: "c1" } },
        "c1"
      )
    ).toBe(true);
  });

  it("blocks client users from admin-only AI activity", () => {
    expect(
      canViewAiActivity({
        kind: "user",
        user: { id: "u1", role: "CLIENT_USER", clientId: "c1" }
      })
    ).toBe(false);
  });

  it("allows scoped AI agents to change work item status for an authorized client", () => {
    expect(
      canMovePipelineStatus(
        {
          kind: "ai_agent",
          agent: { id: "agent-1", clientId: "c1", scopes: ["work_items:status:write"] }
        },
        "c1"
      )
    ).toBe(true);
  });

  it("allows a permitted client user to move work for their client only", () => {
    const principal = {
      kind: "user" as const,
      user: {
        id: "u1",
        role: "CLIENT_USER" as const,
        clientId: "c1",
        permissions: ["MOVE_WORK_ITEMS"] as const
      }
    };

    expect(canMovePipelineStatus(principal, "c1")).toBe(true);
    expect(canMovePipelineStatus(principal, "c2")).toBe(false);
  });

  it("keeps status movement disabled without the client-user grant", () => {
    expect(
      canMovePipelineStatus(
        {
          kind: "user",
          user: {
            id: "u1",
            role: "CLIENT_USER",
            clientId: "c1"
          }
        },
        "c1"
      )
    ).toBe(false);
  });
});
