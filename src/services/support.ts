import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import type {
  Prisma,
  SupportRequestStatus,
  SupportRequestType,
} from "@/generated/prisma/client";
import { writeAuditLog } from "@/lib/auth/audit";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db";
import {
  applyInputFormat,
  INPUT_FORMATS,
  normalizePhoneTr,
} from "@/lib/input-formats";
import {
  SUPPORT_STATUS_TRANSITIONS,
  SUPPORT_TERMINAL_STATUSES,
  supportStatusLabel,
  supportTypeLabel,
} from "@/lib/support-labels";

const SLA_DAYS = 15;

const formSchema = z.object({
  type: z.enum(["information", "complaint", "suggestion", "support"]),
  name: z
    .string()
    .trim()
    .min(2, "Ad soyad en az 2 karakter olmalıdır.")
    .max(INPUT_FORMATS.personName.maxLength),
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin.")
    .max(INPUT_FORMATS.email.maxLength)
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const digits = normalizePhoneTr(value);
      return digits || null;
    }),
  subject: z
    .string()
    .trim()
    .min(3, "Konu en az 3 karakter olmalıdır.")
    .max(INPUT_FORMATS.title.maxLength),
  message: z
    .string()
    .trim()
    .min(10, "Mesaj en az 10 karakter olmalıdır.")
    .max(INPUT_FORMATS.note.maxLength),
  consent: z.boolean().refine((value) => value === true, {
    message: "KVKK bilgilendirmesini onaylamalısınız.",
  }),
  companyFax: z.string().optional().nullable(),
});

function generateTrackingNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `DST-${y}${m}${d}-${rand}`;
}

async function uniqueTrackingNo(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const trackingNo = generateTrackingNo();
    const existing = await tx.supportRequest.findUnique({
      where: { trackingNo },
      select: { id: true },
    });
    if (!existing) return trackingNo;
  }
  throw new Error("TRACKING_NO_FAILED");
}

function computeDueAt(from = new Date()) {
  const due = new Date(from);
  due.setDate(due.getDate() + SLA_DAYS);
  return due;
}

export type SubmitSupportResult =
  | { ok: true; trackingNo: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function submitSupportRequest(input: {
  raw: unknown;
  meta?: { ip?: string | null };
}): Promise<SubmitSupportResult> {
  const parsed = formSchema.safeParse(input.raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Formdaki alanları kontrol edin.",
      fieldErrors,
    };
  }

  if (parsed.data.companyFax?.trim()) {
    return { ok: true, trackingNo: "DST-00000000-000000" };
  }

  const rate = consumeRateLimit({
    key: `support:${parsed.data.type}:${input.meta?.ip ?? "unknown"}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Çok fazla gönderim. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const name = applyInputFormat("personName", parsed.data.name);
  const subject = applyInputFormat("title", parsed.data.subject);
  const now = new Date();

  const created = await prisma.$transaction(async (tx) => {
    const trackingNo = await uniqueTrackingNo(tx);
    const request = await tx.supportRequest.create({
      data: {
        trackingNo,
        type: parsed.data.type,
        applicantName: name,
        applicantEmail: parsed.data.email,
        applicantPhone: parsed.data.phone,
        subject,
        message: parsed.data.message,
        status: "new",
        priority: "normal",
        dueAt: computeDueAt(now),
      },
    });

    await tx.supportMessage.create({
      data: {
        requestId: request.id,
        message: parsed.data.message,
        visibility: "public",
      },
    });

    return request;
  });

  await writeAuditLog({
    action: "support.submitted",
    entityType: "support_request",
    entityId: created.id,
    after: { trackingNo: created.trackingNo, type: created.type },
    ip: input.meta?.ip,
  });

  return { ok: true, trackingNo: created.trackingNo };
}

export async function getSupportRequestByTrackingNo(trackingNo: string) {
  const normalized = trackingNo.trim().toUpperCase();
  if (!normalized) return null;

  return prisma.supportRequest.findFirst({
    where: { trackingNo: normalized, deletedAt: null },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, username: true } } },
      },
    },
  });
}

/** Public-safe tracking view. */
export async function getPublicSupportTracking(trackingNo: string) {
  const request = await getSupportRequestByTrackingNo(trackingNo);
  if (!request) return null;

  return {
    trackingNo: request.trackingNo,
    type: request.type,
    typeLabel: supportTypeLabel(request.type),
    status: request.status,
    statusLabel: supportStatusLabel(request.status),
    subject: request.subject,
    applicantName: request.applicantName,
    emailMasked: request.applicantEmail
      ? request.applicantEmail.replace(/(.{2}).+(@.+)/, "$1***$2")
      : null,
    createdAt: request.createdAt,
    dueAt: request.dueAt,
    canReply: !SUPPORT_TERMINAL_STATUSES.includes(request.status),
    messages: request.messages
      .filter((item) => item.visibility === "public")
      .map((item) => ({
        id: item.id,
        message: item.message,
        createdAt: item.createdAt,
        fromStaff: Boolean(item.senderId),
      })),
  };
}

export async function addPublicSupportReply(input: {
  trackingNo: string;
  message: string;
  meta?: { ip?: string | null };
}) {
  const message = input.message.trim();
  if (message.length < 5) {
    return { ok: false as const, message: "Mesaj en az 5 karakter olmalıdır." };
  }
  if (message.length > INPUT_FORMATS.note.maxLength) {
    return { ok: false as const, message: "Mesaj çok uzun." };
  }

  const rate = consumeRateLimit({
    key: `support-reply:${input.meta?.ip ?? "unknown"}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false as const,
      message: `Çok fazla gönderim. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const request = await getSupportRequestByTrackingNo(input.trackingNo);
  if (!request) {
    return { ok: false as const, message: "Kayıt bulunamadı." };
  }
  if (SUPPORT_TERMINAL_STATUSES.includes(request.status)) {
    return {
      ok: false as const,
      message: "Bu talep sonuçlanmış; yanıt eklenemez.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        requestId: request.id,
        message,
        visibility: "public",
      },
    });
    if (request.status === "waiting_for_applicant") {
      await tx.supportRequest.update({
        where: { id: request.id },
        data: { status: "in_progress" },
      });
    }
  });

  return { ok: true as const, trackingNo: request.trackingNo };
}

export async function listSupportRequestsForAdmin(filters?: {
  page?: number;
  pageSize?: number;
  status?: SupportRequestStatus | "all";
  type?: SupportRequestType | "all";
  q?: string;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 20));
  const status =
    filters?.status && filters.status !== "all" ? filters.status : undefined;
  const type =
    filters?.type && filters.type !== "all" ? filters.type : undefined;
  const q = filters?.q?.trim();

  const where: Prisma.SupportRequestWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(q
      ? {
          OR: [
            { trackingNo: { contains: q } },
            { subject: { contains: q } },
            { applicantName: { contains: q } },
            { applicantEmail: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.supportRequest.count({ where }),
    prisma.supportRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { messages: true } },
        assignee: { select: { id: true, username: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((row) => ({
      id: row.id,
      trackingNo: row.trackingNo,
      type: row.type,
      typeLabel: supportTypeLabel(row.type),
      status: row.status,
      statusLabel: supportStatusLabel(row.status),
      subject: row.subject,
      applicantName: row.applicantName ?? "—",
      applicantEmail: row.applicantEmail ?? "—",
      messageCount: row._count.messages,
      assigneeName: row.assignee?.username ?? null,
      dueAt: row.dueAt,
      createdAt: row.createdAt,
    })),
  };
}

export async function getSupportRequestByIdForAdmin(id: string) {
  const request = await prisma.supportRequest.findFirst({
    where: { id, deletedAt: null },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, username: true } } },
      },
      assignee: { select: { id: true, username: true } },
    },
  });
  if (!request) return null;

  return {
    ...request,
    typeLabel: supportTypeLabel(request.type),
    statusLabel: supportStatusLabel(request.status),
    messages: request.messages.map((item) => ({
      ...item,
      visibilityLabel:
        item.visibility === "internal" ? "İç not" : "Başvurana açık",
      senderLabel: item.sender?.username ?? (item.senderId ? "Personel" : "Başvuran"),
    })),
  };
}

export async function transitionSupportStatus(input: {
  id: string;
  toStatus: SupportRequestStatus;
  actorId: string;
}) {
  const request = await prisma.supportRequest.findFirst({
    where: { id: input.id, deletedAt: null },
  });
  if (!request) throw new Error("NOT_FOUND");

  const allowed = SUPPORT_STATUS_TRANSITIONS[request.status] ?? [];
  if (!allowed.includes(input.toStatus)) {
    throw new Error("INVALID_TRANSITION");
  }

  const updated = await prisma.supportRequest.update({
    where: { id: request.id },
    data: {
      status: input.toStatus,
      assignedToId: input.actorId,
    },
  });

  await writeAuditLog({
    actorId: input.actorId,
    action: "support.status_changed",
    entityType: "support_request",
    entityId: request.id,
    before: { status: request.status },
    after: { status: input.toStatus },
  });

  return updated;
}

export async function addStaffSupportMessage(input: {
  id: string;
  message: string;
  visibility: "public" | "internal";
  actorId: string;
  alsoSetStatus?: SupportRequestStatus | null;
}) {
  const message = input.message.trim();
  if (message.length < 2) throw new Error("MESSAGE_REQUIRED");
  if (message.length > INPUT_FORMATS.note.maxLength) {
    throw new Error("MESSAGE_TOO_LONG");
  }

  const request = await prisma.supportRequest.findFirst({
    where: { id: input.id, deletedAt: null },
  });
  if (!request) throw new Error("NOT_FOUND");

  if (
    input.alsoSetStatus &&
    !(SUPPORT_STATUS_TRANSITIONS[request.status] ?? []).includes(
      input.alsoSetStatus,
    ) &&
    input.alsoSetStatus !== request.status
  ) {
    throw new Error("INVALID_TRANSITION");
  }

  await prisma.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        requestId: request.id,
        senderId: input.actorId,
        message,
        visibility: input.visibility,
      },
    });

    await tx.supportRequest.update({
      where: { id: request.id },
      data: {
        assignedToId: input.actorId,
        ...(input.alsoSetStatus ? { status: input.alsoSetStatus } : {}),
      },
    });
  });

  await writeAuditLog({
    actorId: input.actorId,
    action: "support.message_added",
    entityType: "support_request",
    entityId: request.id,
    after: {
      visibility: input.visibility,
      status: input.alsoSetStatus ?? request.status,
    },
  });
}
