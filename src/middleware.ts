import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "oda_session";
const LOGIN_PATH = "/yonetim/giris";
const ADMIN_ROOT = "/yonetim";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN_PATH;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (isLogin) {
    if (hasSession) {
      return NextResponse.redirect(new URL(ADMIN_ROOT, request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/yonetim", "/yonetim/:path*"],
};
