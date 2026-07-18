import type {
  AgentClaimRecord,
  AgentDeliveryFoundationRepository,
  AgentDeliveryProjectRecord,
  AgentDispatchRecord,
  ProjectBindingRecord,
  WorkQualificationRecord,
} from "@digicolony/shared";
import type { Prisma, PrismaClient } from "@prisma/client";

function asJson(value: Record<string, unknown>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function toProjectRecord(project: {
  id: string;
  clientId: string;
  client: { name: string };
  name: string;
  archivedAt: Date | null;
}): AgentDeliveryProjectRecord {
  return {
    id: project.id,
    clientId: project.clientId,
    clientName: project.client.name,
    name: project.name,
    archivedAt: project.archivedAt,
  };
}

function toBindingRecord(binding: {
  id: string;
  projectId: string;
  project: { name: string; client: { name: string } };
  environment: "DEVELOPMENT" | "PILOT" | "PRODUCTION";
  status: "PENDING" | "VERIFIED" | "ACTIVE" | "REVOKED";
  platformUrl: string;
  repositoryRef: string;
  workspaceRef: string | null;
  configFingerprint: string;
  createdAt: Date;
  verifiedAt: Date | null;
  activatedAt: Date | null;
  revokedAt: Date | null;
}): ProjectBindingRecord {
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

export function createPrismaAgentDeliveryFoundationRepository(
  prisma: PrismaClient,
): AgentDeliveryFoundationRepository {
  return {
    async listProjects(): Promise<readonly AgentDeliveryProjectRecord[]> {
      const projects = await prisma.project.findMany({
        orderBy: [{ client: { name: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          clientId: true,
          client: { select: { name: true } },
          name: true,
          archivedAt: true,
        },
      });

      return projects.map(toProjectRecord);
    },

    async listBindings(): Promise<readonly ProjectBindingRecord[]> {
      const bindings = await prisma.projectBinding.findMany({
        orderBy: { createdAt: "desc" },
        select: bindingSelect,
      });

      return bindings.map(toBindingRecord);
    },

    async getDispatch(dispatchId): Promise<AgentDispatchRecord | null> {
      const dispatch = await prisma.agentDispatch.findUnique({
        where: { id: dispatchId },
        select: {
          id: true,
          workItemId: true,
          bindingId: true,
          state: true,
          version: true,
          workItem: {
            select: {
              projectId: true,
              project: { select: { clientId: true } },
            },
          },
        },
      });

      if (!dispatch) {
        return null;
      }

      return {
        id: dispatch.id,
        workItemId: dispatch.workItemId,
        clientId: dispatch.workItem.project.clientId,
        projectId: dispatch.workItem.projectId,
        bindingId: dispatch.bindingId,
        state: dispatch.state,
        version: dispatch.version,
      };
    },

    async createPendingBindingWithAudit(input): Promise<ProjectBindingRecord> {
      return prisma.$transaction(async (transaction) => {
        const binding = await transaction.projectBinding.create({
          data: {
            id: input.id,
            projectId: input.projectId,
            createdById: input.createdById,
            environment: input.environment,
            platformUrl: input.platformUrl,
            repositoryRef: input.repositoryRef,
            workspaceRef: input.workspaceRef,
            configFingerprint: input.configFingerprint,
          },
          select: bindingSelect,
        });

        await transaction.activityEvent.create({
          data: {
            actorType: "USER",
            actorId: input.createdById,
            entityType: "PROJECT_BINDING",
            entityId: binding.id,
            action: "CREATED",
            visibility: "ADMIN_ONLY",
            metadata: asJson({
              projectId: input.projectId,
              environment: input.environment,
              repositoryRef: input.repositoryRef,
              status: "PENDING",
            }),
          },
        });

        return toBindingRecord(binding);
      });
    },

    async activateBindingWithAudit(input): Promise<ProjectBindingRecord> {
      return prisma.$transaction(
        async (transaction) => {
          const current = await transaction.projectBinding.findUnique({
            where: { id: input.bindingId },
            select: {
              id: true,
              projectId: true,
              status: true,
              configFingerprint: true,
            },
          });

          if (
            !current ||
            current.status !== "PENDING" ||
            current.configFingerprint !== input.configFingerprint
          ) {
            throw new Error(
              "Pending binding or config fingerprint does not match.",
            );
          }

          const now = new Date();
          const binding = await transaction.projectBinding.update({
            where: { id: current.id },
            data: {
              status: "ACTIVE",
              activeKey: current.projectId,
              verifiedAt: now,
              activatedAt: now,
            },
            select: bindingSelect,
          });

          await transaction.activityEvent.create({
            data: {
              actorType: "USER",
              actorId: input.activatedById,
              entityType: "PROJECT_BINDING",
              entityId: binding.id,
              action: "VERIFIED_AND_ACTIVATED",
              visibility: "ADMIN_ONLY",
              metadata: asJson({
                projectId: binding.projectId,
                status: "ACTIVE",
              }),
            },
          });

          return toBindingRecord(binding);
        },
        { isolationLevel: "Serializable" },
      );
    },

    async markWorkItemReadyWithAudit(input): Promise<WorkQualificationRecord> {
      return prisma.$transaction(
        async (transaction) => {
          const workItem = await transaction.workItem.findUnique({
            where: { id: input.workItemId },
            select: {
              id: true,
              archivedAt: true,
              projectId: true,
            },
          });

          if (!workItem || workItem.archivedAt) {
            throw new Error("Active work item not found.");
          }

          const binding = await transaction.projectBinding.findFirst({
            where: {
              projectId: workItem.projectId,
              status: "ACTIVE",
              activeKey: { not: null },
            },
            orderBy: { activatedAt: "desc" },
            select: { id: true },
          });

          if (!binding) {
            throw new Error("Active Digi-Portal project binding required.");
          }

          const latest = await transaction.workQualification.findFirst({
            where: { workItemId: workItem.id },
            orderBy: { version: "desc" },
            select: { version: true },
          });
          const version = (latest?.version ?? 0) + 1;
          const qualification = await transaction.workQualification.create({
            data: {
              workItemId: workItem.id,
              version,
              acceptanceCriteria: input.acceptanceCriteria,
              implementationNotes: input.implementationNotes,
              sensitivity: input.sensitivity,
              qualifiedById: input.qualifiedById,
            },
          });

          const dispatch = await transaction.agentDispatch.upsert({
            where: { workItemId: workItem.id },
            create: {
              workItemId: workItem.id,
              bindingId: binding.id,
              qualificationId: qualification.id,
              priority: input.priority,
            },
            update: {
              bindingId: binding.id,
              qualificationId: qualification.id,
              state: "QUEUED",
              priority: input.priority,
              availableAt: new Date(),
              version: { increment: 1 },
              lastErrorCode: null,
            },
            select: { id: true },
          });

          await transaction.activityEvent.create({
            data: {
              actorType: "USER",
              actorId: input.qualifiedById,
              entityType: "WORK_QUALIFICATION",
              entityId: qualification.id,
              action: "QUALIFIED_FOR_AGENT",
              visibility: "ADMIN_ONLY",
              metadata: asJson({
                workItemId: workItem.id,
                projectId: workItem.projectId,
                bindingId: binding.id,
                dispatchId: dispatch.id,
                qualificationVersion: version,
                sensitivity: input.sensitivity,
              }),
            },
          });

          await transaction.outboxEvent.create({
            data: {
              aggregateType: "AGENT_DISPATCH",
              aggregateId: dispatch.id,
              eventType: "agent_dispatch.queued",
              payload: asJson({
                dispatchId: dispatch.id,
                workItemId: workItem.id,
                bindingId: binding.id,
                qualificationVersion: version,
              }),
            },
          });

          return {
            id: qualification.id,
            workItemId: qualification.workItemId,
            version: qualification.version,
            acceptanceCriteria: qualification.acceptanceCriteria,
            implementationNotes: qualification.implementationNotes,
            sensitivity: qualification.sensitivity,
            createdAt: qualification.createdAt,
          };
        },
        { isolationLevel: "Serializable" },
      );
    },

    async claimDispatchWithAudit(input): Promise<AgentClaimRecord> {
      return prisma.$transaction(
        async (transaction) => {
          const dispatch = await transaction.agentDispatch.findUnique({
            where: { id: input.dispatchId },
            select: { id: true, bindingId: true, state: true },
          });

          if (!dispatch || dispatch.state !== "QUEUED") {
            throw new Error("Agent dispatch is not claimable.");
          }

          const attemptCount = await transaction.deliveryAttempt.count({
            where: { dispatchId: dispatch.id },
          });
          const claim = await transaction.agentClaim.create({
            data: {
              dispatchId: dispatch.id,
              agentId: input.agentId,
              leaseTokenHash: input.leaseTokenHash,
              activeKey: dispatch.id,
              expiresAt: input.expiresAt,
              attempt: {
                create: {
                  dispatchId: dispatch.id,
                  sequence: attemptCount + 1,
                },
              },
            },
            select: {
              id: true,
              dispatchId: true,
              agentId: true,
              expiresAt: true,
              attempt: { select: { id: true, sequence: true } },
            },
          });

          await transaction.agentDispatch.update({
            where: { id: dispatch.id },
            data: { state: "CLAIMED", version: { increment: 1 } },
          });

          const activity = await transaction.activityEvent.create({
            data: {
              actorType: "AI_AGENT",
              actorId: input.agentId,
              entityType: "AGENT_DISPATCH",
              entityId: dispatch.id,
              action: "CLAIMED",
              visibility: "ADMIN_ONLY",
              metadata: asJson({
                bindingId: dispatch.bindingId,
                claimId: claim.id,
                expiresAt: input.expiresAt.toISOString(),
              }),
            },
            select: { id: true },
          });

          await transaction.aiAction.create({
            data: {
              activityEventId: activity.id,
              agentId: input.agentId,
              toolName: "work_items.claim",
              authorizationScope:
                input.authorizationScope as Prisma.InputJsonArray,
              resultSummary: "Agent dispatch claimed with an expiring lease.",
              metadata: asJson({
                bindingId: dispatch.bindingId,
                dispatchId: dispatch.id,
                claimId: claim.id,
              }),
            },
          });

          if (!claim.attempt) {
            throw new Error("Delivery attempt was not created.");
          }

          return {
            id: claim.id,
            dispatchId: claim.dispatchId,
            agentId: claim.agentId,
            expiresAt: claim.expiresAt,
            attemptId: claim.attempt.id,
            attemptSequence: claim.attempt.sequence,
          };
        },
        { isolationLevel: "Serializable" },
      );
    },
  };
}
