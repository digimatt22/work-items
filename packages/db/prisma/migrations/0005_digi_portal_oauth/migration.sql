ALTER TABLE "McpOAuthClient"
  ALTER COLUMN "clientSecretHash" DROP NOT NULL,
  ADD COLUMN "redirectUris" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "tokenEndpointAuthMethod" TEXT NOT NULL DEFAULT 'none';

CREATE TABLE "McpAuthorizationCode" (
  "id" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "oauthClientId" TEXT NOT NULL,
  "bindingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "redirectUri" TEXT NOT NULL,
  "scopes" JSONB NOT NULL,
  "codeChallenge" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "McpAuthorizationCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "McpAccessGrant" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "oauthClientId" TEXT NOT NULL,
  "bindingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "scopes" JSONB NOT NULL,
  "resource" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "McpAccessGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "McpAuthorizationCode_codeHash_key" ON "McpAuthorizationCode"("codeHash");
CREATE INDEX "McpAuthorizationCode_oauthClientId_expiresAt_idx" ON "McpAuthorizationCode"("oauthClientId", "expiresAt");
CREATE INDEX "McpAuthorizationCode_bindingId_expiresAt_idx" ON "McpAuthorizationCode"("bindingId", "expiresAt");
CREATE UNIQUE INDEX "McpAccessGrant_tokenHash_key" ON "McpAccessGrant"("tokenHash");
CREATE INDEX "McpAccessGrant_bindingId_revokedAt_expiresAt_idx" ON "McpAccessGrant"("bindingId", "revokedAt", "expiresAt");
CREATE INDEX "McpAccessGrant_oauthClientId_revokedAt_idx" ON "McpAccessGrant"("oauthClientId", "revokedAt");

ALTER TABLE "McpAuthorizationCode" ADD CONSTRAINT "McpAuthorizationCode_oauthClientId_fkey" FOREIGN KEY ("oauthClientId") REFERENCES "McpOAuthClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "McpAuthorizationCode" ADD CONSTRAINT "McpAuthorizationCode_bindingId_fkey" FOREIGN KEY ("bindingId") REFERENCES "ProjectBinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "McpAuthorizationCode" ADD CONSTRAINT "McpAuthorizationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "McpAccessGrant" ADD CONSTRAINT "McpAccessGrant_oauthClientId_fkey" FOREIGN KEY ("oauthClientId") REFERENCES "McpOAuthClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "McpAccessGrant" ADD CONSTRAINT "McpAccessGrant_bindingId_fkey" FOREIGN KEY ("bindingId") REFERENCES "ProjectBinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "McpAccessGrant" ADD CONSTRAINT "McpAccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
