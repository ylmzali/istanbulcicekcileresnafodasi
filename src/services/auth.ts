import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import {
  hashIdentifierForAudit,
  writeAuditLog,
} from "@/lib/auth/audit";
import {
  SESSION_TTL_DAYS,
  SESSION_TTL_DAYS_REMEMBER,
  STAFF_ROLE_NAMES,
} from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { ensureMemberRole } from "@/lib/auth/roles";
import {
  createSession,
  destroySession,
  destroyUserSessions,
} from "@/lib/auth/session";
import {
  decryptField,
  hashIdentityForLookup,
} from "@/lib/crypto/field-encryption";
import { prisma } from "@/lib/db";
import { normalizeIdentityNo, isValidIdentityNo } from "@/lib/tr-identity";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const memberLoginSchema = z.object({
  identifier: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(200),
  rememberMe: z.boolean().optional(),
});

export type MemberLoginInput = z.infer<typeof memberLoginSchema>;

export const memberForgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1).max(40),
});

export const memberResetPasswordSchema = z.object({
  token: z.string().trim().min(20).max(200),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .max(200),
});

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string };

export type ForgotPasswordResult =
  | { ok: true; message: string; devResetUrl?: string }
  | { ok: false; message: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeMemberIdentifier(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && isValidIdentityNo(digits)) {
    return { kind: "identity" as const, value: normalizeIdentityNo(digits) };
  }
  return {
    kind: "memberNo" as const,
    value: trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
  };
}

async function findMemberUserByIdentifier(identifier: string) {
  const parsed = normalizeMemberIdentifier(identifier);
  if (!parsed.value) return null;

  if (parsed.kind === "identity") {
    const identityHash = hashIdentityForLookup(parsed.value);
    if (!identityHash) return null;

    return prisma.member.findFirst({
      where: {
        deletedAt: null,
        identityNoHash: identityHash,
      },
      include: {
        user: true,
        profile: { select: { firstName: true, lastName: true } },
      },
    });
  }

  return prisma.member.findFirst({
    where: {
      deletedAt: null,
      memberNo: parsed.value,
    },
    include: {
      user: true,
      profile: { select: { firstName: true, lastName: true } },
    },
  });
}

async function maybeBackfillIdentityHash(member: {
  id: string;
  identityNoEnc: string | null;
  identityNoHash: string | null;
}) {
  if (member.identityNoHash || !member.identityNoEnc) return;
  const plain = decryptField(member.identityNoEnc);
  const hash = plain ? hashIdentityForLookup(plain) : null;
  if (!hash) return;
  await prisma.member.update({
    where: { id: member.id },
    data: { identityNoHash: hash },
  });
}

export async function loginAdmin(
  input: AdminLoginInput,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<AuthResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Kullanıcı adı ve şifre gerekli." };
  }

  const identifierHash = hashIdentifierForAudit(parsed.data.username);
  const auditMeta = {
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  };

  const rate = consumeRateLimit({
    key: `admin-login:${meta?.ip ?? "unknown"}:${parsed.data.username.toLowerCase()}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.ok) {
    await writeAuditLog({
      action: "auth.login_rate_limited",
      entityType: "user",
      after: { audience: "admin", identifierHash },
      ...auditMeta,
    });
    return {
      ok: false,
      message: `Çok fazla deneme. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
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

  const fail = async (reason: string, message: string): Promise<AuthResult> => {
    await writeAuditLog({
      actorId: user?.id ?? null,
      action: "auth.login_failed",
      entityType: "user",
      entityId: user?.id ?? null,
      after: { audience: "admin", identifierHash, reason },
      ...auditMeta,
    });
    return { ok: false, message };
  };

  if (!user || user.status !== "active") {
    return fail("invalid_credentials", "Kullanıcı adı veya şifre hatalı.");
  }

  const roles = user.roles.map((item) => item.role.name);
  const isStaff = STAFF_ROLE_NAMES.some((name) => roles.includes(name));
  if (!isStaff) {
    return fail("not_staff", "Bu hesap yönetim paneline erişemez.");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return fail("invalid_credentials", "Kullanıcı adı veya şifre hatalı.");
  }

  await createSession(user.id, { ...meta, audience: "admin" });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "auth.login_success",
    entityType: "user",
    entityId: user.id,
    after: { audience: "admin" },
    ...auditMeta,
  });

  return { ok: true };
}

export async function logoutAdmin() {
  await destroySession("admin");
}

export async function loginMember(
  input: MemberLoginInput,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<AuthResult> {
  const parsed = memberLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Üye no / T.C. kimlik ve şifre gerekli." };
  }

  const identifierHash = hashIdentifierForAudit(parsed.data.identifier);
  const auditMeta = {
    ip: meta?.ip,
    userAgent: meta?.userAgent,
  };

  const rate = consumeRateLimit({
    key: `member-login:${meta?.ip ?? "unknown"}:${parsed.data.identifier.toLowerCase()}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.ok) {
    await writeAuditLog({
      action: "auth.login_rate_limited",
      entityType: "member",
      after: { audience: "member", identifierHash },
      ...auditMeta,
    });
    return {
      ok: false,
      message: `Çok fazla deneme. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const member = await findMemberUserByIdentifier(parsed.data.identifier);

  const fail = async (
    reason: string,
    message: string,
  ): Promise<AuthResult> => {
    await writeAuditLog({
      actorId: member?.userId ?? null,
      action: "auth.login_failed",
      entityType: "member",
      entityId: member?.id ?? null,
      after: { audience: "member", identifierHash, reason },
      ...auditMeta,
    });
    return { ok: false, message };
  };

  if (!member || member.user.deletedAt || member.user.status !== "active") {
    return fail("invalid_credentials", "Üye no / T.C. kimlik veya şifre hatalı.");
  }

  if (member.status !== "active") {
    return fail(
      "member_inactive",
      "Üyelik durumunuz giriş için uygun değil. Oda ile iletişime geçin.",
    );
  }

  const valid = await verifyPassword(
    parsed.data.password,
    member.user.passwordHash,
  );
  if (!valid) {
    return fail("invalid_credentials", "Üye no / T.C. kimlik veya şifre hatalı.");
  }

  await ensureMemberRole(member.userId);
  await maybeBackfillIdentityHash(member);

  await createSession(member.userId, {
    ...meta,
    audience: "member",
    ttlDays: parsed.data.rememberMe
      ? SESSION_TTL_DAYS_REMEMBER
      : SESSION_TTL_DAYS,
  });
  await prisma.user.update({
    where: { id: member.userId },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({
    actorId: member.userId,
    action: "auth.login_success",
    entityType: "member",
    entityId: member.id,
    after: { audience: "member" },
    ...auditMeta,
  });

  return { ok: true };
}

export async function logoutMember() {
  await destroySession("member");
}

export async function requestMemberPasswordReset(
  input: z.infer<typeof memberForgotPasswordSchema>,
  meta?: { ip?: string | null },
): Promise<ForgotPasswordResult> {
  const parsed = memberForgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Üye no veya T.C. kimlik numarası girin." };
  }

  const rate = consumeRateLimit({
    key: `member-forgot:${meta?.ip ?? "unknown"}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Çok fazla deneme. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const successMessage =
    "Bilgiler eşleşirse şifre sıfırlama bağlantısı e-posta adresinize gönderilir.";

  const member = await findMemberUserByIdentifier(parsed.data.identifier);
  if (!member || member.user.deletedAt || member.user.status !== "active") {
    return { ok: true, message: successMessage };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: member.userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const result: ForgotPasswordResult = {
    ok: true,
    message: successMessage,
  };

  if (process.env.NODE_ENV !== "production") {
    result.devResetUrl = `/uye/sifre-yenile/${token}`;
  }

  return result;
}

export async function resetMemberPassword(
  input: z.infer<typeof memberResetPasswordSchema>,
  meta?: { ip?: string | null },
): Promise<AuthResult> {
  const parsed = memberResetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Geçersiz istek.",
    };
  }

  const rate = consumeRateLimit({
    key: `member-reset:${meta?.ip ?? "unknown"}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Çok fazla deneme. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { member: true } } },
  });

  if (
    !record ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    record.user.deletedAt ||
    !record.user.member
  ) {
    return {
      ok: false,
      message: "Sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await tx.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    await tx.passwordResetToken.updateMany({
      where: {
        userId: record.userId,
        usedAt: null,
        NOT: { id: record.id },
      },
      data: { usedAt: new Date() },
    });
  });

  await destroyUserSessions(record.userId, "member");
  return { ok: true };
}
