import { randomUUID } from "node:crypto";
import type {
  AssetRecord,
  CollaborationRepository,
  CollaborationWorkItemRef,
  CommentRecord,
  CreateAssetInput,
  StorageProvider
} from "@digicolony/shared";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { ActivityEventDraft } from "@digicolony/shared";

function toInputJsonObject(
  metadata: Record<string, unknown> | undefined
): Prisma.InputJsonObject | undefined {
  return metadata as Prisma.InputJsonObject | undefined;
}

export function createPrismaCollaborationRepository(
  prisma: PrismaClient,
  storageProvider: StorageProvider
): CollaborationRepository {
  return {
    async getWorkItem(workItemId): Promise<CollaborationWorkItemRef | null> {
      const item = await prisma.workItem.findUnique({
        where: { id: workItemId },
        select: {
          id: true,
          projectId: true,
          project: { select: { clientId: true } }
        }
      });

      return item
        ? { id: item.id, projectId: item.projectId, clientId: item.project.clientId }
        : null;
    },
    async createComment(input): Promise<CommentRecord> {
      const comment = await prisma.comment.create({
        data: {
          workItemId: input.workItemId,
          authorId: input.authorId,
          body: input.body
        },
        select: {
          id: true,
          workItemId: true,
          authorId: true,
          body: true,
          createdAt: true
        }
      });

      if (input.mentions.length > 0) {
        await prisma.mention.createMany({
          data: input.mentions.map((token) => ({
            commentId: comment.id,
            token
          }))
        });
      }

      return comment;
    },
    async listComments(workItemId): Promise<readonly CommentRecord[]> {
      return prisma.comment.findMany({
        where: { workItemId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          workItemId: true,
          authorId: true,
          body: true,
          createdAt: true
        }
      });
    },
    async createAsset(input: CreateAssetInput): Promise<AssetRecord> {
      const objectKey = `work-items/${input.workItemId}/${randomUUID()}-${input.filename}`;
      const stored = await storageProvider.putObject({
        objectKey,
        contentType: input.contentType,
        bytes: input.bytes
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
            links: {
              create: {
                workItemId: input.workItemId
              }
            }
          },
          select: {
            id: true,
            filename: true,
            contentType: true,
            sizeBytes: true,
            createdAt: true
          }
        });

        return asset;
      } catch (error) {
        await storageProvider
          .deleteObject({ objectKey: stored.objectKey })
          .catch(() => undefined);
        throw error;
      }
    },
    async listAssets(workItemId): Promise<readonly AssetRecord[]> {
      const links = await prisma.assetLink.findMany({
        where: { workItemId },
        orderBy: { createdAt: "desc" },
        select: {
          asset: {
            select: {
              id: true,
              filename: true,
              contentType: true,
              sizeBytes: true,
              createdAt: true
            }
          }
        }
      });

      return links.map((link) => link.asset);
    },
    async recordActivity(input: ActivityEventDraft): Promise<void> {
      await prisma.activityEvent.create({
        data: {
          actorType: input.actor.type,
          actorId: input.actor.id,
          entityType: input.entityType,
          entityId: input.entityId,
          action: input.action,
          visibility: input.visibility,
          metadata: toInputJsonObject(input.metadata)
        }
      });
    }
  };
}
