import type { Principal, UserPermission, UserRole } from "./actors";
import { canViewClientProject } from "./permissions";

export interface ClientRecord {
  readonly id: string;
  readonly name: string;
  readonly archivedAt?: Date | null;
}

export interface ProjectRecord {
  readonly id: string;
  readonly clientId: string;
  readonly name: string;
  readonly archivedAt?: Date | null;
}

export interface ClientUserDraft {
  readonly email: string;
  readonly name?: string;
  readonly clientId: string;
  readonly permissions?: readonly UserPermission[];
  readonly role?: Extract<UserRole, "CLIENT_USER">;
}

export interface ClientUserRecord {
  readonly id: string;
  readonly email: string;
  readonly name?: string | null;
  readonly role: UserRole;
  readonly clientId?: string | null;
  readonly permissions: readonly UserPermission[];
}

export interface ClientOperationsRepository {
  createClientUser(input: Required<ClientUserDraft>): Promise<ClientUserRecord>;
  listProjects(): Promise<readonly ProjectRecord[]>;
}

export function assertAdmin(principal: Principal): void {
  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    throw new Error("Admin permission required.");
  }
}

export async function createClientUserForLaunch(
  repository: ClientOperationsRepository,
  principal: Principal,
  input: ClientUserDraft
): Promise<ClientUserRecord> {
  assertAdmin(principal);

  const normalizedEmail = input.email.toLowerCase().trim();

  if (!normalizedEmail || !input.clientId) {
    throw new Error("Client user email and clientId are required.");
  }

  return repository.createClientUser({
    email: normalizedEmail,
    name: input.name?.trim() || normalizedEmail,
    clientId: input.clientId,
    permissions: input.permissions ?? [],
    role: "CLIENT_USER"
  });
}

export async function listVisibleProjectsForLaunch(
  repository: ClientOperationsRepository,
  principal: Principal
): Promise<readonly ProjectRecord[]> {
  const projects = await repository.listProjects();

  return projects.filter(
    (project) =>
      !project.archivedAt && canViewClientProject(principal, project.clientId)
  );
}
