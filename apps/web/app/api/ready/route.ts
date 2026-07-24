import { NextResponse } from "next/server";
import { checkConfiguredStorageReadiness, prisma } from "@digicolony/db";
import { dependencyReadiness } from "../../../src/readiness/dependency-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await dependencyReadiness(
    {
      database: async () => {
        await prisma.$queryRawUnsafe("SELECT 1");
      },
      storage: () => checkConfiguredStorageReadiness(),
    },
    2_000,
    (failure) => {
      console.error("Dependency readiness failed.", failure);
    },
  );

  return NextResponse.json(readiness, {
    status: readiness.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
