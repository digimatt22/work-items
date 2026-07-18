import type { McpAuthorizationContext, McpScope } from "@digicolony/shared";
import { hasMcpScope } from "@digicolony/shared";

export * from "./digi-portal-server";
export { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

export type McpToolFamily =
  | "clients"
  | "projects"
  | "work_items"
  | "comments"
  | "search"
  | "summaries";

export interface McpToolContract {
  readonly name: string;
  readonly family: McpToolFamily;
  readonly requiredScope: McpScope;
}

export const initialMcpToolContracts: readonly McpToolContract[] = [
  { name: "clients.list", family: "clients", requiredScope: "clients:read" },
  { name: "projects.list", family: "projects", requiredScope: "projects:read" },
  {
    name: "work_items.create",
    family: "work_items",
    requiredScope: "work_items:write",
  },
  {
    name: "work_items.change_status",
    family: "work_items",
    requiredScope: "work_items:status:write",
  },
  {
    name: "comments.create",
    family: "comments",
    requiredScope: "comments:write",
  },
  { name: "search.global", family: "search", requiredScope: "search:read" },
  {
    name: "summaries.generate",
    family: "summaries",
    requiredScope: "summaries:write",
  },
];

export function assertMcpScope(
  context: McpAuthorizationContext,
  requiredScope: McpScope,
): void {
  if (!hasMcpScope(context, requiredScope)) {
    throw new Error(`MCP scope required: ${requiredScope}`);
  }
}
