import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { MEMBER_ROLE_NAME } from "@/lib/auth/constants";
import { prisma } from "@/lib/db";

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function ensureRole(
  name: string,
  displayName: string,
  db: DbClient = prisma,
) {
  return db.role.upsert({
    where: { name },
    update: { displayName },
    create: { name, displayName },
  });
}

export async function ensureMemberRole(userId: string, db: DbClient = prisma) {
  const role = await ensureRole(MEMBER_ROLE_NAME, "Üye", db);
  await db.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
    },
  });
  return role;
}
