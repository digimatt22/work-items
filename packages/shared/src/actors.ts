export type UserRole = "ADMIN" | "CLIENT_USER";

export type ActorType = "USER" | "AI_AGENT" | "SYSTEM";

export interface ActorRef {
  readonly type: ActorType;
  readonly id: string;
  readonly displayName?: string;
}

export interface UserPrincipal {
  readonly id: string;
  readonly role: UserRole;
  readonly clientId?: string;
}

export interface AiAgentPrincipal {
  readonly id: string;
  readonly clientId?: string;
  readonly scopes: readonly McpScope[];
}

export type Principal =
  | { readonly kind: "user"; readonly user: UserPrincipal }
  | { readonly kind: "ai_agent"; readonly agent: AiAgentPrincipal }
  | { readonly kind: "system"; readonly actor: ActorRef };

import type { McpScope } from "./mcp";
