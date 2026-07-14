import type {
  ActivityEventDraft,
  PipelineStatusRecord,
  WorkItemProjectRef,
  WorkItemRecord,
  WorkItemRepository
} from "@digicolony/shared";
import type { Prisma, PrismaClient, WorkItemType } from "@prisma/client";

function toInputJsonObject(
  metadata: Record<string, unknown> | undefined
): Prisma.InputJsonObject | undefined {
  return metadata as Prisma.InputJsonObject | undefined;
}

function toWorkItemRecord(item: {
  id: string;
  projectId: string;
  type: WorkItemType;
  title: string;
  description: string;
  creatorId: string;
  reporterId: string;
  assigneeId: string | null;
  pipelineStatusId: string;
  releaseTargetId: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  project: { clientId: string; name: string; client: { name: string } };
  pipelineStatus: { label: string; color: string };
}): WorkItemRecord {
  return {
    id: item.id,
    projectId: item.projectId,
    projectName: item.project.name,
    clientId: item.project.clientId,
    clientName: item.project.client.name,
    type: item.type,
    title: item.title,
    description: item.description,
    creatorId: item.creatorId,
    reporterId: item.reporterId,
    assigneeId: item.assigneeId,
    pipelineStatusId: item.pipelineStatusId,
    pipelineStatusLabel: item.pipelineStatus.label,
    pipelineStatusColor: item.pipelineStatus.color,
    releaseTargetId: item.releaseTargetId,
    archivedAt: item.archivedAt,
    createdAt: item.createdAt
  };
}

function toProjectRef(project: {
  id: string;
  clientId: string;
  client: { name: string };
  name: string;
}): WorkItemProjectRef {
  return {
    id: project.id,
    clientId: project.clientId,
    clientName: project.client.name,
    name: project.name
  };
}

export function createPrismaWorkItemRepository(
  prisma: PrismaClient
): WorkItemRepository {
  return {
    async getProject(projectId): Promise<WorkItemProjectRef | null> {
      return prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true
        }
      }).then((project) => (project ? toProjectRef(project) : null));
    },
    async listProjects(): Promise<readonly WorkItemProjectRef[]> {
      const projects = await prisma.project.findMany({
        where: { archivedAt: null },
        orderBy: { name: "asc" },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true
        }
      });

      return projects.map(toProjectRef);
    },
    async listPipelineStatuses(): Promise<readonly PipelineStatusRecord[]> {
      return prisma.pipelineStatus.findMany({
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          key: true,
          label: true,
          color: true,
          sortOrder: true,
          isDefault: true
        }
      });
    },
    async getDefaultPipelineStatus(): Promise<PipelineStatusRecord | null> {
      return prisma.pipelineStatus.findFirst({
        where: { isDefault: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          key: true,
          label: true,
          color: true,
          sortOrder: true,
          isDefault: true
        }
      });
    },
    async listWorkItems(): Promise<readonly WorkItemRecord[]> {
      const items = await prisma.workItem.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: {
              clientId: true,
              name: true,
              client: { select: { name: true } }
            }
          },
          pipelineStatus: { select: { label: true, color: true } }
        }
      });

      return items.map(toWorkItemRecord);
    },
    async createWorkItem(input): Promise<WorkItemRecord> {
      const item = await prisma.workItem.create({
        data: {
          projectId: input.projectId,
          type: input.type,
          title: input.title,
          description: input.description,
          creatorId: input.creatorId,
          reporterId: input.reporterId,
          assigneeId: input.assigneeId,
          releaseTargetId: input.releaseTargetId,
          pipelineStatusId: input.pipelineStatusId,
          bugDetails:
            input.type === "BUG" && input.bugDetails
              ? {
                  create: input.bugDetails
                }
              : undefined,
          featureDetails:
            input.type === "FEATURE" && input.featureDetails
              ? {
                  create: input.featureDetails
                }
              : undefined
        },
        include: {
          project: {
            select: {
              clientId: true,
              name: true,
              client: { select: { name: true } }
            }
          },
          pipelineStatus: { select: { label: true, color: true } }
        }
      });

      return toWorkItemRecord(item);
    },
    async changeStatus(input): Promise<WorkItemRecord> {
      const item = await prisma.workItem.update({
        where: { id: input.workItemId },
        data: { pipelineStatusId: input.pipelineStatusId },
        include: {
          project: {
            select: {
              clientId: true,
              name: true,
              client: { select: { name: true } }
            }
          },
          pipelineStatus: { select: { label: true, color: true } }
        }
      });

      return toWorkItemRecord(item);
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
