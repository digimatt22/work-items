"use server";

import {
  createLocalStorageProvider,
  createPrismaCollaborationRepository,
  createPrismaWorkItemRepository,
  prisma
} from "@digicolony/db";
import {
  createAssetForLaunch,
  createWorkItemForLaunch
} from "@digicolony/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";

async function requireUserPrincipal() {
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal || principal.kind !== "user") {
    throw new Error("Authentication required.");
  }

  return principal;
}

function collaborationRepository() {
  return createPrismaCollaborationRepository(
    prisma,
    createLocalStorageProvider(process.env.UPLOADS_DIR ?? "./uploads")
  );
}

function optionalText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

export async function createClientReportAction(formData: FormData) {
  const principal = await requireUserPrincipal();
  const type = String(formData.get("type") ?? "") === "FEATURE" ? "FEATURE" : "BUG";
  const workItemRepository = createPrismaWorkItemRepository(prisma);
  const item = await createWorkItemForLaunch(workItemRepository, principal, {
    projectId: optionalText(formData, "projectId"),
    type,
    title: optionalText(formData, "title"),
    description: optionalText(formData, "description"),
    reporterId: principal.user.id,
    pipelineStatusId: optionalText(formData, "pipelineStatusId") || undefined,
    bugDetails:
      type === "BUG"
        ? {
            stepsToReproduce: optionalText(formData, "stepsToReproduce"),
            expectedBehavior: optionalText(formData, "expectedBehavior"),
            actualBehavior: optionalText(formData, "actualBehavior")
          }
        : undefined,
    featureDetails:
      type === "FEATURE"
        ? {
            userStory: optionalText(formData, "userStory"),
            acceptanceCriteria: optionalText(formData, "acceptanceCriteria"),
            businessValue: optionalText(formData, "businessValue")
          }
        : undefined
  });

  const repository = collaborationRepository();
  const attachments = formData
    .getAll("attachments")
    .filter((file): file is File => file instanceof File && file.size > 0);

  for (const file of attachments) {
    await createAssetForLaunch(repository, principal, {
      workItemId: item.id,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      bytes: new Uint8Array(await file.arrayBuffer())
    });
  }

  revalidatePath("/report");
  revalidatePath("/work-items");
  revalidatePath(`/projects/${item.projectId}`);
  revalidatePath(`/work-items/${item.id}`);
  redirect(`/work-items/${item.id}`);
}
