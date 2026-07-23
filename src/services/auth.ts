import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { STAFF_ROLE_NAMES } from "@/lib/auth/constants";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string };

export async function loginAdmin(
  input: AdminLoginInput,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<AuthResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Kullanıcı adı ve şifre gerekli." };
  }

  const { username, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ username }, { email: username }],
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user || user.status !== "active") {
    return { ok: false, message: "Kullanıcı adı veya şifre hatalı." };
  }

  const roles = user.roles.map((item) => item.role.name);
  const isStaff = STAFF_ROLE_NAMES.some((name) => roles.includes(name));
  if (!isStaff) {
    return { ok: false, message: "Bu hesap yönetim paneline erişemez." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Kullanıcı adı veya şifre hatalı." };
  }

  await createSession(user.id, meta);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { ok: true };
}

export async function logoutAdmin() {
  await destroySession();
}
