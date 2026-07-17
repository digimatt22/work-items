export type McpScope =
  | "system:read"
  | "system:write"
  | "clients:read"
  | "clients:write"
  | "projects:read"
  | "projects:write"
  | "work_items:read"
  | "work_items:write"
  | "work_items:status:write"
  | "comments:read"
  | "comments:write"
  | "search:read"
  | "summaries:read"
  | "summaries:write"
  | "bindings:read"
  | "queue:read"
  | "claims:write"
  | "progress:write"
  | "evidence:write";

export interface McpAuthorizationContext {
  readonly agentId: string;
  readonly clientId?: string;
  readonly bindingId?: string;
  readonly scopes: readonly McpScope[];
  readonly issuer: string;
  readonly audience: string;
}

export function hasMcpScope(
  context: McpAuthorizationContext,
  requiredScope: McpScope,
): boolean {
  return context.scopes.includes(requiredScope);
}
