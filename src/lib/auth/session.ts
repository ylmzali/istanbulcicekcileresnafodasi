import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_DAYS,
  STAFF_ROLE_NAMES,
} from "@/lib/auth/constants";

export type AdminSessionUser = {
  id: string;
  username: string | null;
  email: string | null;
  roles: string[];
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiryDate() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_TTL_DAYS);
  return expires;
}

export async function createSession(userId: string, meta?: {
  ip?: string | null;
  userAgent?: string | null;
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = sessionExpiryDate();

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      ipHash: meta?.ip ? hashToken(meta.ip) : null,
      userAgent: meta?.userAgent?.slice(0, 512) ?? null,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Deduped per request — layout + page share one session lookup. */
export const getAdminSession = cache(async (): Promise<AdminSessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const user = session.user;
  if (user.deletedAt || user.status !== "active") {
    return null;
  }

  const roles = user.roles.map((item) => item.role.name);
  const isStaff = STAFF_ROLE_NAMES.some((name) => roles.includes(name));
  if (!isStaff) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles,
  };
});

export async function requireAdminSession() {
  return getAdminSession();
}
