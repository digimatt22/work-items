"use server";

import {
  createPrismaAgentDeliveryFoundationRepository,
  prisma,
} from "@digicolony/db";
import {
  buildDigiPortalProjectConfig,
  createPendingProjectBinding,
  type ProjectBindingEnvironment,
} from "@digicolony/shared";
import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { principalFromSession } from "../../../src/auth/principal";
import {
  digiPortalFeatureFlags,
  digiPortalPlatformUrl,
} from "../../../src/digi-portal/feature-flags";

function parseEnvironment(
  value: FormDataEntryValue | null,
): ProjectBindingEnvironment {
  const environment = String(value ?? "");

  if (!["DEVELOPMENT", "PILOT", "PRODUCTION"].includes(environment)) {
    throw new Error("Digi-Portal environment is invalid.");
  }

  return environment as ProjectBindingEnvironment;
}

export async function createPendingDigiPortalBindingAction(formData: FormData) {
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    throw new Error("Authentication required.");
  }

  const platformUrl = digiPortalPlatformUrl();

  if (!platformUrl) {
    throw new Error("DIGI_PORTAL_PLATFORM_URL is required for binding setup.");
  }

  const id = randomUUID();
  const environment = parseEnvironment(formData.get("environment"));
  const projectId = String(formData.get("projectId") ?? "");
  const repositoryRef = String(formData.get("repositoryRef") ?? "");
  const workspaceRef =
    String(formData.get("workspaceRef") ?? "").trim() || undefined;
  const config = buildDigiPortalProjectConfig({
    platformUrl,
    projectId,
    bindingId: id,
    environment,
    repositoryRef,
  });
  const configFingerprint = `sha256:${createHash("sha256")
    .update(JSON.stringify(config))
    .digest("hex")}`;
  const repository = createPrismaAgentDeliveryFoundationRepository(prisma);

  await createPendingProjectBinding(
    repository,
    principal,
    digiPortalFeatureFlags(),
    {
      id,
      projectId,
      environment,
      platformUrl,
      repositoryRef,
      workspaceRef,
      configFingerprint,
    },
  );

  revalidatePath("/integrations/digi-portal");
}
