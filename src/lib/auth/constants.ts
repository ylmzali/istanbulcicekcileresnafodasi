/** Separate cookies so admin and member sessions can coexist in one browser. */
export const ADMIN_SESSION_COOKIE_NAME = "oda_admin_session";
export const MEMBER_SESSION_COOKIE_NAME = "oda_member_session";
/** Legacy shared cookie — cleared on login/logout after split. */
export const LEGACY_SESSION_COOKIE_NAME = "oda_session";

export const SESSION_TTL_DAYS = 14;
export const SESSION_TTL_DAYS_REMEMBER = 30;

export type SessionAudience = "admin" | "member";

export function sessionCookieName(audience: SessionAudience) {
  return audience === "admin"
    ? ADMIN_SESSION_COOKIE_NAME
    : MEMBER_SESSION_COOKIE_NAME;
}

export const STAFF_ROLE_NAMES = [
  "super_admin",
  "content_manager",
  "member_services",
  "accounting",
  "appointment_officer",
  "support_officer",
  "auditor",
] as const;
export const MEMBER_ROLE_NAME = "member" as const;

export type StaffRoleName = (typeof STAFF_ROLE_NAMES)[number];
export type MemberRoleName = typeof MEMBER_ROLE_NAME;

/** Paths under /uye that do not require a member session. */
export const MEMBER_AUTH_PUBLIC_PATHS = [
  "/uye/giris",
  "/uye/sifremi-unuttum",
] as const;

export function isMemberAuthPublicPath(pathname: string) {
  if (
    (MEMBER_AUTH_PUBLIC_PATHS as readonly string[]).includes(pathname)
  ) {
    return true;
  }
  return pathname.startsWith("/uye/sifre-yenile/");
}
