import {
  digiPortalScopes,
  mcpResource,
  platformOrigin,
} from "../../../lib/digi-portal-oauth";

export async function GET(request: Request) {
  return Response.json({
    resource: mcpResource(request),
    authorization_servers: [platformOrigin(request)],
    scopes_supported: digiPortalScopes,
    resource_documentation: `${platformOrigin(request)}/integrations/digi-portal`,
  });
}
