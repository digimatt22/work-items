import { createPrismaDigiPortalReadRepository, prisma } from "@digicolony/db";
import {
  createDigiPortalMcpServer,
  WebStandardStreamableHTTPServerTransport,
} from "@digicolony/mcp";
import { authorizeDigiPortalRead } from "@digicolony/shared";
import {
  hashSecret,
  mcpResource,
  platformOrigin,
} from "../../lib/digi-portal-oauth";
import { digiPortalFeatureFlags } from "../../src/digi-portal/feature-flags";

function unauthorized(request: Request) {
  const metadata = `${platformOrigin(request)}/.well-known/oauth-protected-resource`;
  return Response.json(
    { error: "unauthorized" },
    {
      status: 401,
      headers: { "WWW-Authenticate": `Bearer resource_metadata="${metadata}"` },
    },
  );
}

export async function POST(request: Request) {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) return unauthorized(request);
  const repository = createPrismaDigiPortalReadRepository(prisma);
  try {
    const context = await authorizeDigiPortalRead(
      repository,
      hashSecret(match[1]),
      digiPortalFeatureFlags(),
      mcpResource(request),
    );
    const server = createDigiPortalMcpServer(repository, context);
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
    });
    await server.connect(transport);
    return await transport.handleRequest(request, {
      authInfo: {
        token: match[1],
        clientId: context.clientId,
        scopes: [...context.scopes],
        expiresAt: Math.floor(context.expiresAt.getTime() / 1000),
        resource: new URL(context.resource),
      },
    });
  } catch {
    return unauthorized(request);
  }
}

export async function GET(request: Request) {
  return unauthorized(request);
}
