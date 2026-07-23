export const SESSION_COOKIE_NAME = "oda_session";
export const SESSION_TTL_DAYS = 14;
export const STAFF_ROLE_NAMES = ["super_admin"] as const;

export type StaffRoleName = (typeof STAFF_ROLE_NAMES)[number];
