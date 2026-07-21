CREATE TABLE "DeliverableShare" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverableShare_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeliverableShare_publicToken_key" ON "DeliverableShare"("publicToken");
CREATE INDEX "DeliverableShare_projectId_createdAt_idx" ON "DeliverableShare"("projectId", "createdAt");
CREATE INDEX "DeliverableShare_assetId_revokedAt_idx" ON "DeliverableShare"("assetId", "revokedAt");

ALTER TABLE "DeliverableShare" ADD CONSTRAINT "DeliverableShare_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliverableShare" ADD CONSTRAINT "DeliverableShare_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliverableShare" ADD CONSTRAINT "DeliverableShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
