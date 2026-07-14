export const phaseZeroReadiness = {
  sourceDocs: ["docs/dpaf", "docs/prd/launch-decisions-addendum.md", "docs/adr"],
  milestone: "Phase 0 Harness Green",
  phaseOneEntryPoint: "Database And Auth",
  aiVisibility: "ADMIN_ONLY",
  clientAccessModel: "SINGLE_CLIENT_ALL_CLIENT_PROJECTS",
  mcpAuthModel: "OAUTH_2_BEARER_TOKENS_WITH_SCOPES"
} as const;
