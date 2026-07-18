import { describe, expect, it } from "vitest";
import {
  assertAgentDispatchTransition,
  assertProjectBindingTransition,
  buildDigiPortalProjectConfig,
  claimAgentDispatch,
  createPendingProjectBinding,
  markWorkItemAgentReady,
  parseDigiPortalProjectConfig,
  type AgentDeliveryFoundationRepository,
  type DigiPortalFeatureFlags,
} from "../src";

const enabledFlags: DigiPortalFeatureFlags = {
  adminBindings: true,
  agentReads: false,
  agentMutations: true,
};

function repository(): AgentDeliveryFoundationRepository {
  return {
    async listProjects() {
      return [
        {
          id: "project-1",
          clientId: "client-1",
          clientName: "Client One",
          name: "Portal",
        },
      ];
    },
    async listBindings() {
      return [];
    },
    async getDispatch(dispatchId) {
      return {
        id: dispatchId,
        workItemId: "work-1",
        clientId: "client-1",
        projectId: "project-1",
        bindingId: "binding-1",
        state: "QUEUED",
        version: 1,
      };
    },
    async createPendingBindingWithAudit(input) {
      return {
        id: input.id,
        projectId: input.projectId,
        projectName: "Portal",
        clientName: "Client One",
        environment: input.environment,
        status: "PENDING",
        platformUrl: input.platformUrl,
        repositoryRef: input.repositoryRef,
        workspaceRef: input.workspaceRef,
        configFingerprint: input.configFingerprint,
        createdAt: new Date("2026-07-17T00:00:00.000Z"),
      };
    },
    async activateBindingWithAudit(input) {
      return {
        id: input.bindingId,
        projectId: "project-1",
        projectName: "Portal",
        clientName: "Client One",
        environment: "PILOT",
        status: "ACTIVE",
        platformUrl: "https://portal.digicolony.net",
        repositoryRef: "digicolony/portal",
        configFingerprint: input.configFingerprint,
        createdAt: new Date("2026-07-17T00:00:00.000Z"),
        verifiedAt: new Date("2026-07-17T00:01:00.000Z"),
        activatedAt: new Date("2026-07-17T00:01:00.000Z"),
      };
    },
    async markWorkItemReadyWithAudit(input) {
      return {
        id: "qualification-1",
        workItemId: input.workItemId,
        version: 1,
        acceptanceCriteria: input.acceptanceCriteria,
        implementationNotes: input.implementationNotes,
        sensitivity: input.sensitivity,
        createdAt: new Date("2026-07-17T00:00:00.000Z"),
      };
    },
    async claimDispatchWithAudit(input) {
      return {
        id: "claim-1",
        dispatchId: input.dispatchId,
        agentId: input.agentId,
        expiresAt: input.expiresAt,
        attemptId: "attempt-1",
        attemptSequence: 1,
      };
    },
  };
}

describe("Digi-Portal project binding contract", () => {
  it("builds a non-secret versioned project config", () => {
    expect(
      buildDigiPortalProjectConfig({
        platformUrl: "https://portal.digicolony.net/",
        projectId: "project-1",
        bindingId: "binding-1",
        environment: "PILOT",
        repositoryRef: "digicolony/portal",
      }),
    ).toEqual({
      schemaVersion: 1,
      plugin: "digi-portal",
      platformUrl: "https://portal.digicolony.net",
      projectId: "project-1",
      bindingId: "binding-1",
      environment: "PILOT",
      repositoryRef: "digicolony/portal",
    });
  });

  it("rejects credentials and other unsupported config fields", () => {
    expect(() =>
      parseDigiPortalProjectConfig({
        schemaVersion: 1,
        plugin: "digi-portal",
        platformUrl: "https://portal.digicolony.net",
        projectId: "project-1",
        bindingId: "binding-1",
        environment: "PILOT",
        repositoryRef: "digicolony/portal",
        bearerToken: "must-not-be-here",
      }),
    ).toThrow("unsupported field: bearerToken");
  });

  it("allows localhost only for non-HTTPS development", () => {
    expect(
      buildDigiPortalProjectConfig({
        platformUrl: "http://localhost:3000",
        projectId: "project-1",
        bindingId: "binding-1",
        environment: "DEVELOPMENT",
        repositoryRef: "local/portal",
      }).platformUrl,
    ).toBe("http://localhost:3000");

    expect(() =>
      buildDigiPortalProjectConfig({
        platformUrl: "http://portal.example.test",
        projectId: "project-1",
        bindingId: "binding-1",
        environment: "DEVELOPMENT",
        repositoryRef: "local/portal",
      }),
    ).toThrow("must use HTTPS");
  });
});

describe("Digi-Portal authority and state foundation", () => {
  it("allows only admins to create pending bindings", async () => {
    const input = {
      id: "binding-1",
      projectId: "project-1",
      environment: "PILOT" as const,
      platformUrl: "https://portal.digicolony.net",
      repositoryRef: "digicolony/portal",
      configFingerprint: "sha256:test",
    };

    await expect(
      createPendingProjectBinding(
        repository(),
        { kind: "user", user: { id: "admin", role: "ADMIN" } },
        enabledFlags,
        input,
      ),
    ).resolves.toMatchObject({ id: "binding-1", status: "PENDING" });

    await expect(
      createPendingProjectBinding(
        repository(),
        {
          kind: "user",
          user: {
            id: "client-user",
            role: "CLIENT_USER",
            clientId: "client-1",
          },
        },
        enabledFlags,
        input,
      ),
    ).rejects.toThrow("Admin permission required");
  });

  it("allows only admins to mark work agent-ready", async () => {
    await expect(
      markWorkItemAgentReady(
        repository(),
        { kind: "user", user: { id: "admin", role: "ADMIN" } },
        {
          workItemId: "work-1",
          acceptanceCriteria: "The regression test passes.",
          sensitivity: "NORMAL",
        },
      ),
    ).resolves.toMatchObject({ workItemId: "work-1", version: 1 });

    await expect(
      markWorkItemAgentReady(
        repository(),
        {
          kind: "user",
          user: {
            id: "client-user",
            role: "CLIENT_USER",
            clientId: "client-1",
          },
        },
        {
          workItemId: "work-1",
          acceptanceCriteria: "Ship it.",
          sensitivity: "NORMAL",
        },
      ),
    ).rejects.toThrow("Admin permission required");
  });

  it("keeps claims disabled unless the mutation flag and binding scope agree", async () => {
    const principal = {
      kind: "ai_agent" as const,
      agent: {
        id: "agent-1",
        clientId: "client-1",
        bindingId: "binding-1",
        scopes: ["claims:write" as const],
      },
    };
    const expiresAt = new Date(Date.now() + 60_000);

    await expect(
      claimAgentDispatch(
        repository(),
        principal,
        { ...enabledFlags, agentMutations: false },
        { dispatchId: "dispatch-1", leaseTokenHash: "sha256:lease", expiresAt },
      ),
    ).rejects.toThrow("mutations are disabled");

    await expect(
      claimAgentDispatch(repository(), principal, enabledFlags, {
        dispatchId: "dispatch-1",
        leaseTokenHash: "sha256:lease",
        expiresAt,
      }),
    ).resolves.toMatchObject({ id: "claim-1", agentId: "agent-1" });
  });

  it("enforces binding and dispatch transition matrices", () => {
    expect(() => assertProjectBindingTransition("PENDING", "ACTIVE")).toThrow(
      "not allowed",
    );
    expect(() =>
      assertProjectBindingTransition("VERIFIED", "ACTIVE"),
    ).not.toThrow();
    expect(() =>
      assertAgentDispatchTransition("QUEUED", "CLAIMED"),
    ).not.toThrow();
    expect(() => assertAgentDispatchTransition("COMPLETED", "QUEUED")).toThrow(
      "not allowed",
    );
  });
});
