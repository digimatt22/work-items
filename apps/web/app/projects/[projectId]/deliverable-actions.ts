"use server";

import { randomBytes } from "node:crypto";
import {
  createLocalStorageProvider,
  createPrismaProjectDeliverableRepository,
  prisma,
} from "@digicolony/db";
import {
  createDeliverableShare,
  createProjectDeliverable,
  revokeDeliverableShare,
} from "@digicolony/shared";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { generateTemporaryPassword } from "../../../src/auth/temporary-password";
import { principalFromSession } from "../../../src/auth/principal";

export type DeliverableActionState = {
  readonly status: "idle" | "success" | "error";
  readonly message: string;
};

export type ShareActionState = DeliverableActionState & {
  readonly share?: {
    readonly path: string;
    readonly password: string;
    readonly expiresAt: string;
  };
};

async function requireAdmin() {
  const principal = principalFromSession(await auth());

  if (
    !principal ||
    principal.kind !== "user" ||
    principal.user.role !== "ADMIN"
  ) {
    throw new Error("Admin permission required.");
  }

  return principal;
}

function repository() {
  return createPrismaProjectDeliverableRepository(
    prisma,
    createLocalStorageProvider(process.env.UPLOADS_DIR ?? "./uploads"),
  );
}

export async function uploadProjectDeliverableAction(
  _state: DeliverableActionState,
  formData: FormData,
): Promise<DeliverableActionState> {
  const projectId = String(formData.get("projectId") ?? "");

  try {
    const principal = await requireAdmin();
    const file = formData.get("deliverable");

    if (!(file instanceof File)) {
      throw new Error("Choose a deliverable file.");
    }

    await createProjectDeliverable(repository(), principal, {
      projectId,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      bytes: new Uint8Array(await file.arrayBuffer()),
    });

    revalidatePath(`/projects/${projectId}`);
    return { status: "success", message: `${file.name} is ready to share.` };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Deliverable upload failed.",
    };
  }
}

export async function createDeliverableShareAction(
  _state: ShareActionState,
  formData: FormData,
): Promise<ShareActionState> {
  const projectId = String(formData.get("projectId") ?? "");

  try {
    const principal = await requireAdmin();
    const assetId = String(formData.get("assetId") ?? "");
    const requestedDays = Number(formData.get("expiresInDays") ?? 14);
    const expiresInDays = [7, 14, 30].includes(requestedDays)
      ? requestedDays
      : 14;
    const password = generateTemporaryPassword();
    const publicToken = randomBytes(24).toString("base64url");
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    );

    await createDeliverableShare(repository(), principal, {
      projectId,
      assetId,
      publicToken,
      passwordHash: await hash(password, 12),
      expiresAt,
    });

    revalidatePath(`/projects/${projectId}`);
    return {
      status: "success",
      message:
        "Protected link created. Copy the password now; it cannot be shown again.",
      share: {
        path: `/deliveries/${publicToken}`,
        password,
        expiresAt: expiresAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Share creation failed.",
    };
  }
}

export async function revokeDeliverableShareAction(
  formData: FormData,
): Promise<void> {
  const principal = await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  await revokeDeliverableShare(repository(), principal, {
    projectId,
    shareId: String(formData.get("shareId") ?? ""),
  });
  revalidatePath(`/projects/${projectId}`);
}
