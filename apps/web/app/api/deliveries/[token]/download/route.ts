import {
  createConfiguredStorageProvider,
  getPublicDeliverableShare,
  prisma,
  recordDeliverableDownload,
  recordFailedDeliverablePassword,
} from "@digicolony/db";
import { compare } from "bcryptjs";
import type { NextRequest } from "next/server";
import { deliveryFailureUrl } from "../../../../../src/deliveries/redirect";

function backToDelivery(request: NextRequest, token: string): Response {
  return Response.redirect(
    deliveryFailureUrl(
      token,
      process.env.AUTH_URL ?? new URL(request.url).origin,
    ),
    303,
  );
}

function contentDisposition(filename: string): string {
  const fallback = filename
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/[\r\n"]/g, "_");
  return `attachment; filename="${fallback || "deliverable"}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const share = await getPublicDeliverableShare(prisma, token);
  const now = new Date();

  if (
    !share ||
    share.revokedAt ||
    share.expiresAt <= now ||
    (share.lockedUntil && share.lockedUntil > now)
  ) {
    return backToDelivery(request, token);
  }

  const formData = await request.formData();
  const valid = await compare(
    String(formData.get("password") ?? ""),
    share.passwordHash,
  );

  if (!valid) {
    await recordFailedDeliverablePassword(prisma, share, now);
    return backToDelivery(request, token);
  }

  const storage = createConfiguredStorageProvider(share.asset.provider);
  const bytes = await storage.getObject({ objectKey: share.asset.objectKey });
  await recordDeliverableDownload(prisma, share.id, now);

  return new Response(Buffer.from(bytes), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": contentDisposition(share.asset.filename),
      "Content-Length": String(bytes.byteLength),
      "Content-Type": share.asset.contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
