import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // 1. Check if it's a protected route
    // We check if the path contains /profile or /watchlist
    // This covers both /profile and /en/profile
    const isProtected =
      pathname.includes("/profile") || pathname.includes("/watchlist");

    if (isProtected) {
      const token = request.cookies.get("auth_token")?.value;
      let isAuthenticated = false;

      if (token) {
        try {
          const payload = await verifyJWT(token);
          if (payload && payload.userId) {
            isAuthenticated = true;
          }
        } catch (e) {
          // If verification fails, we treat as unauthenticated
          console.error("Proxy JWT verification failed:", e);
        }
      }

      if (!isAuthenticated) {
        // Extract locale from path or default to en
        const segments = pathname.split("/");
        const locale = segments[1];
        const targetLocale = ["en", "es", "ca"].includes(locale)
          ? locale
          : "en";

        return NextResponse.redirect(
          new URL(`/${targetLocale}/login`, request.url)
        );
      }
    }

    // 2. Run intl middleware for all other cases
    return intlMiddleware(request);
  } catch (error) {
    // If anything fails, we want to avoid a 500 error at the proxy level
    console.error("Critical proxy error:", error);
    return NextResponse.next();
  }
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (static files, etc.)
  // - _vercel (Vercel specific files)
  // - all files with an extension (e.g. favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
