import { createHash } from "node:crypto";
import {
  MEMBER_ROLE_NAME,
  STAFF_ROLE_NAMES,
} from "@/lib/auth/constants";
import { prisma } from "@/lib/db";

export type ResolvedSession = {
  userId: string;
  username: string | null;
  email: string | null;
  roles: string[];
  isStaff: boolean;
  isActiveMember: boolean;
  memberId: string | null;
  memberNo: string | null;
  displayName: string | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Validate an opaque session token against the DB (no cookie access). */
export async function resolveSessionFromToken(
  token: string | undefined | null,
): Promise<ResolvedSession | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          deletedAt: true,
          roles: {
            select: {
              role: { select: { name: true } },
            },
          },
          member: {
            select: {
              id: true,
              memberNo: true,
              status: true,
              deletedAt: true,
              profile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  const user = session.user;
  if (user.deletedAt || user.status !== "active") return null;

  const roles = user.roles.map((item) => item.role.name);
  const isStaff = STAFF_ROLE_NAMES.some((name) => roles.includes(name));
  const member = user.member;
  const isActiveMember = Boolean(
    member && !member.deletedAt && member.status === "active",
  );

  const displayName = member?.profile
    ? `${member.profile.firstName} ${member.profile.lastName}`.trim()
    : member?.memberNo ?? null;

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    roles:
      isActiveMember && !roles.includes(MEMBER_ROLE_NAME)
        ? [...roles, MEMBER_ROLE_NAME]
        : roles,
    isStaff,
    isActiveMember,
    memberId: member?.id ?? null,
    memberNo: member?.memberNo ?? null,
    displayName,
  };
}
