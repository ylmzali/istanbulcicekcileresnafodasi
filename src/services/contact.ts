import "server-only";

import { z } from "zod";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db";
import {
  applyInputFormat,
  INPUT_FORMATS,
  normalizePhoneTr,
} from "@/lib/input-formats";

export const contactFormSchema = z.object({
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
  consent: z
    .boolean()
    .refine((value) => value === true, {
      message: "KVKK bilgilendirmesini onaylamalısınız.",
    }),
  /**
   * Honeypot — bots fill this; humans leave empty.
   * Do not name this `website` / `url` / `email`: browsers and password
   * managers autofill those and silently discard real submissions.
   */
  companyFax: z.string().optional().nullable(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function submitContactForm(
  raw: unknown,
  meta?: { ip?: string | null },
): Promise<ContactSubmitResult> {
  const parsed = contactFormSchema.safeParse(raw);
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

  // Silent success for bots that fill honeypot.
  if (parsed.data.companyFax?.trim()) {
    return { ok: true };
  }

  const rate = consumeRateLimit({
    key: `contact:${meta?.ip ?? "unknown"}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Çok fazla gönderim. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const name = applyInputFormat("personName", parsed.data.name);
  const subject = applyInputFormat("title", parsed.data.subject);

  await prisma.contactSubmission.create({
    data: {
      name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject,
      message: parsed.data.message,
      status: "new",
    },
  });

  return { ok: true };
}

export async function listContactSubmissions(filters?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 20));
  const where = {
    ...(filters?.status ? { status: filters.status } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, page, pageSize, rows };
}

export async function markContactSubmissionRead(id: string) {
  return prisma.contactSubmission.update({
    where: { id },
    data: { status: "read" },
  });
}
