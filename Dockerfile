# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/mcp/package.json packages/mcp/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN pnpm install --frozen-lockfile

FROM dependencies AS builder

COPY . .

ARG NEXT_DEPLOYMENT_ID
ENV NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID

# The stable Server Action key is mounted only for the build and is never copied
# into an image layer. Local builds can omit the Sheldon secret file.
RUN --mount=type=secret,id=sheldon_app_env,required=false \
  if [ -f /run/secrets/sheldon_app_env ]; then \
    action_key="$(sed -n 's/^NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=//p' /run/secrets/sheldon_app_env | head -n 1)"; \
    if [ -n "$action_key" ]; then export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$action_key"; fi; \
  fi; \
  pnpm test \
  && DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
  AUTH_SECRET=container-build-placeholder-not-used-at-runtime \
  pnpm prisma:generate \
  && DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
  AUTH_SECRET=container-build-placeholder-not-used-at-runtime \
  pnpm --filter @digicolony/web build \
  && mkdir -p /app/prisma-engines \
  && cp /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/libquery_engine-*.so.node /app/prisma-engines/

FROM postgres:17-bookworm AS runner

COPY --from=base /usr/local /usr/local

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /app/uploads \
  && chown nextjs:nodejs /app/uploads

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma-engines /tmp/prisma-engines
COPY --from=builder --chown=nextjs:nodejs /app/scripts/sheldon-hooks /app/hooks

USER nextjs

EXPOSE 3000

ENTRYPOINT []
CMD ["node", "apps/web/server.js"]
