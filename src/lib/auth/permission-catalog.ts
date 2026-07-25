/**
 * Permission names follow `module.action`.
 * Shared by runtime enforcement and prisma seed (no server-only).
 */
export const PERMISSIONS = [
  "members.view",
  "members.update",
  "dues.view",
  "dues.collect",
  "content.publish",
  "applications.manage",
  "documents.manage",
  "appointments.manage",
  "support.manage",
  "audit.view",
] as const;

export type PermissionName = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<PermissionName, string> = {
  "members.view": "Üyeleri görüntüleme",
  "members.update": "Üye düzenleme",
  "dues.view": "Aidat görüntüleme",
  "dues.collect": "Aidat tahsilatı",
  "content.publish": "İçerik yayınlama",
  "applications.manage": "Başvuru yönetimi",
  "documents.manage": "Belge yönetimi",
  "appointments.manage": "Randevu yönetimi",
  "support.manage": "Destek yönetimi",
  "audit.view": "Denetim kayıtları",
};

/** Default permission matrix by role name. */
export const ROLE_PERMISSIONS: Record<string, readonly PermissionName[]> = {
  super_admin: PERMISSIONS,
  content_manager: ["content.publish"],
  member_services: [
    "members.view",
    "members.update",
    "applications.manage",
    "documents.manage",
  ],
  accounting: ["dues.view", "dues.collect", "members.view"],
  appointment_officer: ["appointments.manage", "members.view"],
  support_officer: ["support.manage", "members.view"],
  auditor: ["audit.view", "members.view", "dues.view"],
  member: [],
};

export function hasPermission(
  roles: string[],
  permission: PermissionName,
): boolean {
  if (roles.includes("super_admin")) return true;
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}
