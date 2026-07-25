import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  LEGACY_SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
  sessionCookieName,
  type SessionAudience,
} from "@/lib/auth/constants";
import { resolveSessionFromToken } from "@/lib/auth/resolve-session";

export type AdminSessionUser = {
  id: string;
  username: string | null;
  email: string | null;
  roles: string[];
};

export type MemberSessionUser = {
  id: string;
  memberId: string;
  memberNo: string;
  email: string | null;
  displayName: string;
  roles: string[];
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiryDate(ttlDays = SESSION_TTL_DAYS) {
  const expires = new Date();
  expires.setDate(expires.getDate() + ttlDays);
  return expires;
}

async function clearCookieAndDbSession(cookieName: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  cookieStore.delete(cookieName);
}

/** Drop legacy shared cookie so it cannot confuse proxy / logout. */
async function clearLegacySessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(LEGACY_SESSION_COOKIE_NAME)?.value;
  if (!token) return;
  await prisma.session.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME);
}

export async function createSession(
  userId: string,
  meta: {
    audience: SessionAudience;
    ip?: string | null;
    userAgent?: string | null;
    ttlDays?: number;
  },
) {
  const cookieName = sessionCookieName(meta.audience);
  await clearCookieAndDbSession(cookieName);
  await clearLegacySessionCookie();

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = sessionExpiryDate(meta.ttlDays ?? SESSION_TTL_DAYS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      ipHash: meta.ip ? hashToken(meta.ip) : null,
      userAgent: meta.userAgent?.slice(0, 512) ?? null,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function destroySession(audience: SessionAudience) {
  await clearCookieAndDbSession(sessionCookieName(audience));
  await clearLegacySessionCookie();
}

/**
 * Invalidate every DB session for a user (e.g. password reset)
 * and clear only the given audience cookie in this browser.
 */
export async function destroyUserSessions(
  userId: string,
  audience: SessionAudience,
) {
  await prisma.session.deleteMany({ where: { userId } });
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName(audience));
  await clearLegacySessionCookie();
}

/** Deduped per request — layout + page share one session lookup. */
export const getAdminSession = cache(async (): Promise<AdminSessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName("admin"))?.value;
  const resolved = await resolveSessionFromToken(token);
  if (!resolved?.isStaff) {
    return null;
  }

  return {
    id: resolved.userId,
    username: resolved.username,
    email: resolved.email,
    roles: resolved.roles,
  };
});

export async function requireAdminSession() {
  return getAdminSession();
}

export const getMemberSession = cache(async (): Promise<MemberSessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName("member"))?.value;
  const resolved = await resolveSessionFromToken(token);
  if (!resolved?.isActiveMember || !resolved.memberId || !resolved.memberNo) {
    return null;
  }

  return {
    id: resolved.userId,
    memberId: resolved.memberId,
    memberNo: resolved.memberNo,
    email: resolved.email,
    displayName: resolved.displayName || resolved.memberNo,
    roles: resolved.roles,
  };
});

export async function requireMemberSession() {
  return getMemberSession();
}
