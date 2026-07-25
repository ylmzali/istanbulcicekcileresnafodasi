import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  isMemberAuthPublicPath,
  MEMBER_SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";
import { memberLoginHref, memberReturnKeyFromPath } from "@/lib/routes";

const ADMIN_LOGIN_PATH = "/yonetim/giris";

/**
 * Next.js 16 proxy — optimistic cookie gate only.
 * Real session + role checks live in layouts / Server Actions
 * (`getAdminSession`, `getMemberSession`, `requireAdminPermission`).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/yonetim")) {
    const isLogin = pathname === ADMIN_LOGIN_PATH;

    if (isLogin) {
      return NextResponse.next();
    }

    if (!request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/uye")) {
    if (isMemberAuthPublicPath(pathname)) {
      return NextResponse.next();
    }

    if (!request.cookies.get(MEMBER_SESSION_COOKIE_NAME)?.value) {
      const returnKey = memberReturnKeyFromPath(pathname);
      return NextResponse.redirect(
        new URL(memberLoginHref(returnKey ?? undefined), request.url),
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/yonetim", "/yonetim/:path*", "/uye", "/uye/:path*"],
};
