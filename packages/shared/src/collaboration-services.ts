import type { ActivityEventDraft } from "./activity";
import type { Principal } from "./actors";
import { assetConstraints } from "./assets";
import { canViewClientProject } from "./permissions";

export interface CollaborationWorkItemRef {
  readonly id: string;
  readonly clientId: string;
  readonly projectId: string;
}

export interface CommentRecord {
  readonly id: string;
  readonly workItemId: string;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: Date;
}

export interface AssetRecord {
  readonly id: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly createdAt: Date;
}

export interface CreateAssetInput {
  readonly workItemId: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly bytes: Uint8Array;
}

export interface CollaborationRepository {
  getWorkItem(workItemId: string): Promise<CollaborationWorkItemRef | null>;
  createComment(input: { workItemId: string; authorId: string; body: string; mentions: readonly string[] }): Promise<CommentRecord>;
  listComments(workItemId: string): Promise<readonly CommentRecord[]>;
  createAsset(input: CreateAssetInput): Promise<AssetRecord>;
  listAssets(workItemId: string): Promise<readonly AssetRecord[]>;
  recordActivity(input: ActivityEventDraft): Promise<void>;
}

export function parseMentionTokens(body: string): readonly string[] {
  const tokens = new Set<string>();
  const pattern = /@([a-zA-Z0-9._-]+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    if (match[1]) {
      tokens.add(match[1].toLowerCase());
    }
  }

  return [...tokens];
}

function assertVisibleWorkItem(
  principal: Principal,
  workItem: CollaborationWorkItemRef
): void {
  if (!canViewClientProject(principal, workItem.clientId)) {
    throw new Error("Work item access is not permitted.");
  }
}

export async function createCommentForLaunch(
  repository: CollaborationRepository,
  principal: Principal,
  input: { readonly workItemId: string; readonly body: string }
): Promise<CommentRecord> {
  if (principal.kind !== "user") {
    throw new Error("User principal required.");
  }

  const workItem = await repository.getWorkItem(input.workItemId);

  if (!workItem) {
    throw new Error("Work item not found.");
  }

  assertVisibleWorkItem(principal, workItem);

  const body = input.body.trim();

  if (!body) {
    throw new Error("Comment body is required.");
  }

  const comment = await repository.createComment({
    workItemId: input.workItemId,
    authorId: principal.user.id,
    body,
    mentions: parseMentionTokens(body)
  });

  await repository.recordActivity({
    actor: { type: "USER", id: principal.user.id },
    entityType: "COMMENT",
    entityId: comment.id,
    action: "COMMENTED",
    visibility: "USER_VISIBLE",
    metadata: { workItemId: input.workItemId, projectId: workItem.projectId, clientId: workItem.clientId }
  });

  return comment;
}

export async function listVisibleComments(
  repository: CollaborationRepository,
  principal: Principal,
  workItemId: string
): Promise<readonly CommentRecord[]> {
  const workItem = await repository.getWorkItem(workItemId);

  if (!workItem) {
    return [];
  }

  assertVisibleWorkItem(principal, workItem);
  return repository.listComments(workItemId);
}

function extensionFor(filename: string): string {
  const extension = filename.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

export async function createAssetForLaunch(
  repository: CollaborationRepository,
  principal: Principal,
  input: CreateAssetInput
): Promise<AssetRecord> {
  if (principal.kind !== "user") {
    throw new Error("User principal required.");
  }

  const workItem = await repository.getWorkItem(input.workItemId);

  if (!workItem) {
    throw new Error("Work item not found.");
  }

  assertVisibleWorkItem(principal, workItem);

  const extension = extensionFor(input.filename);

  if (
    input.sizeBytes > assetConstraints.maxFileSizeBytes ||
    assetConstraints.blockedExtensions.includes(extension as never) ||
    !assetConstraints.allowedExtensions.includes(extension as never)
  ) {
    throw new Error("Asset type or size is not allowed.");
  }

  const asset = await repository.createAsset(input);

  await repository.recordActivity({
    actor: { type: "USER", id: principal.user.id },
    entityType: "ASSET",
    entityId: asset.id,
    action: "UPLOADED_ASSET",
    visibility: "USER_VISIBLE",
    metadata: { workItemId: input.workItemId, projectId: workItem.projectId, clientId: workItem.clientId }
  });

  return asset;
}

export async function listVisibleAssets(
  repository: CollaborationRepository,
  principal: Principal,
  workItemId: string
): Promise<readonly AssetRecord[]> {
  const workItem = await repository.getWorkItem(workItemId);

  if (!workItem) {
    return [];
  }

  assertVisibleWorkItem(principal, workItem);
  return repository.listAssets(workItemId);
}
