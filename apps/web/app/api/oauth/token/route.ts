import { prisma } from "@digicolony/db";
import {
  hashSecret,
  mcpResource,
  pkceChallenge,
  randomSecret,
} from "../../../../lib/digi-portal-oauth";

export async function POST(request: Request) {
  const form = await request.formData();
  const code = String(form.get("code") ?? "");
  const clientId = String(form.get("client_id") ?? "");
  const redirectUri = String(form.get("redirect_uri") ?? "");
  const verifier = String(form.get("code_verifier") ?? "");
  const resource = String(form.get("resource") ?? "");
  if (
    form.get("grant_type") !== "authorization_code" ||
    resource !== mcpResource(request)
  )
    return Response.json({ error: "invalid_request" }, { status: 400 });
  try {
    const accessToken = randomSecret();
    const grant = await prisma.$transaction(async (tx) => {
      const authCode = await tx.mcpAuthorizationCode.findUnique({
        where: { codeHash: hashSecret(code) },
        include: { oauthClient: true, binding: true },
      });
      if (
        !authCode ||
        authCode.usedAt ||
        authCode.expiresAt <= new Date() ||
        authCode.oauthClient.clientId !== clientId ||
        authCode.redirectUri !== redirectUri ||
        authCode.resource !== resource ||
        authCode.codeChallenge !== pkceChallenge(verifier) ||
        authCode.binding.status !== "ACTIVE"
      )
        throw new Error("invalid_grant");
      const claimed = await tx.mcpAuthorizationCode.updateMany({
        where: { id: authCode.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) throw new Error("invalid_grant");
      const scopes = Array.isArray(authCode.scopes)
        ? authCode.scopes.map(String)
        : [];
      return tx.mcpAccessGrant.create({
        data: {
          tokenHash: hashSecret(accessToken),
          oauthClientId: authCode.oauthClientId,
          bindingId: authCode.bindingId,
          userId: authCode.userId,
          agentId: `chatgpt-work:${authCode.oauthClient.clientId}`,
          scopes,
          resource,
          expiresAt: new Date(Date.now() + 60 * 60_000),
        },
      });
    });
    const scopes = Array.isArray(grant.scopes)
      ? grant.scopes.map(String).join(" ")
      : "";
    return Response.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopes,
    });
  } catch {
    return Response.json({ error: "invalid_grant" }, { status: 400 });
  }
}
