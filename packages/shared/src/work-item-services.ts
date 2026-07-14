import type { ActivityEventDraft } from "./activity";
import type { Principal } from "./actors";
import { canCreateWorkItem, canMovePipelineStatus, canViewClientProject } from "./permissions";
import type { BugDetailsDraft, FeatureDetailsDraft, WorkItemType } from "./work-items";

export interface WorkItemProjectRef {
  readonly id: string;
  readonly clientId: string;
  readonly clientName?: string;
  readonly name: string;
}

export interface PipelineStatusRecord {
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly color: string;
  readonly sortOrder: number;
  readonly isDefault: boolean;
}

export interface WorkItemRecord {
  readonly id: string;
  readonly projectId: string;
  readonly projectName?: string;
  readonly clientId: string;
  readonly clientName?: string;
  readonly type: WorkItemType;
  readonly title: string;
  readonly description: string;
  readonly reporterId: string;
  readonly creatorId: string;
  readonly assigneeId?: string | null;
  readonly pipelineStatusId: string;
  readonly pipelineStatusLabel: string;
  readonly pipelineStatusColor?: string;
  readonly releaseTargetId?: string | null;
  readonly archivedAt?: Date | null;
  readonly createdAt: Date;
}

export interface CreateWorkItemServiceInput {
  readonly projectId: string;
  readonly type: WorkItemType;
  readonly title: string;
  readonly description: string;
  readonly reporterId: string;
  readonly pipelineStatusId?: string;
  readonly assigneeId?: string;
  readonly releaseTargetId?: string;
  readonly bugDetails?: BugDetailsDraft;
  readonly featureDetails?: FeatureDetailsDraft;
}

export interface WorkItemRepository {
  getProject(projectId: string): Promise<WorkItemProjectRef | null>;
  listProjects(): Promise<readonly WorkItemProjectRef[]>;
  listPipelineStatuses(): Promise<readonly PipelineStatusRecord[]>;
  getDefaultPipelineStatus(): Promise<PipelineStatusRecord | null>;
  listWorkItems(): Promise<readonly WorkItemRecord[]>;
  createWorkItem(input: CreateWorkItemServiceInput & { creatorId: string; pipelineStatusId: string }): Promise<WorkItemRecord>;
  changeStatus(input: { workItemId: string; pipelineStatusId: string }): Promise<WorkItemRecord>;
  recordActivity(input: ActivityEventDraft): Promise<void>;
}

function normalizeRequired(value: string, label: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function validateTypeDetails(input: CreateWorkItemServiceInput): void {
  if (input.type === "BUG" && !input.bugDetails) {
    throw new Error("Bug details are required for Bug work items.");
  }

  if (input.type === "FEATURE" && !input.featureDetails) {
    throw new Error("Feature details are required for Feature work items.");
  }
}

export async function listVisibleWorkItems(
  repository: WorkItemRepository,
  principal: Principal
): Promise<readonly WorkItemRecord[]> {
  const items = await repository.listWorkItems();

  return items.filter(
    (item) => {
      if (item.archivedAt || !canViewClientProject(principal, item.clientId)) {
        return false;
      }

      if (principal.kind === "user" && principal.user.role === "CLIENT_USER") {
        return item.reporterId === principal.user.id || item.creatorId === principal.user.id;
      }

      return true;
    }
  );
}

export async function listVisibleWorkItemProjects(
  repository: WorkItemRepository,
  principal: Principal
): Promise<readonly WorkItemProjectRef[]> {
  const projects = await repository.listProjects();

  return projects.filter((project) => canViewClientProject(principal, project.clientId));
}

export async function createWorkItemForLaunch(
  repository: WorkItemRepository,
  principal: Principal,
  input: CreateWorkItemServiceInput
): Promise<WorkItemRecord> {
  const project = await repository.getProject(input.projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  if (!canCreateWorkItem(principal, project.clientId)) {
    throw new Error("Work item creation is not permitted.");
  }

  validateTypeDetails(input);

  const statuses = await repository.listPipelineStatuses();
  const requestedStatus = input.pipelineStatusId
    ? statuses.find((status) => status.id === input.pipelineStatusId)
    : undefined;
  const defaultStatus = requestedStatus ?? await repository.getDefaultPipelineStatus();

  if (!defaultStatus) {
    throw new Error("Default pipeline status is required.");
  }

  const actorId = principal.kind === "user" ? principal.user.id : principal.kind === "ai_agent" ? principal.agent.id : principal.actor.id;
  const item = await repository.createWorkItem({
    ...input,
    title: normalizeRequired(input.title, "Title"),
    description: normalizeRequired(input.description, "Description"),
    creatorId: actorId,
    pipelineStatusId: defaultStatus.id
  });

  await repository.recordActivity({
    actor: principal.kind === "user" ? { type: "USER", id: principal.user.id } : { type: "AI_AGENT", id: actorId },
    entityType: "WORK_ITEM",
    entityId: item.id,
    action: "CREATED",
    visibility: principal.kind === "ai_agent" ? "ADMIN_ONLY" : "USER_VISIBLE",
    metadata: { projectId: item.projectId, clientId: item.clientId, type: item.type }
  });

  return item;
}

export async function changeWorkItemStatusForLaunch(
  repository: WorkItemRepository,
  principal: Principal,
  input: { readonly workItemId: string; readonly pipelineStatusId: string }
): Promise<WorkItemRecord> {
  const items = await repository.listWorkItems();
  const existing = items.find((item) => item.id === input.workItemId);

  if (!existing) {
    throw new Error("Work item not found.");
  }

  if (!canMovePipelineStatus(principal, existing.clientId)) {
    throw new Error("Status movement is not permitted.");
  }

  const item = await repository.changeStatus(input);
  const actorId = principal.kind === "user" ? principal.user.id : principal.kind === "ai_agent" ? principal.agent.id : principal.actor.id;

  await repository.recordActivity({
    actor: principal.kind === "user" ? { type: "USER", id: actorId } : { type: "AI_AGENT", id: actorId },
    entityType: "WORK_ITEM",
    entityId: item.id,
    action: "CHANGED_STATUS",
    visibility: principal.kind === "ai_agent" ? "ADMIN_ONLY" : "USER_VISIBLE",
    metadata: {
      projectId: item.projectId,
      clientId: item.clientId,
      pipelineStatusId: item.pipelineStatusId
    }
  });

  return item;
}
