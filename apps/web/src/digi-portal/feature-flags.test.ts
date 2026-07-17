import { describe, expect, it } from "vitest";
import { digiPortalFeatureFlags, digiPortalPlatformUrl } from "./feature-flags";

describe("Digi-Portal feature flags", () => {
  it("keeps every integration capability disabled by default", () => {
    expect(digiPortalFeatureFlags({})).toEqual({
      adminBindings: false,
      agentReads: false,
      agentMutations: false,
    });
  });

  it("requires an explicit true value", () => {
    expect(
      digiPortalFeatureFlags({
        DIGI_PORTAL_ADMIN_BINDINGS_ENABLED: "true",
        DIGI_PORTAL_AGENT_READS_ENABLED: "TRUE",
        DIGI_PORTAL_AGENT_MUTATIONS_ENABLED: "1",
      }),
    ).toEqual({
      adminBindings: true,
      agentReads: true,
      agentMutations: false,
    });
  });

  it("does not invent a platform URL", () => {
    expect(digiPortalPlatformUrl({})).toBeNull();
    expect(
      digiPortalPlatformUrl({
        DIGI_PORTAL_PLATFORM_URL: " https://portal.digicolony.net ",
      }),
    ).toBe("https://portal.digicolony.net");
  });
});
