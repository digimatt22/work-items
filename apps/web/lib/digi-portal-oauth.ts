import { createHash, randomBytes } from "node:crypto";
import { DIGI_PORTAL_READ_SCOPES } from "@digicolony/shared";

export const digiPortalScopes = [...DIGI_PORTAL_READ_SCOPES];
export const hashSecret = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const randomSecret = () => randomBytes(32).toString("base64url");
export const pkceChallenge = (verifier: string) =>
  createHash("sha256").update(verifier).digest("base64url");

export function platformOrigin(request: Request): string {
  return new URL(request.url).origin;
}

export function mcpResource(request: Request): string {
  return `${platformOrigin(request)}/mcp`;
}

export function normalizeScopes(value: string | null): string[] {
  const requested = (value ?? "").split(/\s+/).filter(Boolean);
  if (
    !requested.length ||
    requested.some(
      (scope) =>
        !digiPortalScopes.includes(scope as (typeof digiPortalScopes)[number]),
    )
  ) {
    throw new Error("Invalid Digi-Portal OAuth scope.");
  }
  return [...new Set(requested)];
}

export function isAllowedRedirect(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  } catch {
    return false;
  }
}
