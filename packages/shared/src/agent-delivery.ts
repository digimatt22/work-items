import type { Principal } from "./actors";

export const DIGI_PORTAL_PLUGIN_ID = "digi-portal" as const;
export const DIGI_PORTAL_CONFIG_SCHEMA_VERSION = 1 as const;

export type ProjectBindingEnvironment = "DEVELOPMENT" | "PILOT" | "PRODUCTION";
export type ProjectBindingStatus =
  | "PENDING"
  | "VERIFIED"
  | "ACTIVE"
  | "REVOKED";
export type WorkSensitivity = "NORMAL" | "SENSITIVE" | "RESTRICTED";
export type AgentDispatchState =
  | "QUEUED"
  | "CLAIMED"
  | "BLOCKED"
  | "READY_FOR_REVIEW"
  | "COMPLETED"
  | "CANCELLED"
  | "QUARANTINED";

export interface DigiPortalProjectConfig {
  readonly schemaVersion: typeof DIGI_PORTAL_CONFIG_SCHEMA_VERSION;
  readonly plugin: typeof DIGI_PORTAL_PLUGIN_ID;
  readonly platformUrl: string;
  readonly projectId: string;
  readonly bindingId: string;
  readonly environment: ProjectBindingEnvironment;
  readonly repositoryRef: string;
}

export interface DigiPortalFeatureFlags {
  readonly adminBindings: boolean;
  readonly agentReads: boolean;
  readonly agentMutations: boolean;
}

export interface AgentDeliveryProjectRecord {
  readonly id: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly name: string;
  readonly archivedAt?: Date | null;
}

export interface ProjectBindingRecord {
  readonly id: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly clientName: string;
  readonly environment: ProjectBindingEnvironment;
  readonly status: ProjectBindingStatus;
  readonly platformUrl: string;
  readonly repositoryRef: string;
  readonly workspaceRef?: string | null;
  readonly configFingerprint: string;
  readonly createdAt: Date;
  readonly verifiedAt?: Date | null;
  readonly activatedAt?: Date | null;
  readonly revokedAt?: Date | null;
}

export interface AgentDispatchRecord {
  readonly id: string;
  readonly workItemId: string;
  readonly clientId: string;
  readonly projectId: string;
  readonly bindingId: string;
  readonly state: AgentDispatchState;
  readonly version: number;
}

export interface WorkQualificationRecord {
  readonly id: string;
  readonly workItemId: string;
  readonly version: number;
  readonly acceptanceCriteria: string;
  readonly implementationNotes?: string | null;
  readonly sensitivity: WorkSensitivity;
  readonly createdAt: Date;
}

export interface AgentClaimRecord {
  readonly id: string;
  readonly dispatchId: string;
  readonly agentId: string;
  readonly expiresAt: Date;
  readonly attemptId: string;
  readonly attemptSequence: number;
}

export interface AgentDeliveryFoundationRepository {
  listProjects(): Promise<readonly AgentDeliveryProjectRecord[]>;
  listBindings(): Promise<readonly ProjectBindingRecord[]>;
  getDispatch(dispatchId: string): Promise<AgentDispatchRecord | null>;
  createPendingBindingWithAudit(input: {
    readonly id: string;
    readonly projectId: string;
    readonly createdById: string;
    readonly environment: ProjectBindingEnvironment;
    readonly platformUrl: string;
    readonly repositoryRef: string;
    readonly workspaceRef?: string;
    readonly configFingerprint: string;
  }): Promise<ProjectBindingRecord>;
  markWorkItemReadyWithAudit(input: {
    readonly workItemId: string;
    readonly qualifiedById: string;
    readonly acceptanceCriteria: string;
    readonly implementationNotes?: string;
    readonly sensitivity: WorkSensitivity;
    readonly priority: number;
  }): Promise<WorkQualificationRecord>;
  claimDispatchWithAudit(input: {
    readonly dispatchId: string;
    readonly agentId: string;
    readonly leaseTokenHash: string;
    readonly expiresAt: Date;
    readonly authorizationScope: readonly string[];
  }): Promise<AgentClaimRecord>;
}

const bindingTransitions: Readonly<
  Record<ProjectBindingStatus, readonly ProjectBindingStatus[]>
> = {
  PENDING: ["VERIFIED", "REVOKED"],
  VERIFIED: ["ACTIVE", "REVOKED"],
  ACTIVE: ["REVOKED"],
  REVOKED: [],
};

const dispatchTransitions: Readonly<
  Record<AgentDispatchState, readonly AgentDispatchState[]>
> = {
  QUEUED: ["CLAIMED", "CANCELLED", "QUARANTINED"],
  CLAIMED: ["QUEUED", "BLOCKED", "READY_FOR_REVIEW", "QUARANTINED"],
  BLOCKED: ["QUEUED", "CANCELLED", "QUARANTINED"],
  READY_FOR_REVIEW: ["CLAIMED", "COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  QUARANTINED: ["QUEUED", "CANCELLED"],
};

function normalizeRequired(value: string, label: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function requireAdmin(principal: Principal): string {
  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    throw new Error("Admin permission required.");
  }

  return principal.user.id;
}

function parseUrl(value: string): string {
  const normalized = normalizeRequired(value, "Platform URL");
  const parsed = new URL(normalized);

  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    throw new Error("Platform URL must use HTTPS outside local development.");
  }

  return parsed.toString().replace(/\/$/, "");
}

export function buildDigiPortalProjectConfig(input: {
  readonly platformUrl: string;
  readonly projectId: string;
  readonly bindingId: string;
  readonly environment: ProjectBindingEnvironment;
  readonly repositoryRef: string;
}): DigiPortalProjectConfig {
  return {
    schemaVersion: DIGI_PORTAL_CONFIG_SCHEMA_VERSION,
    plugin: DIGI_PORTAL_PLUGIN_ID,
    platformUrl: parseUrl(input.platformUrl),
    projectId: normalizeRequired(input.projectId, "Project ID"),
    bindingId: normalizeRequired(input.bindingId, "Binding ID"),
    environment: input.environment,
    repositoryRef: normalizeRequired(
      input.repositoryRef,
      "Repository reference",
    ),
  };
}

export function parseDigiPortalProjectConfig(
  value: unknown,
): DigiPortalProjectConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Digi-Portal project config must be an object.");
  }

  const record = value as Record<string, unknown>;
  const allowedKeys = new Set([
    "schemaVersion",
    "plugin",
    "platformUrl",
    "projectId",
    "bindingId",
    "environment",
    "repositoryRef",
  ]);
  const unexpected = Object.keys(record).find((key) => !allowedKeys.has(key));

  if (unexpected) {
    throw new Error(
      `Digi-Portal project config contains unsupported field: ${unexpected}.`,
    );
  }

  if (record.schemaVersion !== DIGI_PORTAL_CONFIG_SCHEMA_VERSION) {
    throw new Error("Unsupported Digi-Portal config schema version.");
  }

  if (record.plugin !== DIGI_PORTAL_PLUGIN_ID) {
    throw new Error("Digi-Portal plugin identity does not match.");
  }

  if (
    !["DEVELOPMENT", "PILOT", "PRODUCTION"].includes(String(record.environment))
  ) {
    throw new Error("Digi-Portal environment is invalid.");
  }

  return buildDigiPortalProjectConfig({
    platformUrl: String(record.platformUrl ?? ""),
    projectId: String(record.projectId ?? ""),
    bindingId: String(record.bindingId ?? ""),
    environment: record.environment as ProjectBindingEnvironment,
    repositoryRef: String(record.repositoryRef ?? ""),
  });
}

export function assertProjectBindingTransition(
  from: ProjectBindingStatus,
  to: ProjectBindingStatus,
): void {
  if (!bindingTransitions[from].includes(to)) {
    throw new Error(
      `Project binding transition ${from} -> ${to} is not allowed.`,
    );
  }
}

export function assertAgentDispatchTransition(
  from: AgentDispatchState,
  to: AgentDispatchState,
): void {
  if (!dispatchTransitions[from].includes(to)) {
    throw new Error(
      `Agent dispatch transition ${from} -> ${to} is not allowed.`,
    );
  }
}

export async function createPendingProjectBinding(
  repository: AgentDeliveryFoundationRepository,
  principal: Principal,
  flags: DigiPortalFeatureFlags,
  input: {
    readonly id: string;
    readonly projectId: string;
    readonly environment: ProjectBindingEnvironment;
    readonly platformUrl: string;
    readonly repositoryRef: string;
    readonly workspaceRef?: string;
    readonly configFingerprint: string;
  },
): Promise<ProjectBindingRecord> {
  const createdById = requireAdmin(principal);

  if (!flags.adminBindings) {
    throw new Error("Digi-Portal admin binding setup is disabled.");
  }

  const projects = await repository.listProjects();
  const project = projects.find(
    (candidate) => candidate.id === input.projectId,
  );

  if (!project || project.archivedAt) {
    throw new Error("Active project not found.");
  }

  const config = buildDigiPortalProjectConfig({
    platformUrl: input.platformUrl,
    projectId: input.projectId,
    bindingId: input.id,
    environment: input.environment,
    repositoryRef: input.repositoryRef,
  });

  return repository.createPendingBindingWithAudit({
    ...input,
    createdById,
    platformUrl: config.platformUrl,
    projectId: config.projectId,
    repositoryRef: config.repositoryRef,
    workspaceRef: input.workspaceRef?.trim() || undefined,
  });
}

export async function markWorkItemAgentReady(
  repository: AgentDeliveryFoundationRepository,
  principal: Principal,
  input: {
    readonly workItemId: string;
    readonly acceptanceCriteria: string;
    readonly implementationNotes?: string;
    readonly sensitivity: WorkSensitivity;
    readonly priority?: number;
  },
): Promise<WorkQualificationRecord> {
  const qualifiedById = requireAdmin(principal);

  return repository.markWorkItemReadyWithAudit({
    workItemId: normalizeRequired(input.workItemId, "Work item ID"),
    qualifiedById,
    acceptanceCriteria: normalizeRequired(
      input.acceptanceCriteria,
      "Acceptance criteria",
    ),
    implementationNotes: input.implementationNotes?.trim() || undefined,
    sensitivity: input.sensitivity,
    priority: input.priority ?? 0,
  });
}

export async function claimAgentDispatch(
  repository: AgentDeliveryFoundationRepository,
  principal: Principal,
  flags: DigiPortalFeatureFlags,
  input: {
    readonly dispatchId: string;
    readonly leaseTokenHash: string;
    readonly expiresAt: Date;
  },
): Promise<AgentClaimRecord> {
  if (!flags.agentMutations) {
    throw new Error("Digi-Portal agent mutations are disabled.");
  }

  if (
    principal.kind !== "ai_agent" ||
    !principal.agent.scopes.includes("claims:write")
  ) {
    throw new Error("Agent claim permission required.");
  }

  const dispatch = await repository.getDispatch(input.dispatchId);

  if (!dispatch || dispatch.state !== "QUEUED") {
    throw new Error("Agent dispatch is not claimable.");
  }

  if (principal.agent.bindingId !== dispatch.bindingId) {
    throw new Error("Agent binding does not match the dispatch.");
  }

  if (
    principal.agent.clientId &&
    principal.agent.clientId !== dispatch.clientId
  ) {
    throw new Error("Agent client scope does not match the dispatch.");
  }

  if (input.expiresAt.getTime() <= Date.now()) {
    throw new Error("Claim expiry must be in the future.");
  }

  return repository.claimDispatchWithAudit({
    dispatchId: dispatch.id,
    agentId: principal.agent.id,
    leaseTokenHash: normalizeRequired(input.leaseTokenHash, "Lease token hash"),
    expiresAt: input.expiresAt,
    authorizationScope: principal.agent.scopes,
  });
}
