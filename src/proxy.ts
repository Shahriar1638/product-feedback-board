import crypto from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const VOTER_ID_COOKIE = "voter_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // --- Issue voter_id cookie if absent ---
  if (!request.cookies.has(VOTER_ID_COOKIE)) {
    const id = crypto.randomUUID();
    response.cookies.set(VOTER_ID_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }

  // --- Rate limiting on mutation routes ---
  const { pathname } = request.nextUrl;
  const isMutation =
    pathname.startsWith("/api/feedback") && request.method !== "GET";

  if (isMutation) {
    const voterId =
      request.cookies.get(VOTER_ID_COOKIE)?.value ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    const { allowed, retryAfterMs } = checkRateLimit(
      `vote:${voterId}`,
      30, // 30 requests per window
      60 * 1000 // 1 minute window
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/feedback/:path*"],
};
