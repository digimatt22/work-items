import { describe, expect, it } from "vitest";
import {
  createDeliverableShare,
  createProjectDeliverable,
  revokeDeliverableShare,
  type ActivityEventDraft,
  type ProjectDeliverableRepository,
} from "../src";

function repository(overrides: Partial<ProjectDeliverableRepository> = {}) {
  const activity: ActivityEventDraft[] = [];
  const base: ProjectDeliverableRepository = {
    async projectExists() {
      return true;
    },
    async createDeliverable(input) {
      return {
        id: "asset-1",
        projectId: input.projectId,
        filename: input.filename,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        createdAt: new Date("2026-07-21T12:00:00Z"),
        shares: [],
      };
    },
    async listDeliverables() {
      return [];
    },
    async createShare(input) {
      return {
        id: "share-1",
        publicToken: input.publicToken,
        expiresAt: input.expiresAt,
        revokedAt: null,
        downloadCount: 0,
        lastDownloadedAt: null,
        createdAt: new Date("2026-07-21T12:00:00Z"),
      };
    },
    async revokeShare() {
      return true;
    },
    async recordActivity(input) {
      activity.push(input);
    },
    ...overrides,
  };
  return { activity, repository: base };
}

const admin = { kind: "user", user: { id: "admin-1", role: "ADMIN" } } as const;
const client = {
  kind: "user",
  user: { id: "client-1", role: "CLIENT_USER", clientId: "client-1" },
} as const;

describe("project deliverables", () => {
  it("lets an admin upload an allowed project deliverable and audits it", async () => {
    const target = repository();
    const result = await createProjectDeliverable(target.repository, admin, {
      projectId: "project-1",
      filename: "handoff.pdf",
      contentType: "application/pdf",
      sizeBytes: 4,
      bytes: new Uint8Array([1, 2, 3, 4]),
    });

    expect(result.id).toBe("asset-1");
    expect(target.activity).toMatchObject([
      { action: "UPLOADED_PROJECT_DELIVERABLE", visibility: "ADMIN_ONLY" },
    ]);
  });

  it("blocks client users from uploading project deliverables", async () => {
    const target = repository();
    await expect(
      createProjectDeliverable(target.repository, client, {
        projectId: "project-1",
        filename: "handoff.pdf",
        contentType: "application/pdf",
        sizeBytes: 1,
        bytes: new Uint8Array([1]),
      }),
    ).rejects.toThrow("Admin permission required.");
  });

  it("rejects blocked file extensions", async () => {
    const target = repository();
    await expect(
      createProjectDeliverable(target.repository, admin, {
        projectId: "project-1",
        filename: "payload.exe",
        contentType: "application/octet-stream",
        sizeBytes: 1,
        bytes: new Uint8Array([1]),
      }),
    ).rejects.toThrow("Deliverable type or size is not allowed.");
  });

  it("creates and revokes shares with admin-only audit events", async () => {
    const target = repository();
    const expiresAt = new Date(Date.now() + 60_000);

    await createDeliverableShare(target.repository, admin, {
      projectId: "project-1",
      assetId: "asset-1",
      publicToken: "public-token",
      passwordHash: "hash",
      expiresAt,
    });
    await revokeDeliverableShare(target.repository, admin, {
      projectId: "project-1",
      shareId: "share-1",
    });

    expect(target.activity.map((event) => event.action)).toEqual([
      "CREATED_DELIVERABLE_SHARE",
      "REVOKED_DELIVERABLE_SHARE",
    ]);
    expect(
      target.activity.every((event) => event.visibility === "ADMIN_ONLY"),
    ).toBe(true);
  });
});
