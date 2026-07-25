import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import type { ApplicationStatus, Prisma } from "@/generated/prisma/client";
import {
  APPLICATION_DOCUMENT_TYPE_DEFS,
  APPLICATION_UPLOADABLE_STATUSES,
  applicationStatusLabel,
  type ApplicationDocumentSlug,
} from "@/lib/application-labels";
import { writeAuditLog } from "@/lib/auth/audit";
import { consumeRateLimit } from "@/lib/auth/rate-limit";
import { decryptField, encryptField } from "@/lib/crypto/field-encryption";
import { prisma } from "@/lib/db";
import {
  applyInputFormat,
  INPUT_FORMATS,
  normalizePhoneTr,
} from "@/lib/input-formats";
import {
  isAllowedApplicationMime,
  MAX_APPLICATION_FILE_BYTES,
  storeApplicationFile,
} from "@/lib/media/application-storage";
import {
  isValidIdentityNo,
  isValidTaxNo,
  normalizeIdentityNo,
  normalizeTaxNo,
} from "@/lib/tr-identity";

export const APPLICATION_CONSENT_VERSION = "uyelik-basvuru-v1";

const TERMINAL_STATUSES: ApplicationStatus[] = [
  "approved",
  "rejected",
  "cancelled",
];

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "missing_documents", "rejected", "cancelled"],
  under_review: [
    "missing_documents",
    "approved",
    "rejected",
    "cancelled",
  ],
  missing_documents: ["under_review", "submitted", "rejected", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

export type ApplicationFormPayload = {
  firstName: string;
  lastName: string;
  identityNo: string;
  taxNo?: string | null;
  taxOffice?: string | null;
  phone: string;
  email: string;
  businessName: string;
  address: string;
  districtId: string;
  notes?: string | null;
  consentTruth: boolean;
  consentKvkk: boolean;
  /** Honeypot */
  companyFax?: string | null;
};

export type ApplicationFileInput = {
  slug: ApplicationDocumentSlug;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
};

type StoredFormData = {
  firstName: string;
  lastName: string;
  identityNoEncrypted: string | null;
  taxNoEncrypted: string | null;
  taxOffice: string | null;
  phone: string;
  email: string;
  businessName: string;
  address: string;
  districtId: string;
  districtName: string;
  cityName: string;
  notes: string | null;
  consentTruthAt: string;
  consentKvkkAt: string;
  consentVersion: string;
};

const formSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter olmalıdır.")
    .max(INPUT_FORMATS.personName.maxLength),
  lastName: z
    .string()
    .trim()
    .min(2, "Soyad en az 2 karakter olmalıdır.")
    .max(INPUT_FORMATS.personName.maxLength),
  identityNo: z
    .string()
    .trim()
    .refine((value) => isValidIdentityNo(value), {
      message: "Geçerli bir T.C. kimlik numarası girin.",
    }),
  taxNo: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const digits = normalizeTaxNo(value);
      return digits || null;
    })
    .refine((value) => value == null || isValidTaxNo(value), {
      message: "Geçerli bir vergi numarası girin.",
    }),
  taxOffice: z
    .string()
    .trim()
    .max(INPUT_FORMATS.title.maxLength)
    .optional()
    .nullable()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  phone: z
    .string()
    .trim()
    .min(10, "Telefon numarası zorunludur.")
    .transform((value) => normalizePhoneTr(value))
    .refine((value) => value.length >= 10, {
      message: "Geçerli bir telefon numarası girin.",
    }),
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin.")
    .max(INPUT_FORMATS.email.maxLength)
    .transform((value) => value.toLowerCase()),
  businessName: z
    .string()
    .trim()
    .min(2, "İşletme adı en az 2 karakter olmalıdır.")
    .max(INPUT_FORMATS.title.maxLength),
  address: z
    .string()
    .trim()
    .min(10, "Adres en az 10 karakter olmalıdır.")
    .max(INPUT_FORMATS.addressLong.maxLength),
  districtId: z.string().trim().min(1, "İlçe seçimi zorunludur."),
  notes: z
    .string()
    .trim()
    .max(INPUT_FORMATS.note.maxLength)
    .optional()
    .nullable()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  consentTruth: z.boolean().refine((value) => value === true, {
    message: "Doğruluk beyanını onaylamalısınız.",
  }),
  consentKvkk: z.boolean().refine((value) => value === true, {
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
  return `BA-${y}${m}${d}-${rand}`;
}

async function uniqueTrackingNo(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const trackingNo = generateTrackingNo();
    const existing = await tx.membershipApplication.findUnique({
      where: { trackingNo },
      select: { id: true },
    });
    if (!existing) return trackingNo;
  }
  throw new Error("TRACKING_NO_FAILED");
}

export async function ensureApplicationDocumentTypes() {
  for (const def of APPLICATION_DOCUMENT_TYPE_DEFS) {
    await prisma.documentType.upsert({
      where: { slug: def.slug },
      update: { name: def.name, active: true },
      create: {
        slug: def.slug,
        name: def.name,
        requirements: def.required
          ? "Üyelik başvurusu için zorunlu belgedir."
          : "Üyelik başvurusu için önerilir.",
        fee: 0,
        active: true,
      },
    });
  }

  return prisma.documentType.findMany({
    where: {
      slug: { in: APPLICATION_DOCUMENT_TYPE_DEFS.map((item) => item.slug) },
      active: true,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      requirements: true,
    },
  });
}

export async function listApplicationDocumentTypes() {
  return ensureApplicationDocumentTypes();
}

async function resolveDistrict(districtId: string) {
  const district = await prisma.district.findUnique({
    where: { id: districtId },
    select: {
      id: true,
      name: true,
      city: { select: { name: true } },
    },
  });
  if (!district) {
    throw new Error("DISTRICT_NOT_FOUND");
  }
  return district;
}

function buildStoredFormData(
  data: z.infer<typeof formSchema>,
  district: { name: string; city: { name: string } },
): StoredFormData {
  const now = new Date().toISOString();
  return {
    firstName: applyInputFormat("personName", data.firstName),
    lastName: applyInputFormat("personName", data.lastName),
    identityNoEncrypted: encryptField(normalizeIdentityNo(data.identityNo)),
    taxNoEncrypted: data.taxNo ? encryptField(data.taxNo) : null,
    taxOffice: data.taxOffice
      ? applyInputFormat("title", data.taxOffice)
      : null,
    phone: data.phone,
    email: data.email,
    businessName: applyInputFormat("title", data.businessName),
    address: applyInputFormat("addressLong", data.address),
    districtId: data.districtId,
    districtName: district.name,
    cityName: district.city.name,
    notes: data.notes,
    consentTruthAt: now,
    consentKvkkAt: now,
    consentVersion: APPLICATION_CONSENT_VERSION,
  };
}

function parseStoredFormData(raw: unknown): StoredFormData | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as StoredFormData;
}

export function revealApplicationFormData(raw: unknown) {
  const stored = parseStoredFormData(raw);
  if (!stored) return null;
  return {
    firstName: stored.firstName,
    lastName: stored.lastName,
    identityNo: stored.identityNoEncrypted
      ? decryptField(stored.identityNoEncrypted)
      : null,
    taxNo: stored.taxNoEncrypted
      ? decryptField(stored.taxNoEncrypted)
      : null,
    taxOffice: stored.taxOffice ?? null,
    phone: stored.phone,
    email: stored.email,
    businessName: stored.businessName,
    address: stored.address,
    districtId: stored.districtId,
    districtName: stored.districtName,
    cityName: stored.cityName,
    notes: stored.notes,
    consentVersion: stored.consentVersion,
    consentTruthAt: stored.consentTruthAt,
    consentKvkkAt: stored.consentKvkkAt,
  };
}

async function saveUploadedDocuments(
  tx: Prisma.TransactionClient,
  applicationId: string,
  files: ApplicationFileInput[],
  documentTypes: Awaited<ReturnType<typeof ensureApplicationDocumentTypes>>,
) {
  const typeBySlug = new Map(documentTypes.map((item) => [item.slug, item]));

  for (const file of files) {
    if (!isAllowedApplicationMime(file.mimeType)) {
      throw new Error("INVALID_MIME");
    }
    if (
      file.buffer.byteLength <= 0 ||
      file.buffer.byteLength > MAX_APPLICATION_FILE_BYTES
    ) {
      throw new Error("FILE_TOO_LARGE");
    }

    const docType = typeBySlug.get(file.slug);
    if (!docType) {
      throw new Error("UNKNOWN_DOCUMENT_TYPE");
    }

    const saved = await storeApplicationFile({
      buffer: file.buffer,
      originalName: file.originalName,
      mimeType: file.mimeType,
    });

    await tx.applicationDocument.create({
      data: {
        applicationId,
        documentTypeId: docType.id,
        storageKey: saved.storageKey,
        originalName: saved.filename,
        mimeType: saved.mimeType,
        size: saved.size,
        verificationStatus: "pending",
      },
    });
  }
}

function requiredDocumentSlugs() {
  return APPLICATION_DOCUMENT_TYPE_DEFS.filter((item) => item.required).map(
    (item) => item.slug,
  );
}

function buildDocumentChecklist(
  documents: Array<{
    id: string;
    createdAt: Date;
    documentType: { slug: string; name: string } | null;
    originalName: string;
  }>,
) {
  const uploadedBySlug = new Map<string, { id: string; createdAt: Date }>();
  for (const doc of documents) {
    const slug = doc.documentType?.slug;
    if (!slug) continue;
    const prev = uploadedBySlug.get(slug);
    if (!prev || doc.createdAt > prev.createdAt) {
      uploadedBySlug.set(slug, { id: doc.id, createdAt: doc.createdAt });
    }
  }

  const checklist = APPLICATION_DOCUMENT_TYPE_DEFS.map((def) => {
    const uploaded = uploadedBySlug.get(def.slug);
    return {
      slug: def.slug,
      name: def.name,
      required: def.required,
      uploaded: Boolean(uploaded),
      uploadedAt: uploaded?.createdAt ?? null,
      documentId: uploaded?.id ?? null,
    };
  });

  const requiredComplete = requiredDocumentSlugs().every((slug) =>
    uploadedBySlug.has(slug),
  );
  const uploadedRequiredCount = requiredDocumentSlugs().filter((slug) =>
    uploadedBySlug.has(slug),
  ).length;

  return {
    checklist,
    requiredComplete,
    uploadedRequiredCount,
    requiredCount: requiredDocumentSlugs().length,
  };
}

export type SubmitApplicationResult =
  | { ok: true; trackingNo: string; status: ApplicationStatus }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Step 1: ön başvuru — kimlik/iletişim bilgileri, belge yok. */
export async function submitMembershipApplication(input: {
  raw: unknown;
  meta?: { ip?: string | null };
}): Promise<SubmitApplicationResult> {
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
    return { ok: true, trackingNo: "BA-00000000-000000", status: "submitted" };
  }

  const rate = consumeRateLimit({
    key: `membership-application:${input.meta?.ip ?? "unknown"}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false,
      message: `Çok fazla gönderim. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  try {
    const district = await resolveDistrict(parsed.data.districtId);
    const formData = buildStoredFormData(parsed.data, district);
    const status: ApplicationStatus = "submitted";
    const now = new Date();

    const application = await prisma.$transaction(async (tx) => {
      const trackingNo = await uniqueTrackingNo(tx);
      const created = await tx.membershipApplication.create({
        data: {
          trackingNo,
          status,
          formData: formData as unknown as Prisma.InputJsonValue,
          submittedAt: now,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: created.id,
          fromStatus: null,
          toStatus: status,
          note: "Ön başvuru alındı. Belgeler takip ekranından yüklenecek.",
        },
      });

      return created;
    });

    await writeAuditLog({
      action: "applications.pre_application_submitted",
      entityType: "membership_application",
      entityId: application.id,
      after: { trackingNo: application.trackingNo, status },
      ip: input.meta?.ip,
    });

    return {
      ok: true,
      trackingNo: application.trackingNo,
      status: application.status,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "DISTRICT_NOT_FOUND") {
      return {
        ok: false,
        message: "Seçilen ilçe bulunamadı.",
        fieldErrors: { districtId: "Geçerli bir ilçe seçin." },
      };
    }
    console.error("[applications] submit failed", error);
    return {
      ok: false,
      message: "Başvuru kaydedilemedi. Lütfen tekrar deneyin.",
    };
  }
}

export async function getApplicationByTrackingNo(trackingNo: string) {
  const normalized = trackingNo.trim().toUpperCase();
  if (!normalized) return null;

  return prisma.membershipApplication.findFirst({
    where: { trackingNo: normalized, deletedAt: null },
    include: {
      documents: {
        orderBy: { createdAt: "asc" },
        include: {
          documentType: { select: { id: true, slug: true, name: true } },
        },
      },
      history: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** Public-safe tracking view — no identity/tax plaintext. */
export async function getPublicApplicationTracking(trackingNo: string) {
  const app = await getApplicationByTrackingNo(trackingNo);
  if (!app) return null;

  const form = parseStoredFormData(app.formData);
  const docMeta = buildDocumentChecklist(app.documents);
  const canUpload = APPLICATION_UPLOADABLE_STATUSES.includes(app.status);

  return {
    trackingNo: app.trackingNo,
    status: app.status,
    statusLabel: applicationStatusLabel(app.status),
    submittedAt: app.submittedAt,
    createdAt: app.createdAt,
    decisionNote:
      app.status === "rejected" || app.status === "missing_documents"
        ? app.decisionNote
        : null,
    applicantName: form
      ? `${form.firstName} ${form.lastName}`.trim()
      : null,
    businessName: form?.businessName ?? null,
    emailMasked: form?.email
      ? form.email.replace(/(.{2}).+(@.+)/, "$1***$2")
      : null,
    canUpload,
    canMarkComplete: canUpload && docMeta.requiredComplete,
    requiredComplete: docMeta.requiredComplete,
    uploadedRequiredCount: docMeta.uploadedRequiredCount,
    requiredCount: docMeta.requiredCount,
    checklist: docMeta.checklist,
    documents: app.documents.map((doc) => ({
      id: doc.id,
      name: doc.documentType?.name ?? doc.originalName,
      slug: doc.documentType?.slug ?? null,
      createdAt: doc.createdAt,
    })),
    history: app.history.map((item) => ({
      id: item.id,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      fromLabel: item.fromStatus
        ? applicationStatusLabel(item.fromStatus)
        : null,
      toLabel: applicationStatusLabel(item.toStatus),
      note: item.note,
      createdAt: item.createdAt,
    })),
  };
}

export async function listApplicationsForAdmin(filters?: {
  page?: number;
  pageSize?: number;
  status?: ApplicationStatus | "all";
  q?: string;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 20));
  const status =
    filters?.status && filters.status !== "all" ? filters.status : undefined;
  const q = filters?.q?.trim();

  const where: Prisma.MembershipApplicationWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { trackingNo: { contains: q } },
            // JSON search is limited; tracking no is primary
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.membershipApplication.count({ where }),
    prisma.membershipApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { documents: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((row) => {
      const form = parseStoredFormData(row.formData);
      return {
        id: row.id,
        trackingNo: row.trackingNo,
        status: row.status,
        statusLabel: applicationStatusLabel(row.status),
        submittedAt: row.submittedAt,
        createdAt: row.createdAt,
        documentCount: row._count.documents,
        applicantName: form
          ? `${form.firstName} ${form.lastName}`.trim()
          : "—",
        businessName: form?.businessName ?? "—",
        email: form?.email ?? "—",
        districtName: form?.districtName ?? "—",
      };
    }),
  };
}

export async function getApplicationByIdForAdmin(id: string) {
  const app = await prisma.membershipApplication.findFirst({
    where: { id, deletedAt: null },
    include: {
      documents: {
        orderBy: { createdAt: "asc" },
        include: {
          documentType: { select: { id: true, slug: true, name: true } },
        },
      },
      history: { orderBy: { createdAt: "asc" } },
      assignee: { select: { id: true, username: true } },
    },
  });
  if (!app) return null;

  return {
    ...app,
    form: revealApplicationFormData(app.formData),
    statusLabel: applicationStatusLabel(app.status),
    history: app.history.map((item) => ({
      ...item,
      fromLabel: item.fromStatus
        ? applicationStatusLabel(item.fromStatus)
        : null,
      toLabel: applicationStatusLabel(item.toStatus),
    })),
  };
}

export async function transitionApplicationStatus(input: {
  id: string;
  toStatus: ApplicationStatus;
  note?: string | null;
  actorId: string;
}) {
  const note = input.note?.trim() || null;
  if (
    (input.toStatus === "rejected" ||
      input.toStatus === "missing_documents") &&
    !note
  ) {
    throw new Error("NOTE_REQUIRED");
  }

  const app = await prisma.membershipApplication.findFirst({
    where: { id: input.id, deletedAt: null },
  });
  if (!app) throw new Error("NOT_FOUND");
  if (TERMINAL_STATUSES.includes(app.status)) {
    throw new Error("TERMINAL_STATUS");
  }

  const allowed = ALLOWED_TRANSITIONS[app.status] ?? [];
  if (!allowed.includes(input.toStatus)) {
    throw new Error("INVALID_TRANSITION");
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.membershipApplication.update({
      where: { id: app.id },
      data: {
        status: input.toStatus,
        decisionNote: note,
        decidedAt:
          input.toStatus === "approved" || input.toStatus === "rejected"
            ? now
            : app.decidedAt,
        assignedToId: input.actorId,
        submittedAt:
          app.submittedAt ??
          (input.toStatus === "submitted" || input.toStatus === "under_review"
            ? now
            : null),
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: app.status,
        toStatus: input.toStatus,
        note,
        changedBy: input.actorId,
      },
    });

    return next;
  });

  await writeAuditLog({
    actorId: input.actorId,
    action: "applications.status_changed",
    entityType: "membership_application",
    entityId: app.id,
    before: { status: app.status },
    after: { status: input.toStatus, note },
  });

  return updated;
}

/** Step 2: upload a single document by type slug. */
export async function addSingleDocumentToApplication(input: {
  trackingNo: string;
  file: ApplicationFileInput;
  meta?: { ip?: string | null };
}) {
  const rate = consumeRateLimit({
    key: `membership-application-docs:${input.meta?.ip ?? "unknown"}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.ok) {
    return {
      ok: false as const,
      message: `Çok fazla yükleme. ${rate.retryAfterSec} saniye sonra tekrar deneyin.`,
    };
  }

  const app = await getApplicationByTrackingNo(input.trackingNo);
  if (!app) {
    return { ok: false as const, message: "Başvuru bulunamadı." };
  }
  if (!APPLICATION_UPLOADABLE_STATUSES.includes(app.status)) {
    return {
      ok: false as const,
      message: "Bu başvuruya şu anda belge eklenemez.",
    };
  }

  const known = APPLICATION_DOCUMENT_TYPE_DEFS.some(
    (item) => item.slug === input.file.slug,
  );
  if (!known) {
    return { ok: false as const, message: "Geçersiz belge türü." };
  }

  try {
    const documentTypes = await ensureApplicationDocumentTypes();
    await prisma.$transaction(async (tx) => {
      await saveUploadedDocuments(tx, app.id, [input.file], documentTypes);
    });

    return { ok: true as const, trackingNo: app.trackingNo };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_MIME") {
        return {
          ok: false as const,
          message: "Dosya türü desteklenmiyor. PDF, JPG veya PNG yükleyin.",
        };
      }
      if (error.message === "FILE_TOO_LARGE") {
        return {
          ok: false as const,
          message: "Dosya boyutu 10 MB’ı aşamaz.",
        };
      }
    }
    return { ok: false as const, message: "Belge yüklenemedi." };
  }
}

/** After required docs are uploaded, move ön başvuru → inceleme. */
export async function markApplicationReadyForReview(input: {
  trackingNo: string;
  meta?: { ip?: string | null };
}) {
  const app = await getApplicationByTrackingNo(input.trackingNo);
  if (!app) {
    return { ok: false as const, message: "Başvuru bulunamadı." };
  }
  if (!APPLICATION_UPLOADABLE_STATUSES.includes(app.status)) {
    return {
      ok: false as const,
      message: "Bu başvuru zaten incelemede veya sonuçlanmış.",
    };
  }

  const { requiredComplete } = buildDocumentChecklist(app.documents);
  if (!requiredComplete) {
    return {
      ok: false as const,
      message: "Önce zorunlu belgelerin tümünü yükleyin.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.membershipApplication.update({
      where: { id: app.id },
      data: {
        status: "under_review",
        decisionNote: null,
        submittedAt: app.submittedAt ?? new Date(),
      },
    });
    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: app.status,
        toStatus: "under_review",
        note: "Zorunlu belgeler tamamlandı; inceleme başladı.",
      },
    });
  });

  await writeAuditLog({
    action: "applications.documents_completed",
    entityType: "membership_application",
    entityId: app.id,
    after: { trackingNo: app.trackingNo, status: "under_review" },
    ip: input.meta?.ip,
  });

  return { ok: true as const, trackingNo: app.trackingNo };
}

export async function getApplicationDocumentForAdmin(input: {
  applicationId: string;
  documentId: string;
}) {
  return prisma.applicationDocument.findFirst({
    where: {
      id: input.documentId,
      applicationId: input.applicationId,
      application: { deletedAt: null },
    },
  });
}
