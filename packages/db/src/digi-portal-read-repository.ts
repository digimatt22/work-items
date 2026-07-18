import type {
  DigiPortalAccessGrant,
  DigiPortalReadRepository,
  DigiPortalWorkItem,
  ProjectBindingRecord,
} from "@digicolony/shared";
import type { Prisma, PrismaClient } from "@prisma/client";

const bindingSelect = {
  id: true,
  projectId: true,
  project: { select: { name: true, client: { select: { name: true } } } },
  environment: true,
  status: true,
  platformUrl: true,
  repositoryRef: true,
  workspaceRef: true,
  configFingerprint: true,
  createdAt: true,
  verifiedAt: true,
  activatedAt: true,
  revokedAt: true,
} satisfies Prisma.ProjectBindingSelect;

function toBinding(
  binding: Prisma.ProjectBindingGetPayload<{ select: typeof bindingSelect }>,
): ProjectBindingRecord {
  return {
    id: binding.id,
    projectId: binding.projectId,
    projectName: binding.project.name,
    clientName: binding.project.client.name,
    environment: binding.environment,
    status: binding.status,
    platformUrl: binding.platformUrl,
    repositoryRef: binding.repositoryRef,
    workspaceRef: binding.workspaceRef,
    configFingerprint: binding.configFingerprint,
    createdAt: binding.createdAt,
    verifiedAt: binding.verifiedAt,
    activatedAt: binding.activatedAt,
    revokedAt: binding.revokedAt,
  };
}

const workSelect = {
  id: true,
  priority: true,
  availableAt: true,
  workItem: {
    select: {
      id: true,
      projectId: true,
      type: true,
      title: true,
      description: true,
    },
  },
  qualification: {
    select: { acceptanceCriteria: true, implementationNotes: true },
  },
} satisfies Prisma.AgentDispatchSelect;

function toWork(
  dispatch: Prisma.AgentDispatchGetPayload<{ select: typeof workSelect }>,
): DigiPortalWorkItem {
  return {
    id: dispatch.workItem.id,
    dispatchId: dispatch.id,
    projectId: dispatch.workItem.projectId,
    type: dispatch.workItem.type,
    title: dispatch.workItem.title,
    description: dispatch.workItem.description,
    acceptanceCriteria: dispatch.qualification.acceptanceCriteria,
    implementationNotes: dispatch.qualification.implementationNotes,
    priority: dispatch.priority,
    availableAt: dispatch.availableAt,
  };
}

export function createPrismaDigiPortalReadRepository(
  prisma: PrismaClient,
): DigiPortalReadRepository {
  const eligibleWhere = (
    bindingId: string,
  ): Prisma.AgentDispatchWhereInput => ({
    bindingId,
    state: "QUEUED",
    availableAt: { lte: new Date() },
    binding: { status: "ACTIVE", activeKey: { not: null } },
    qualification: { state: "READY", revokedAt: null },
    workItem: { archivedAt: null },
  });

  return {
    async getAccessGrant(tokenHash): Promise<DigiPortalAccessGrant | null> {
      const grant = await prisma.mcpAccessGrant.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          agentId: true,
          bindingId: true,
          scopes: true,
          resource: true,
          expiresAt: true,
          revokedAt: true,
          oauthClient: { select: { clientId: true } },
          binding: { select: { projectId: true } },
        },
      });
      if (!grant) return null;
      return {
        id: grant.id,
        agentId: grant.agentId,
        clientId: grant.oauthClient.clientId,
        bindingId: grant.bindingId,
        projectId: grant.binding.projectId,
        scopes: Array.isArray(grant.scopes) ? grant.scopes.map(String) : [],
        resource: grant.resource,
        expiresAt: grant.expiresAt,
        revokedAt: grant.revokedAt,
      };
    },
    async getBinding(bindingId) {
      const binding = await prisma.projectBinding.findUnique({
        where: { id: bindingId },
        select: bindingSelect,
      });
      return binding ? toBinding(binding) : null;
    },
    async listReadyWork(bindingId, limit) {
      const rows = await prisma.agentDispatch.findMany({
        where: eligibleWhere(bindingId),
        orderBy: [{ priority: "desc" }, { availableAt: "asc" }],
        take: limit,
        select: workSelect,
      });
      return rows.map(toWork);
    },
    async getReadyWork(bindingId, workItemId) {
      const row = await prisma.agentDispatch.findFirst({
        where: { ...eligibleWhere(bindingId), workItemId },
        select: workSelect,
      });
      return row ? toWork(row) : null;
    },
    async searchReadyWork(bindingId, query, limit) {
      const rows = await prisma.agentDispatch.findMany({
        where: {
          ...eligibleWhere(bindingId),
          workItem: {
            archivedAt: null,
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
        },
        orderBy: [{ priority: "desc" }, { availableAt: "asc" }],
        take: limit,
        select: workSelect,
      });
      return rows.map(toWork);
    },
  };
}
