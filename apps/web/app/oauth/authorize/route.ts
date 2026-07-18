import { prisma } from "@digicolony/db";
import { auth } from "../../../auth";
import {
  hashSecret,
  mcpResource,
  normalizeScopes,
  randomSecret,
} from "../../../lib/digi-portal-oauth";

function esc(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] ?? char,
  );
}

async function validate(request: Request, values: URLSearchParams) {
  const clientId = values.get("client_id") ?? "";
  const redirectUri = values.get("redirect_uri") ?? "";
  const resource = values.get("resource") ?? "";
  const challenge = values.get("code_challenge") ?? "";
  if (
    values.get("response_type") !== "code" ||
    values.get("code_challenge_method") !== "S256" ||
    !challenge ||
    resource !== mcpResource(request)
  )
    throw new Error("Invalid OAuth authorization request.");
  const client = await prisma.mcpOAuthClient.findUnique({
    where: { clientId },
  });
  const redirects = Array.isArray(client?.redirectUris)
    ? client.redirectUris.map(String)
    : [];
  if (!client || client.revokedAt || !redirects.includes(redirectUri))
    throw new Error("OAuth client or redirect URI is invalid.");
  return {
    client,
    redirectUri,
    resource,
    challenge,
    scopes: normalizeScopes(values.get("scope")),
    state: values.get("state") ?? "",
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user)
    return Response.redirect(
      new URL(
        `/login?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  if (session.user.role !== "ADMIN")
    return new Response("Admin permission required.", { status: 403 });
  try {
    const input = await validate(request, new URL(request.url).searchParams);
    const bindings = await prisma.projectBinding.findMany({
      where: { status: "ACTIVE", activeKey: { not: null } },
      include: { project: true },
    });
    const hidden = [...new URL(request.url).searchParams.entries()]
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${esc(key)}" value="${esc(value)}">`,
      )
      .join("");
    const options = bindings
      .map(
        (binding) =>
          `<option value="${esc(binding.id)}">${esc(binding.project.name)} (${esc(binding.repositoryRef)})</option>`,
      )
      .join("");
    return new Response(
      `<!doctype html><html><body><main><h1>Connect Digi-Portal</h1><p>${esc(input.client.name)} is requesting read-only access to administrator-qualified work.</p><form method="post">${hidden}<label>Work Items project <select name="binding_id" required>${options}</select></label><button type="submit">Authorize</button></form></main></body></html>`,
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Invalid request.",
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return new Response("Admin permission required.", { status: 403 });
  try {
    const form = await request.formData();
    const values = new URLSearchParams();
    for (const [key, value] of form.entries())
      if (typeof value === "string") values.set(key, value);
    const input = await validate(request, values);
    const bindingId = values.get("binding_id") ?? "";
    const binding = await prisma.projectBinding.findFirst({
      where: { id: bindingId, status: "ACTIVE", activeKey: { not: null } },
    });
    if (!binding) throw new Error("Active binding not found.");
    const code = randomSecret();
    await prisma.mcpAuthorizationCode.create({
      data: {
        codeHash: hashSecret(code),
        oauthClientId: input.client.id,
        bindingId,
        userId: session.user.id,
        redirectUri: input.redirectUri,
        scopes: input.scopes,
        codeChallenge: input.challenge,
        resource: input.resource,
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    const redirect = new URL(input.redirectUri);
    redirect.searchParams.set("code", code);
    if (input.state) redirect.searchParams.set("state", input.state);
    return Response.redirect(redirect);
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Invalid request.",
      { status: 400 },
    );
  }
}
