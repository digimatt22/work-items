import type { ActivityEventDraft } from "./activity";
import type { Principal } from "./actors";
import { assetConstraints } from "./assets";

export interface DeliverableShareRecord {
  readonly id: string;
  readonly publicToken: string;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
  readonly downloadCount: number;
  readonly lastDownloadedAt: Date | null;
  readonly createdAt: Date;
}

export interface ProjectDeliverableRecord {
  readonly id: string;
  readonly projectId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly createdAt: Date;
  readonly shares: readonly DeliverableShareRecord[];
}

export interface CreateProjectDeliverableInput {
  readonly projectId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly bytes: Uint8Array;
}

export interface ProjectDeliverableRepository {
  projectExists(projectId: string): Promise<boolean>;
  createDeliverable(
    input: CreateProjectDeliverableInput,
  ): Promise<ProjectDeliverableRecord>;
  listDeliverables(
    projectId: string,
  ): Promise<readonly ProjectDeliverableRecord[]>;
  createShare(input: {
    readonly projectId: string;
    readonly assetId: string;
    readonly createdById: string;
    readonly publicToken: string;
    readonly passwordHash: string;
    readonly expiresAt: Date;
  }): Promise<DeliverableShareRecord>;
  revokeShare(input: {
    readonly projectId: string;
    readonly shareId: string;
  }): Promise<boolean>;
  recordActivity(input: ActivityEventDraft): Promise<void>;
}

function requireAdmin(principal: Principal): asserts principal is Principal & {
  kind: "user";
} {
  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    throw new Error("Admin permission required.");
  }
}

function extensionFor(filename: string): string {
  const extension = filename.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

function assertAllowedFile(input: CreateProjectDeliverableInput): void {
  const extension = extensionFor(input.filename);

  if (
    !input.filename.trim() ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > assetConstraints.maxFileSizeBytes ||
    assetConstraints.blockedExtensions.includes(extension as never) ||
    !assetConstraints.allowedExtensions.includes(extension as never)
  ) {
    throw new Error("Deliverable type or size is not allowed.");
  }
}

export async function createProjectDeliverable(
  repository: ProjectDeliverableRepository,
  principal: Principal,
  input: CreateProjectDeliverableInput,
): Promise<ProjectDeliverableRecord> {
  requireAdmin(principal);
  assertAllowedFile(input);

  if (!(await repository.projectExists(input.projectId))) {
    throw new Error("Project not found.");
  }

  const deliverable = await repository.createDeliverable({
    ...input,
    filename: input.filename.trim(),
  });

  await repository.recordActivity({
    actor: { type: "USER", id: principal.user.id },
    entityType: "ASSET",
    entityId: deliverable.id,
    action: "UPLOADED_PROJECT_DELIVERABLE",
    visibility: "ADMIN_ONLY",
    metadata: { projectId: input.projectId },
  });

  return deliverable;
}

export async function listProjectDeliverables(
  repository: ProjectDeliverableRepository,
  principal: Principal,
  projectId: string,
): Promise<readonly ProjectDeliverableRecord[]> {
  requireAdmin(principal);
  return repository.listDeliverables(projectId);
}

export async function createDeliverableShare(
  repository: ProjectDeliverableRepository,
  principal: Principal,
  input: {
    readonly projectId: string;
    readonly assetId: string;
    readonly publicToken: string;
    readonly passwordHash: string;
    readonly expiresAt: Date;
  },
): Promise<DeliverableShareRecord> {
  requireAdmin(principal);

  if (input.expiresAt.getTime() <= Date.now()) {
    throw new Error("Share expiry must be in the future.");
  }

  const share = await repository.createShare({
    ...input,
    createdById: principal.user.id,
  });

  await repository.recordActivity({
    actor: { type: "USER", id: principal.user.id },
    entityType: "DELIVERABLE_SHARE",
    entityId: share.id,
    action: "CREATED_DELIVERABLE_SHARE",
    visibility: "ADMIN_ONLY",
    metadata: {
      projectId: input.projectId,
      assetId: input.assetId,
      expiresAt: input.expiresAt.toISOString(),
    },
  });

  return share;
}

export async function revokeDeliverableShare(
  repository: ProjectDeliverableRepository,
  principal: Principal,
  input: { readonly projectId: string; readonly shareId: string },
): Promise<void> {
  requireAdmin(principal);

  if (!(await repository.revokeShare(input))) {
    throw new Error("Active share not found.");
  }

  await repository.recordActivity({
    actor: { type: "USER", id: principal.user.id },
    entityType: "DELIVERABLE_SHARE",
    entityId: input.shareId,
    action: "REVOKED_DELIVERABLE_SHARE",
    visibility: "ADMIN_ONLY",
    metadata: { projectId: input.projectId },
  });
}
