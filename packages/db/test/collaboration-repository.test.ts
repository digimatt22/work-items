import type { PrismaClient } from "@prisma/client";
import type { StorageProvider } from "@digicolony/shared";
import { describe, expect, it, vi } from "vitest";
import { createPrismaCollaborationRepository } from "../src/collaboration-repository";

describe("collaboration asset storage", () => {
  it("records the provider and removes an uploaded object when metadata fails", async () => {
    const deleteObject = vi.fn().mockResolvedValue(undefined);
    const storage = {
      putObject: vi.fn().mockResolvedValue({
        provider: "s3",
        objectKey: "work-items/item-1/object-1",
        contentType: "text/plain",
        sizeBytes: 3,
        checksum: "checksum",
      }),
      deleteObject,
    } as unknown as StorageProvider;
    const prisma = {
      asset: {
        create: vi.fn().mockRejectedValue(new Error("database failed")),
      },
    } as unknown as PrismaClient;
    const repository = createPrismaCollaborationRepository(prisma, storage);

    await expect(
      repository.createAsset({
        workItemId: "item-1",
        filename: "proof.txt",
        contentType: "text/plain",
        sizeBytes: 3,
        bytes: new Uint8Array([1, 2, 3]),
      }),
    ).rejects.toThrow("database failed");
    expect(deleteObject).toHaveBeenCalledWith({
      objectKey: "work-items/item-1/object-1",
    });
  });
});
