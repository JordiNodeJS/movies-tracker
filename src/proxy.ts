import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "./lib/jwt";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  const token = request.cookies.get("auth_token")?.value;
  const isProtected = ["/profile", "/watchlist"].some((path) =>
    request.nextUrl.pathname.includes(path)
  );

  let isAuthenticated = false;
  if (token) {
    const payload = verifyJWT(token);
    if (payload) isAuthenticated = true;
  }

  if (isProtected && !isAuthenticated) {
    const pathname = request.nextUrl.pathname;
    const locale = pathname.split("/")[1];
    const targetLocale = ["en", "es", "ca"].includes(locale) ? locale : "en";

    return NextResponse.redirect(
      new URL(`/${targetLocale}/login`, request.url)
    );
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en|es|ca)/:path*"],
};
