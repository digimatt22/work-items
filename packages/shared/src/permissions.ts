import type { AiAgentPrincipal, Principal, UserPrincipal } from "./actors";

function isAdmin(user: UserPrincipal): boolean {
  return user.role === "ADMIN";
}

function userBelongsToClient(user: UserPrincipal, clientId: string): boolean {
  return user.clientId === clientId;
}

function agentHasClientAccess(agent: AiAgentPrincipal, clientId: string): boolean {
  return agent.clientId === undefined || agent.clientId === clientId;
}

export function canViewClientProject(principal: Principal, clientId: string): boolean {
  if (principal.kind === "user") {
    return isAdmin(principal.user) || userBelongsToClient(principal.user, clientId);
  }

  if (principal.kind === "ai_agent") {
    return (
      agentHasClientAccess(principal.agent, clientId) &&
      principal.agent.scopes.includes("projects:read")
    );
  }

  return false;
}

export function canCreateWorkItem(principal: Principal, clientId: string): boolean {
  if (principal.kind === "user") {
    return isAdmin(principal.user) || userBelongsToClient(principal.user, clientId);
  }

  if (principal.kind === "ai_agent") {
    return (
      agentHasClientAccess(principal.agent, clientId) &&
      principal.agent.scopes.includes("work_items:write")
    );
  }

  return false;
}

export function canMovePipelineStatus(principal: Principal, clientId: string): boolean {
  if (principal.kind === "user") {
    return isAdmin(principal.user);
  }

  if (principal.kind === "ai_agent") {
    return (
      agentHasClientAccess(principal.agent, clientId) &&
      principal.agent.scopes.includes("work_items:status:write")
    );
  }

  return false;
}

export function canViewAiActivity(principal: Principal): boolean {
  return principal.kind === "user" && isAdmin(principal.user);
}
