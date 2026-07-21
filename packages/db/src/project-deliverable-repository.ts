import { randomUUID } from "node:crypto";
import type {
  ProjectDeliverableRecord,
  ProjectDeliverableRepository,
  StorageProvider,
} from "@digicolony/shared";
import type { Prisma, PrismaClient } from "@prisma/client";

function metadata(
  input: Record<string, unknown> | undefined,
): Prisma.InputJsonObject | undefined {
  return input as Prisma.InputJsonObject | undefined;
}

export function createPrismaProjectDeliverableRepository(
  prisma: PrismaClient,
  storageProvider: StorageProvider,
): ProjectDeliverableRepository {
  return {
    async projectExists(projectId) {
      return Boolean(
        await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true },
        }),
      );
    },
    async createDeliverable(input): Promise<ProjectDeliverableRecord> {
      const stored = await storageProvider.putObject({
        objectKey: `projects/${input.projectId}/deliverables/${randomUUID()}`,
        contentType: input.contentType,
        bytes: input.bytes,
      });

      try {
        const asset = await prisma.asset.create({
          data: {
            provider: stored.provider === "s3" ? "S3" : "LOCAL",
            objectKey: stored.objectKey,
            filename: input.filename,
            contentType: input.contentType,
            sizeBytes: stored.sizeBytes,
            checksum: stored.checksum,
            metadata: metadata({ classification: "PROJECT_DELIVERABLE" }),
            links: { create: { projectId: input.projectId } },
          },
          select: {
            id: true,
            filename: true,
            contentType: true,
            sizeBytes: true,
            createdAt: true,
            links: { select: { projectId: true }, take: 1 },
            deliverableShares: {
              select: {
                id: true,
                publicToken: true,
                expiresAt: true,
                revokedAt: true,
                downloadCount: true,
                lastDownloadedAt: true,
                createdAt: true,
              },
            },
          },
        });

        return {
          id: asset.id,
          projectId: asset.links[0]?.projectId ?? input.projectId,
          filename: asset.filename,
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          createdAt: asset.createdAt,
          shares: asset.deliverableShares,
        };
      } catch (error) {
        await storageProvider
          .deleteObject({ objectKey: stored.objectKey })
          .catch(() => undefined);
        throw error;
      }
    },
    async listDeliverables(
      projectId,
    ): Promise<readonly ProjectDeliverableRecord[]> {
      const links = await prisma.assetLink.findMany({
        where: { projectId, workItemId: null },
        orderBy: { createdAt: "desc" },
        select: {
          asset: {
            select: {
              id: true,
              filename: true,
              contentType: true,
              sizeBytes: true,
              createdAt: true,
              deliverableShares: {
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  publicToken: true,
                  expiresAt: true,
                  revokedAt: true,
                  downloadCount: true,
                  lastDownloadedAt: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      return links.map(({ asset }) => ({
        ...asset,
        projectId,
        shares: asset.deliverableShares,
      }));
    },
    async createShare(input) {
      const link = await prisma.assetLink.findFirst({
        where: {
          assetId: input.assetId,
          projectId: input.projectId,
          workItemId: null,
        },
        select: { id: true },
      });

      if (!link) {
        throw new Error("Project deliverable not found.");
      }

      return prisma.deliverableShare.create({
        data: input,
        select: {
          id: true,
          publicToken: true,
          expiresAt: true,
          revokedAt: true,
          downloadCount: true,
          lastDownloadedAt: true,
          createdAt: true,
        },
      });
    },
    async revokeShare(input) {
      const result = await prisma.deliverableShare.updateMany({
        where: {
          id: input.shareId,
          projectId: input.projectId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      return result.count === 1;
    },
    async recordActivity(input) {
      await prisma.activityEvent.create({
        data: {
          actorType: input.actor.type,
          actorId: input.actor.id,
          entityType: input.entityType,
          entityId: input.entityId,
          action: input.action,
          visibility: input.visibility,
          metadata: metadata(input.metadata),
        },
      });
    },
  };
}

export async function getPublicDeliverableShare(
  prisma: PrismaClient,
  publicToken: string,
) {
  return prisma.deliverableShare.findUnique({
    where: { publicToken },
    select: {
      id: true,
      passwordHash: true,
      expiresAt: true,
      revokedAt: true,
      failedAttempts: true,
      lockedUntil: true,
      asset: {
        select: {
          objectKey: true,
          filename: true,
          contentType: true,
          sizeBytes: true,
        },
      },
      project: { select: { name: true, client: { select: { name: true } } } },
    },
  });
}

export async function recordFailedDeliverablePassword(
  prisma: PrismaClient,
  share: { id: string; lockedUntil: Date | null },
  now = new Date(),
): Promise<void> {
  if (share.lockedUntil && share.lockedUntil <= now) {
    await prisma.deliverableShare.updateMany({
      where: { id: share.id, lockedUntil: { lte: now } },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  const updated = await prisma.deliverableShare.update({
    where: { id: share.id },
    data: { failedAttempts: { increment: 1 } },
    select: { failedAttempts: true },
  });

  if (updated.failedAttempts >= 5) {
    await prisma.deliverableShare.update({
      where: { id: share.id },
      data: { lockedUntil: new Date(now.getTime() + 15 * 60 * 1000) },
    });
  }
}

export async function recordDeliverableDownload(
  prisma: PrismaClient,
  shareId: string,
  now = new Date(),
): Promise<void> {
  await prisma.$transaction([
    prisma.deliverableShare.update({
      where: { id: shareId },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        downloadCount: { increment: 1 },
        lastDownloadedAt: now,
      },
    }),
    prisma.activityEvent.create({
      data: {
        actorType: "SYSTEM",
        actorId: "public-delivery",
        entityType: "DELIVERABLE_SHARE",
        entityId: shareId,
        action: "DOWNLOADED_PROJECT_DELIVERABLE",
        visibility: "ADMIN_ONLY",
      },
    }),
  ]);
}
