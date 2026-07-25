import "server-only";

import { redirect } from "next/navigation";
import {
  hasPermission,
  type PermissionName,
} from "@/lib/auth/permission-catalog";
import { getAdminSession, type AdminSessionUser } from "@/lib/auth/session";
import { routes } from "@/lib/routes";

export {
  PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_PERMISSIONS,
  hasPermission,
  type PermissionName,
} from "@/lib/auth/permission-catalog";

export function sessionHasPermission(
  session: Pick<AdminSessionUser, "roles">,
  permission: PermissionName,
) {
  return hasPermission(session.roles, permission);
}

/**
 * Require an admin session with the given permission.
 * Missing session → login; missing permission → admin root (no 403 page yet).
 */
export async function requireAdminPermission(permission: PermissionName) {
  const session = await getAdminSession();
  if (!session) {
    redirect(routes.admin.login);
  }
  if (!sessionHasPermission(session, permission)) {
    redirect(routes.admin.root);
  }
  return session;
}
