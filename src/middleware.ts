import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export default withAuth(
  function middleware(req: NextRequest) {
    if (req.method === "POST" && req.nextUrl.pathname.startsWith("/api/auth/")) {
      const ip = getClientIp(req);
      const { allowed } = rateLimit(ip, "auth-post", { maxRequests: 20, windowMs: 60_000 });
      if (!allowed) {
        return NextResponse.json(
          { message: "יותר מדי ניסיונות. נסו שוב בעוד דקה." },
          { status: 429 }
        );
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/api/auth/")) return true;
        if (req.nextUrl.pathname.startsWith("/admin/login")) return true;
        if (req.nextUrl.pathname.startsWith("/admin")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
