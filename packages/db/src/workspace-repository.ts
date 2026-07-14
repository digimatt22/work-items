import type {
  ActivityEventDraft,
  WorkspaceActivityRecord,
  WorkspaceClientRecord,
  WorkspaceProjectRecord,
  WorkspaceRepository
} from "@digicolony/shared";
import type { Prisma, PrismaClient } from "@prisma/client";

function toInputJsonObject(
  metadata: Record<string, unknown> | undefined
): Prisma.InputJsonObject | undefined {
  return metadata as Prisma.InputJsonObject | undefined;
}

function toWorkspaceProjectRecord(project: {
  id: string;
  clientId: string;
  client: { name: string };
  name: string;
  description: string | null;
  archivedAt: Date | null;
}): WorkspaceProjectRecord {
  return {
    id: project.id,
    clientId: project.clientId,
    clientName: project.client.name,
    name: project.name,
    description: project.description,
    archivedAt: project.archivedAt
  };
}

export function createPrismaWorkspaceRepository(
  prisma: PrismaClient
): WorkspaceRepository {
  return {
    async listClients(): Promise<readonly WorkspaceClientRecord[]> {
      return prisma.client.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          archivedAt: true
        }
      });
    },
    async getClient(clientId): Promise<WorkspaceClientRecord | null> {
      return prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          description: true,
          archivedAt: true
        }
      });
    },
    async createClient(input): Promise<WorkspaceClientRecord> {
      return prisma.client.create({
        data: input,
        select: {
          id: true,
          name: true,
          description: true,
          archivedAt: true
        }
      });
    },
    async archiveClient(clientId): Promise<WorkspaceClientRecord> {
      return prisma.client.update({
        where: { id: clientId },
        data: { archivedAt: new Date() },
        select: {
          id: true,
          name: true,
          description: true,
          archivedAt: true
        }
      });
    },
    async listProjects(): Promise<readonly WorkspaceProjectRecord[]> {
      const projects = await prisma.project.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true,
          description: true,
          archivedAt: true
        }
      });

      return projects.map(toWorkspaceProjectRecord);
    },
    async listProjectsForClient(clientId): Promise<readonly WorkspaceProjectRecord[]> {
      const projects = await prisma.project.findMany({
        where: { clientId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true,
          description: true,
          archivedAt: true
        }
      });

      return projects.map(toWorkspaceProjectRecord);
    },
    async createProject(input): Promise<WorkspaceProjectRecord> {
      const project = await prisma.project.create({
        data: input,
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true,
          description: true,
          archivedAt: true
        }
      });

      return toWorkspaceProjectRecord(project);
    },
    async archiveProject(projectId): Promise<WorkspaceProjectRecord> {
      const project = await prisma.project.update({
        where: { id: projectId },
        data: { archivedAt: new Date() },
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true,
          description: true,
          archivedAt: true
        }
      });

      return toWorkspaceProjectRecord(project);
    },
    async listActivityForClient(clientId): Promise<readonly WorkspaceActivityRecord[]> {
      return prisma.activityEvent.findMany({
        where: {
          OR: [
            { entityType: "CLIENT", entityId: clientId },
            {
              entityType: "PROJECT",
              metadata: {
                path: ["clientId"],
                equals: clientId
              }
            }
          ]
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          entityType: true,
          entityId: true,
          action: true,
          visibility: true,
          createdAt: true
        }
      });
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
