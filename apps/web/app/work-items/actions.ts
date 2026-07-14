"use server";

import { createPrismaWorkItemRepository, prisma } from "@digicolony/db";
import {
  changeWorkItemStatusForLaunch,
  createWorkItemForLaunch
} from "@digicolony/shared";
import { revalidatePath } from "next/cache";
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

export async function createWorkItemAction(formData: FormData) {
  const principal = await requireUserPrincipal();
  const repository = createPrismaWorkItemRepository(prisma);
  const type = String(formData.get("type") ?? "") === "FEATURE" ? "FEATURE" : "BUG";

  const item = await createWorkItemForLaunch(repository, principal, {
    projectId: String(formData.get("projectId") ?? ""),
    type,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    reporterId: principal.user.id,
    pipelineStatusId: String(formData.get("pipelineStatusId") ?? "") || undefined,
    bugDetails:
      type === "BUG"
        ? {
            stepsToReproduce: String(formData.get("stepsToReproduce") ?? ""),
            expectedBehavior: String(formData.get("expectedBehavior") ?? ""),
            actualBehavior: String(formData.get("actualBehavior") ?? "")
          }
        : undefined,
    featureDetails:
      type === "FEATURE"
        ? {
            userStory: String(formData.get("userStory") ?? ""),
            acceptanceCriteria: String(formData.get("acceptanceCriteria") ?? ""),
            businessValue: String(formData.get("businessValue") ?? "")
          }
        : undefined
  });

  revalidatePath("/work-items");
  revalidatePath(`/projects/${item.projectId}`);
}

export async function changeWorkItemStatusAction(formData: FormData) {
  const principal = await requireUserPrincipal();
  const repository = createPrismaWorkItemRepository(prisma);

  const item = await changeWorkItemStatusForLaunch(repository, principal, {
    workItemId: String(formData.get("workItemId") ?? ""),
    pipelineStatusId: String(formData.get("pipelineStatusId") ?? "")
  });

  revalidatePath("/work-items");
  revalidatePath(`/work-items/${String(formData.get("workItemId") ?? "")}`);
  revalidatePath(`/projects/${item.projectId}`);
}
