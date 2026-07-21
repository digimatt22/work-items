import type { ActorRef } from "./actors";

export type ActivityVisibility = "USER_VISIBLE" | "ADMIN_ONLY";

export type ActivityEntityType =
  | "CLIENT"
  | "PROJECT"
  | "WORK_ITEM"
  | "COMMENT"
  | "ASSET"
  | "AI_ACTION"
  | "PROJECT_BINDING"
  | "WORK_QUALIFICATION"
  | "AGENT_DISPATCH"
  | "DELIVERY_ATTEMPT"
  | "DELIVERABLE_SHARE";

export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "ARCHIVED"
  | "COMMENTED"
  | "UPLOADED_ASSET"
  | "UPLOADED_PROJECT_DELIVERABLE"
  | "CREATED_DELIVERABLE_SHARE"
  | "REVOKED_DELIVERABLE_SHARE"
  | "DOWNLOADED_PROJECT_DELIVERABLE"
  | "CHANGED_STATUS"
  | "GENERATED_SUMMARY"
  | "MCP_TOOL_CALLED"
  | "QUALIFIED_FOR_AGENT"
  | "CLAIMED"
  | "RELEASED"
  | "READY_FOR_REVIEW"
  | "REVOKED";

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
