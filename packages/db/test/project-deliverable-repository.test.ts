import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { recordFailedDeliverablePassword } from "../src/project-deliverable-repository";

describe("deliverable password lockout", () => {
  it("locks the share for 15 minutes on the fifth failed attempt", async () => {
    const now = new Date("2026-07-21T16:00:00Z");
    const update = vi
      .fn()
      .mockResolvedValueOnce({ failedAttempts: 5 })
      .mockResolvedValueOnce({});
    const prisma = {
      deliverableShare: { update, updateMany: vi.fn() },
    } as unknown as PrismaClient;

    await recordFailedDeliverablePassword(
      prisma,
      { id: "share-1", lockedUntil: null },
      now,
    );

    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: "share-1" },
      data: { lockedUntil: new Date("2026-07-21T16:15:00Z") },
    });
  });

  it("resets an expired lock before counting the next failure", async () => {
    const now = new Date("2026-07-21T16:00:00Z");
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const update = vi.fn().mockResolvedValue({ failedAttempts: 1 });
    const prisma = {
      deliverableShare: { update, updateMany },
    } as unknown as PrismaClient;

    await recordFailedDeliverablePassword(
      prisma,
      { id: "share-1", lockedUntil: new Date("2026-07-21T15:59:00Z") },
      now,
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "share-1", lockedUntil: { lte: now } },
      data: { failedAttempts: 0, lockedUntil: null },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "share-1" },
      data: { failedAttempts: { increment: 1 } },
      select: { failedAttempts: true },
    });
  });
});
