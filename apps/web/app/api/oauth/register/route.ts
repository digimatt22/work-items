import { prisma } from "@digicolony/db";
import {
  digiPortalScopes,
  isAllowedRedirect,
  randomSecret,
} from "../../../../lib/digi-portal-oauth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    client_name?: string;
    redirect_uris?: unknown;
    token_endpoint_auth_method?: string;
  } | null;
  const redirects = Array.isArray(body?.redirect_uris)
    ? body.redirect_uris.filter(
        (value): value is string => typeof value === "string",
      )
    : [];
  if (
    !redirects.length ||
    redirects.some((uri) => !isAllowedRedirect(uri)) ||
    (body?.token_endpoint_auth_method &&
      body.token_endpoint_auth_method !== "none")
  ) {
    return Response.json({ error: "invalid_client_metadata" }, { status: 400 });
  }
  const clientId = `digi_${randomSecret()}`;
  await prisma.mcpOAuthClient.create({
    data: {
      name: body?.client_name?.trim() || "ChatGPT Work",
      clientId,
      redirectUris: redirects,
      tokenEndpointAuthMethod: "none",
      scopes: digiPortalScopes,
    },
  });
  return Response.json(
    {
      client_id: clientId,
      client_name: body?.client_name?.trim() || "ChatGPT Work",
      redirect_uris: redirects,
      token_endpoint_auth_method: "none",
    },
    { status: 201 },
  );
}
