"use server";

import {
  createPrismaClientOperationsRepository,
  createPrismaWorkspaceRepository,
  prisma
} from "@digicolony/db";
import {
  archiveWorkspaceClient,
  archiveWorkspaceProject,
  createClientUserForLaunch,
  createWorkspaceClient,
  createWorkspaceProject
} from "@digicolony/shared";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";

function requirePrincipal() {
  return auth().then((session) => {
    const principal = principalFromSession(session);

    if (!principal) {
      throw new Error("Authentication required.");
    }

    return principal;
  });
}

async function requireAdminPrincipal() {
  const principal = await requirePrincipal();

  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    throw new Error("Admin permission required.");
  }

  return principal;
}

function parseOptionalJson(value: FormDataEntryValue | null): unknown | null {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

export async function createClientAction(formData: FormData) {
  const principal = await requirePrincipal();
  const repository = createPrismaWorkspaceRepository(prisma);

  await createWorkspaceClient(repository, principal, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "")
  });

  revalidatePath("/workspaces");
  revalidatePath("/clients");
}

export async function createProjectAction(formData: FormData) {
  const principal = await requirePrincipal();
  const repository = createPrismaWorkspaceRepository(prisma);

  await createWorkspaceProject(repository, principal, {
    clientId: String(formData.get("clientId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "")
  });

  revalidatePath("/workspaces");
  revalidatePath("/clients");
  revalidatePath(`/workspaces/${String(formData.get("clientId") ?? "")}`);
  revalidatePath(`/clients/${String(formData.get("clientId") ?? "")}`);
}

export async function createClientUserAction(formData: FormData) {
  const principal = await requirePrincipal();
  const repository = createPrismaClientOperationsRepository(prisma, {
    defaultPassword: process.env.SEED_DEFAULT_PASSWORD
  });

  await createClientUserForLaunch(repository, principal, {
    clientId: String(formData.get("clientId") ?? ""),
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? "")
  });

  revalidatePath("/workspaces");
  revalidatePath("/clients");
  revalidatePath(`/clients/${String(formData.get("clientId") ?? "")}`);
}

export async function updateClientAction(formData: FormData) {
  await requireAdminPrincipal();
  const clientId = String(formData.get("clientId") ?? "");

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      aiSummary: String(formData.get("aiSummary") ?? "").trim() || null,
      structuredContext: parseOptionalJson(formData.get("structuredContext")) as never
    }
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function updateProjectAction(formData: FormData) {
  await requireAdminPrincipal();
  const projectId = String(formData.get("projectId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  const data: {
    name: string;
    description: string | null;
    aiSummary?: string | null;
    structuredContext?: never;
  } = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null
  };

  if (formData.has("aiSummary")) {
    data.aiSummary = String(formData.get("aiSummary") ?? "").trim() || null;
  }

  if (formData.has("structuredContext")) {
    data.structuredContext = parseOptionalJson(formData.get("structuredContext")) as never;
  }

  await prisma.project.update({
    where: { id: projectId },
    data
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/projects/${projectId}`);
}

export async function updateClientUserAction(formData: FormData) {
  await requireAdminPrincipal();
  const clientId = String(formData.get("clientId") ?? "");
  const userId = String(formData.get("userId") ?? "");

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: String(formData.get("email") ?? "").toLowerCase().trim(),
      name: String(formData.get("name") ?? "").trim() || null
    }
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClientUserAction(formData: FormData) {
  await requireAdminPrincipal();
  const clientId = String(formData.get("clientId") ?? "");
  const userId = String(formData.get("userId") ?? "");

  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function archiveClientAction(formData: FormData) {
  const principal = await requirePrincipal();
  const repository = createPrismaWorkspaceRepository(prisma);
  const clientId = String(formData.get("clientId") ?? "");

  await archiveWorkspaceClient(repository, principal, clientId);
  revalidatePath("/workspaces");
  revalidatePath("/clients");
}

export async function archiveProjectAction(formData: FormData) {
  const principal = await requirePrincipal();
  const repository = createPrismaWorkspaceRepository(prisma);
  const projectId = String(formData.get("projectId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");

  await archiveWorkspaceProject(repository, principal, projectId);
  revalidatePath("/workspaces");
  revalidatePath("/clients");
  revalidatePath(`/workspaces/${clientId}`);
  revalidatePath(`/clients/${clientId}`);
}
