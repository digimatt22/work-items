import { describe, expect, it } from "vitest";
import {
  createAssetForLaunch,
  createCommentForLaunch,
  parseMentionTokens,
  type CollaborationRepository
} from "../src";

function repository(): CollaborationRepository {
  return {
    async getWorkItem(workItemId) {
      return { id: workItemId, clientId: "c1", projectId: "p1" };
    },
    async createComment(input) {
      return {
        id: "comment-1",
        workItemId: input.workItemId,
        authorId: input.authorId,
        body: input.body,
        createdAt: new Date()
      };
    },
    async listComments() {
      return [];
    },
    async createAsset(input) {
      return {
        id: "asset-1",
        filename: input.filename,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        createdAt: new Date()
      };
    },
    async listAssets() {
      return [];
    },
    async recordActivity() {
      return undefined;
    }
  };
}

describe("collaboration services", () => {
  it("parses unique mention tokens", () => {
    expect(parseMentionTokens("Hello @Matt and @matt plus @client-user")).toEqual([
      "matt",
      "client-user"
    ]);
  });

  it("creates comments for users with work item access", async () => {
    await expect(
      createCommentForLaunch(
        repository(),
        { kind: "user", user: { id: "u1", role: "CLIENT_USER", clientId: "c1" } },
        { workItemId: "w1", body: "Looks good @matt" }
      )
    ).resolves.toMatchObject({ id: "comment-1", body: "Looks good @matt" });
  });

  it("blocks disallowed asset extensions", async () => {
    await expect(
      createAssetForLaunch(
        repository(),
        { kind: "user", user: { id: "u1", role: "CLIENT_USER", clientId: "c1" } },
        {
          workItemId: "w1",
          filename: "script.sh",
          contentType: "text/x-shellscript",
          sizeBytes: 10,
          bytes: new Uint8Array([1])
        }
      )
    ).rejects.toThrow("Asset type or size is not allowed.");
  });
});
