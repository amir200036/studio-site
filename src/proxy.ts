import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { securityLog } from "@/lib/security-log";

/**
 * שומר על /admin/* ומגביל ניסיונות התחברות.
 * זה לא השומר היחיד: כל נתיב /api/admin/* בודק את הסשן בעצמו.
 */
const authorizedProxy = withAuth(
  function authorizedRequest(req) {
    if (req.method === "POST" && req.nextUrl.pathname.startsWith("/api/auth/")) {
      const ip = getClientIp(req);
      const { allowed } = rateLimit(ip, "auth-post", { maxRequests: 20, windowMs: 60_000 });
      if (!allowed) {
        securityLog("admin_login_rate_limited", {
          route: req.nextUrl.pathname,
          method: req.method,
          status: 429,
          ip,
        });
        return NextResponse.json(
          { message: "יותר מדי ניסיונות. נסו שוב בעוד דקה." },
          { status: 429 }
        );
      }
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/admin/login" },
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/api/auth/")) return true;
        if (req.nextUrl.pathname.startsWith("/admin/login")) return true;
        if (req.nextUrl.pathname.startsWith("/admin")) return Boolean(token);
        return true;
      },
    },
  }
);

export default async function proxy(req: NextRequest, event: NextFetchEvent): Promise<Response> {
  try {
    return (await authorizedProxy(req as NextRequestWithAuth, event)) ?? NextResponse.next();
  } catch {
    // עוגיית סשן פגומה או מזויפת — לא מפילים את הבקשה, שולחים להתחברות מחדש
    securityLog("authorization_rejected", {
      route: req.nextUrl.pathname,
      method: req.method,
      status: 401,
      category: "malformed_authorization",
      ip: getClientIp(req),
    });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
