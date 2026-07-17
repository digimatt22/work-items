-- CreateEnum
CREATE TYPE "ProjectBindingKind" AS ENUM ('CODEX_WORKSPACE');

-- CreateEnum
CREATE TYPE "ProjectBindingEnvironment" AS ENUM ('DEVELOPMENT', 'PILOT', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "ProjectBindingStatus" AS ENUM ('PENDING', 'VERIFIED', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "WorkQualificationState" AS ENUM ('READY', 'REVOKED');

-- CreateEnum
CREATE TYPE "WorkSensitivity" AS ENUM ('NORMAL', 'SENSITIVE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "AgentDispatchState" AS ENUM ('QUEUED', 'CLAIMED', 'BLOCKED', 'READY_FOR_REVIEW', 'COMPLETED', 'CANCELLED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "DeliveryAttemptState" AS ENUM ('IN_PROGRESS', 'BLOCKED', 'READY_FOR_REVIEW', 'COMPLETED', 'ABANDONED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeliveryEvidenceKind" AS ENUM ('SUMMARY', 'COMMIT', 'BRANCH', 'PULL_REQUEST', 'TEST_RESULT', 'SCREENSHOT', 'DOCUMENT', 'NOTE');

-- CreateEnum
CREATE TYPE "OutboxEventState" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "ProjectBinding" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "oauthClientId" TEXT,
    "createdById" TEXT NOT NULL,
    "kind" "ProjectBindingKind" NOT NULL DEFAULT 'CODEX_WORKSPACE',
    "environment" "ProjectBindingEnvironment" NOT NULL,
    "status" "ProjectBindingStatus" NOT NULL DEFAULT 'PENDING',
    "platformUrl" TEXT NOT NULL,
    "repositoryRef" TEXT NOT NULL,
    "workspaceRef" TEXT,
    "configFingerprint" TEXT NOT NULL,
    "activeKey" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkQualification" (
    "id" TEXT NOT NULL,
    "workItemId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "state" "WorkQualificationState" NOT NULL DEFAULT 'READY',
    "acceptanceCriteria" TEXT NOT NULL,
    "implementationNotes" TEXT,
    "sensitivity" "WorkSensitivity" NOT NULL DEFAULT 'NORMAL',
    "qualifiedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "WorkQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDispatch" (
    "id" TEXT NOT NULL,
    "workItemId" TEXT NOT NULL,
    "bindingId" TEXT NOT NULL,
    "qualificationId" TEXT NOT NULL,
    "state" "AgentDispatchState" NOT NULL DEFAULT 'QUEUED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentClaim" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "leaseTokenHash" TEXT NOT NULL,
    "activeKey" TEXT,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "releaseReason" TEXT,

    CONSTRAINT "AgentClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAttempt" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "state" "DeliveryAttemptState" NOT NULL DEFAULT 'IN_PROGRESS',
    "summary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryEvidence" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "kind" "DeliveryEvidenceKind" NOT NULL,
    "label" TEXT NOT NULL,
    "uri" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "state" "OutboxEventState" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBinding_activeKey_key" ON "ProjectBinding"("activeKey");
CREATE INDEX "ProjectBinding_projectId_status_idx" ON "ProjectBinding"("projectId", "status");
CREATE INDEX "ProjectBinding_status_environment_idx" ON "ProjectBinding"("status", "environment");
CREATE UNIQUE INDEX "WorkQualification_workItemId_version_key" ON "WorkQualification"("workItemId", "version");
CREATE INDEX "WorkQualification_workItemId_state_createdAt_idx" ON "WorkQualification"("workItemId", "state", "createdAt");
CREATE UNIQUE INDEX "AgentDispatch_workItemId_key" ON "AgentDispatch"("workItemId");
CREATE UNIQUE INDEX "AgentDispatch_qualificationId_key" ON "AgentDispatch"("qualificationId");
CREATE INDEX "AgentDispatch_bindingId_state_priority_availableAt_idx" ON "AgentDispatch"("bindingId", "state", "priority", "availableAt");
CREATE UNIQUE INDEX "AgentClaim_activeKey_key" ON "AgentClaim"("activeKey");
CREATE INDEX "AgentClaim_dispatchId_releasedAt_idx" ON "AgentClaim"("dispatchId", "releasedAt");
CREATE INDEX "AgentClaim_expiresAt_releasedAt_idx" ON "AgentClaim"("expiresAt", "releasedAt");
CREATE UNIQUE INDEX "DeliveryAttempt_claimId_key" ON "DeliveryAttempt"("claimId");
CREATE UNIQUE INDEX "DeliveryAttempt_dispatchId_sequence_key" ON "DeliveryAttempt"("dispatchId", "sequence");
CREATE INDEX "DeliveryAttempt_dispatchId_state_idx" ON "DeliveryAttempt"("dispatchId", "state");
CREATE INDEX "DeliveryEvidence_attemptId_createdAt_idx" ON "DeliveryEvidence"("attemptId", "createdAt");
CREATE INDEX "OutboxEvent_state_availableAt_idx" ON "OutboxEvent"("state", "availableAt");
CREATE INDEX "OutboxEvent_aggregateType_aggregateId_createdAt_idx" ON "OutboxEvent"("aggregateType", "aggregateId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectBinding" ADD CONSTRAINT "ProjectBinding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectBinding" ADD CONSTRAINT "ProjectBinding_oauthClientId_fkey" FOREIGN KEY ("oauthClientId") REFERENCES "McpOAuthClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectBinding" ADD CONSTRAINT "ProjectBinding_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkQualification" ADD CONSTRAINT "WorkQualification_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkQualification" ADD CONSTRAINT "WorkQualification_qualifiedById_fkey" FOREIGN KEY ("qualifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentDispatch" ADD CONSTRAINT "AgentDispatch_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentDispatch" ADD CONSTRAINT "AgentDispatch_bindingId_fkey" FOREIGN KEY ("bindingId") REFERENCES "ProjectBinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentDispatch" ADD CONSTRAINT "AgentDispatch_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES "WorkQualification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentClaim" ADD CONSTRAINT "AgentClaim_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "AgentDispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "AgentDispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "AgentClaim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryEvidence" ADD CONSTRAINT "DeliveryEvidence_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "DeliveryAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
