import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const middleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  return middleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en|es|ca)/:path*"],
};
