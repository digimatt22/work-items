import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie:
      process.env.AUTH_URL?.startsWith("https://") ??
      request.nextUrl.protocol === "https:",
  });
  if (!token?.mustChangePassword) {
    return NextResponse.next();
  }

  const passwordUrl = new URL("/settings/password", request.url);
  passwordUrl.searchParams.set("required", "1");
  return NextResponse.redirect(passwordUrl);
}

export const config = {
  matcher: [
    "/((?!api/auth|api/health|api/ready|api/deliveries|deliveries|sign-in|settings/password|_next/static|_next/image|favicon.ico).*)",
  ],
};
