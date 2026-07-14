import type { ActorRef } from "./actors";

export type ActivityVisibility = "USER_VISIBLE" | "ADMIN_ONLY";

export type ActivityEntityType =
  | "CLIENT"
  | "PROJECT"
  | "WORK_ITEM"
  | "COMMENT"
  | "ASSET"
  | "AI_ACTION";

export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "ARCHIVED"
  | "COMMENTED"
  | "UPLOADED_ASSET"
  | "CHANGED_STATUS"
  | "GENERATED_SUMMARY"
  | "MCP_TOOL_CALLED";

export interface ActivityEventDraft {
  readonly actor: ActorRef;
  readonly entityType: ActivityEntityType;
  readonly entityId: string;
  readonly action: ActivityAction;
  readonly visibility: ActivityVisibility;
  readonly metadata?: Record<string, unknown>;
}

export interface AiActionAuditDraft {
  readonly agentId: string;
  readonly toolName: string;
  readonly authorizationScope: readonly string[];
  readonly entityType?: ActivityEntityType;
  readonly entityId?: string;
  readonly decisionSummary?: string;
  readonly resultSummary?: string;
  readonly metadata?: Record<string, unknown>;
}
