"use server";

import {
  createLocalStorageProvider,
  createPrismaCollaborationRepository,
  prisma
} from "@digicolony/db";
import { createAssetForLaunch, createCommentForLaunch } from "@digicolony/shared";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { principalFromSession } from "../../../src/auth/principal";

async function requirePrincipal() {
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
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

export async function createCommentAction(formData: FormData) {
  const principal = await requirePrincipal();
  const workItemId = String(formData.get("workItemId") ?? "");

  await createCommentForLaunch(collaborationRepository(), principal, {
    workItemId,
    body: String(formData.get("body") ?? "")
  });

  revalidatePath(`/work-items/${workItemId}`);
}

export async function uploadAssetAction(formData: FormData) {
  const principal = await requirePrincipal();
  const workItemId = String(formData.get("workItemId") ?? "");
  const file = formData.get("asset");

  if (!(file instanceof File)) {
    throw new Error("Asset file is required.");
  }

  await createAssetForLaunch(collaborationRepository(), principal, {
    workItemId,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    bytes: new Uint8Array(await file.arrayBuffer())
  });

  revalidatePath(`/work-items/${workItemId}`);
}
