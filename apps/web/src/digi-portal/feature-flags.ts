import type { DigiPortalFeatureFlags } from "@digicolony/shared";

function enabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function digiPortalFeatureFlags(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): DigiPortalFeatureFlags {
  return {
    adminBindings: enabled(environment.DIGI_PORTAL_ADMIN_BINDINGS_ENABLED),
    agentReads: enabled(environment.DIGI_PORTAL_AGENT_READS_ENABLED),
    agentMutations: enabled(environment.DIGI_PORTAL_AGENT_MUTATIONS_ENABLED),
  };
}

export function digiPortalPlatformUrl(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string | null {
  const value = environment.DIGI_PORTAL_PLATFORM_URL?.trim();
  return value || null;
}
