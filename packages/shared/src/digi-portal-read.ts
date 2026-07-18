import type {
  DigiPortalFeatureFlags,
  ProjectBindingRecord,
} from "./agent-delivery";

export const DIGI_PORTAL_READ_SCOPES = [
  "bindings:read",
  "queue:read",
  "work_items:read",
  "search:read",
] as const;

export type DigiPortalReadScope = (typeof DIGI_PORTAL_READ_SCOPES)[number];

export interface DigiPortalAccessGrant {
  readonly id: string;
  readonly agentId: string;
  readonly clientId: string;
  readonly bindingId: string;
  readonly projectId: string;
  readonly scopes: readonly string[];
  readonly resource: string;
  readonly expiresAt: Date;
  readonly revokedAt?: Date | null;
}

export interface DigiPortalWorkItem {
  readonly id: string;
  readonly dispatchId: string;
  readonly projectId: string;
  readonly type: "BUG" | "FEATURE";
  readonly title: string;
  readonly description: string;
  readonly acceptanceCriteria: string;
  readonly implementationNotes?: string | null;
  readonly priority: number;
  readonly availableAt: Date;
}

export interface DigiPortalReadRepository {
  getAccessGrant(tokenHash: string): Promise<DigiPortalAccessGrant | null>;
  getBinding(bindingId: string): Promise<ProjectBindingRecord | null>;
  listReadyWork(
    bindingId: string,
    limit: number,
  ): Promise<readonly DigiPortalWorkItem[]>;
  getReadyWork(
    bindingId: string,
    workItemId: string,
  ): Promise<DigiPortalWorkItem | null>;
  searchReadyWork(
    bindingId: string,
    query: string,
    limit: number,
  ): Promise<readonly DigiPortalWorkItem[]>;
}

export interface DigiPortalReadContext extends DigiPortalAccessGrant {
  readonly binding: ProjectBindingRecord;
}

function requireScope(
  context: DigiPortalReadContext,
  scope: DigiPortalReadScope,
): void {
  if (!context.scopes.includes(scope)) {
    throw new Error(`Digi-Portal scope required: ${scope}.`);
  }
}

export async function authorizeDigiPortalRead(
  repository: DigiPortalReadRepository,
  tokenHash: string,
  flags: DigiPortalFeatureFlags,
  expectedResource: string,
  now = new Date(),
): Promise<DigiPortalReadContext> {
  if (!flags.agentReads) {
    throw new Error("Digi-Portal agent reads are disabled.");
  }

  const grant = await repository.getAccessGrant(tokenHash);
  if (!grant || grant.revokedAt || grant.expiresAt.getTime() <= now.getTime()) {
    throw new Error("Digi-Portal access token is invalid or expired.");
  }
  if (grant.resource !== expectedResource) {
    throw new Error("Digi-Portal access token resource does not match.");
  }

  const binding = await repository.getBinding(grant.bindingId);
  if (
    !binding ||
    binding.status !== "ACTIVE" ||
    binding.projectId !== grant.projectId
  ) {
    throw new Error("Digi-Portal binding is not active or does not match.");
  }

  return { ...grant, binding };
}

export function getDigiPortalBinding(
  context: DigiPortalReadContext,
): ProjectBindingRecord {
  requireScope(context, "bindings:read");
  return context.binding;
}

export async function listDigiPortalQueue(
  repository: DigiPortalReadRepository,
  context: DigiPortalReadContext,
  limit = 20,
): Promise<readonly DigiPortalWorkItem[]> {
  requireScope(context, "queue:read");
  return repository.listReadyWork(
    context.bindingId,
    Math.min(Math.max(limit, 1), 50),
  );
}

export async function getDigiPortalWorkItem(
  repository: DigiPortalReadRepository,
  context: DigiPortalReadContext,
  workItemId: string,
): Promise<DigiPortalWorkItem | null> {
  requireScope(context, "work_items:read");
  return repository.getReadyWork(context.bindingId, workItemId.trim());
}

export async function searchDigiPortalWork(
  repository: DigiPortalReadRepository,
  context: DigiPortalReadContext,
  query: string,
  limit = 20,
): Promise<readonly DigiPortalWorkItem[]> {
  requireScope(context, "search:read");
  const normalized = query.trim();
  if (!normalized) throw new Error("Search query is required.");
  return repository.searchReadyWork(
    context.bindingId,
    normalized,
    Math.min(Math.max(limit, 1), 50),
  );
}
