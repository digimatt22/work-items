import { PrismaClient } from "@prisma/client";

export * from "./collaboration-repository";
export * from "./agent-delivery-repository";
export * from "./launch-repository";
export * from "./local-storage-provider";
export * from "./work-item-repository";
export * from "./workspace-repository";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const dbPackage = {
  name: "@digicolony/db",
  prismaSchema: "packages/db/prisma/schema.prisma",
} as const;

export type { PrismaClient };
