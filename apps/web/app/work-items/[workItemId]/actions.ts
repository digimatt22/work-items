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

export type UploadAssetState = {
  readonly message: string;
  readonly status: "idle" | "success" | "error";
};

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

export async function uploadAssetAction(
  _state: UploadAssetState,
  formData: FormData
): Promise<UploadAssetState> {
  const workItemId = String(formData.get("workItemId") ?? "");
  const file = formData.get("asset");

  try {
    const principal = await requirePrincipal();

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

    return {
      message: `${file.name} attached.`,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Asset upload failed.",
      status: "error"
    };
  }
}
