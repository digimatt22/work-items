import type { ActivityEventDraft } from "./activity";
import type { Principal } from "./actors";
import { canViewAiActivity, canViewClientProject } from "./permissions";

export interface WorkspaceClientRecord {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly archivedAt?: Date | null;
}

export interface WorkspaceProjectRecord {
  readonly id: string;
  readonly clientId: string;
  readonly clientName?: string;
  readonly name: string;
  readonly description?: string | null;
  readonly archivedAt?: Date | null;
}

export interface WorkspaceActivityRecord {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly visibility: "USER_VISIBLE" | "ADMIN_ONLY";
  readonly createdAt: Date;
}

export interface CreateClientInput {
  readonly name: string;
  readonly description?: string;
}

export interface CreateProjectInput {
  readonly clientId: string;
  readonly name: string;
  readonly description?: string;
}

export interface WorkspaceRepository {
  listClients(): Promise<readonly WorkspaceClientRecord[]>;
  getClient(clientId: string): Promise<WorkspaceClientRecord | null>;
  createClient(input: CreateClientInput): Promise<WorkspaceClientRecord>;
  archiveClient(clientId: string, actorId: string): Promise<WorkspaceClientRecord>;
  listProjects(): Promise<readonly WorkspaceProjectRecord[]>;
  listProjectsForClient(clientId: string): Promise<readonly WorkspaceProjectRecord[]>;
  createProject(input: CreateProjectInput): Promise<WorkspaceProjectRecord>;
  archiveProject(projectId: string, actorId: string): Promise<WorkspaceProjectRecord>;
  listActivityForClient(clientId: string): Promise<readonly WorkspaceActivityRecord[]>;
  recordActivity(input: ActivityEventDraft): Promise<void>;
}

function assertAdminPrincipal(principal: Principal): string {
  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    throw new Error("Admin permission required.");
  }

  return principal.user.id;
}

function normalizeName(value: string, label: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

export async function listWorkspaceClients(
  repository: WorkspaceRepository,
  principal: Principal
): Promise<readonly WorkspaceClientRecord[]> {
  if (principal.kind === "user" && principal.user.role === "ADMIN") {
    return (await repository.listClients()).filter((client) => !client.archivedAt);
  }

  if (principal.kind === "user" && principal.user.clientId) {
    const client = await repository.getClient(principal.user.clientId);
    return client && !client.archivedAt ? [client] : [];
  }

  return [];
}

export async function createWorkspaceClient(
  repository: WorkspaceRepository,
  principal: Principal,
  input: CreateClientInput
): Promise<WorkspaceClientRecord> {
  const actorId = assertAdminPrincipal(principal);
  const client = await repository.createClient({
    name: normalizeName(input.name, "Client name"),
    description: input.description?.trim()
  });

  await repository.recordActivity({
    actor: { type: "USER", id: actorId },
    entityType: "CLIENT",
    entityId: client.id,
    action: "CREATED",
    visibility: "USER_VISIBLE"
  });

  return client;
}

export async function createWorkspaceProject(
  repository: WorkspaceRepository,
  principal: Principal,
  input: CreateProjectInput
): Promise<WorkspaceProjectRecord> {
  const actorId = assertAdminPrincipal(principal);
  const project = await repository.createProject({
    clientId: input.clientId,
    name: normalizeName(input.name, "Project name"),
    description: input.description?.trim()
  });

  await repository.recordActivity({
    actor: { type: "USER", id: actorId },
    entityType: "PROJECT",
    entityId: project.id,
    action: "CREATED",
    visibility: "USER_VISIBLE",
    metadata: { clientId: input.clientId }
  });

  return project;
}

export async function listVisibleWorkspaceProjects(
  repository: WorkspaceRepository,
  principal: Principal
): Promise<readonly WorkspaceProjectRecord[]> {
  const projects = await repository.listProjects();

  return projects.filter(
    (project) =>
      !project.archivedAt && canViewClientProject(principal, project.clientId)
  );
}

export async function archiveWorkspaceClient(
  repository: WorkspaceRepository,
  principal: Principal,
  clientId: string
): Promise<WorkspaceClientRecord> {
  const actorId = assertAdminPrincipal(principal);
  const client = await repository.archiveClient(clientId, actorId);

  await repository.recordActivity({
    actor: { type: "USER", id: actorId },
    entityType: "CLIENT",
    entityId: client.id,
    action: "ARCHIVED",
    visibility: "USER_VISIBLE"
  });

  return client;
}

export async function archiveWorkspaceProject(
  repository: WorkspaceRepository,
  principal: Principal,
  projectId: string
): Promise<WorkspaceProjectRecord> {
  const actorId = assertAdminPrincipal(principal);
  const project = await repository.archiveProject(projectId, actorId);

  await repository.recordActivity({
    actor: { type: "USER", id: actorId },
    entityType: "PROJECT",
    entityId: project.id,
    action: "ARCHIVED",
    visibility: "USER_VISIBLE",
    metadata: { clientId: project.clientId }
  });

  return project;
}

export async function listVisibleClientActivity(
  repository: WorkspaceRepository,
  principal: Principal,
  clientId: string
): Promise<readonly WorkspaceActivityRecord[]> {
  if (!canViewClientProject(principal, clientId)) {
    return [];
  }

  const canSeeAdminOnly = canViewAiActivity(principal);
  const activity = await repository.listActivityForClient(clientId);

  return activity.filter(
    (event) => event.visibility === "USER_VISIBLE" || canSeeAdminOnly
  );
}
