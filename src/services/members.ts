import { z } from "zod";
import type { MemberStatus, Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { ensureMemberRole } from "@/lib/auth/roles";
import {
  decryptField,
  encryptField,
  hashIdentityForLookup,
} from "@/lib/crypto/field-encryption";
import { formatDate } from "@/lib/datetime";
import { prisma } from "@/lib/db";
import { getMessages } from "@/lib/i18n";
import {
  applyInputFormat,
  isValidPhoneTr,
  normalizePhoneTr,
} from "@/lib/input-formats";
import {
  isValidIdentityNo,
  isValidTaxNo,
  normalizeIdentityNo,
  normalizeTaxNo,
} from "@/lib/tr-identity";

export const memberStatusSchema = z.enum([
  "pending",
  "active",
  "suspended",
  "passive",
  "cancelled",
  "deceased",
]);

export const businessVerificationSchema = z.enum([
  "unverified",
  "verified",
  "rejected",
]);

const requiredIdentityNo = z
  .string()
  .trim()
  .min(1, "T.C. kimlik numarası zorunludur.")
  .refine(
    (value) => isValidIdentityNo(value),
    "Geçerli bir T.C. kimlik numarası girin.",
  );

const requiredTaxNo = z
  .string()
  .trim()
  .min(1, "Vergi numarası zorunludur.")
  .refine(
    (value) => isValidTaxNo(value),
    "Vergi numarası 10 veya 11 haneli olmalıdır.",
  );

function parseOptionalDate(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateInputValue(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export const memberCreateSchema = z.object({
  memberNo: z.string().trim().max(40).optional(),
  firstName: z.string().trim().min(1, "Ad zorunludur.").max(120),
  lastName: z.string().trim().min(1, "Soyad zorunludur.").max(120),
  identityNo: requiredIdentityNo,
  email: z
    .string()
    .trim()
    .max(190)
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Geçerli bir e-posta adresi girin.",
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon numarası zorunludur.")
    .refine(
      (value) => isValidPhoneTr(value),
      "Geçerli bir telefon numarası girin (05xx… veya alan kodlu hat).",
    ),
  password: z
    .string()
    .min(1, "Şifre zorunludur.")
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .max(200),
  status: memberStatusSchema.default("pending"),
  directoryConsent: z.boolean().default(false),
  collectionRef: z.string().trim().max(80).optional().nullable(),
  registrationDate: z.string().optional().nullable(),
  countryCode: z
    .string()
    .trim()
    .length(2, "Ülke kodu 2 karakter olmalıdır.")
    .default("TR"),
  cityId: z.string().trim().optional().nullable(),
  districtId: z.string().trim().min(1, "İlçe seçimi zorunludur."),
  addressLine1: z
    .string()
    .trim()
    .min(1, "Adres zorunludur.")
    .max(255, "Adres en fazla 255 karakter olabilir."),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  postalCode: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) => !value || /^\d{5}$/.test(value.replace(/\D/g, "")),
      "Posta kodu 5 haneli olmalıdır.",
    ),
  legalName: z
    .string()
    .trim()
    .min(1, "Ünvan / işletme adı zorunludur.")
    .max(255, "Ünvan / işletme adı en fazla 255 karakter olabilir."),
  tradeName: z.string().trim().max(255).optional().nullable(),
  taxOffice: z
    .string()
    .trim()
    .min(1, "Vergi dairesi zorunludur.")
    .max(120, "Vergi dairesi en fazla 120 karakter olabilir."),
  taxNo: requiredTaxNo,
  address: z.string().trim().max(500).optional().nullable(),
  businessPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) => !value || isValidPhoneTr(value),
      "Geçerli bir telefon numarası girin (05xx… veya alan kodlu hat).",
    ),
  directoryVisible: z.boolean().default(false),
  verificationStatus: businessVerificationSchema.default("unverified"),
});

export const memberUpdateSchema = z.object({
  status: memberStatusSchema,
  statusReason: z.string().trim().max(500).optional().nullable(),
  directoryConsent: z.boolean().default(false),
  collectionRef: z.string().trim().max(80).optional().nullable(),
  registrationDate: z.string().optional().nullable(),
  terminationDate: z.string().optional().nullable(),
  firstName: z.string().trim().min(1, "Ad zorunludur.").max(120),
  lastName: z.string().trim().min(1, "Soyad zorunludur.").max(120),
  identityNo: requiredIdentityNo,
  birthDate: z.string().optional().nullable(),
  preferredContact: z.string().trim().max(40).optional().nullable(),
  addressLine1: z
    .string()
    .trim()
    .min(1, "Adres zorunludur.")
    .max(255),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  postalCode: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) => !value || /^\d{5}$/.test(value.replace(/\D/g, "")),
      "Posta kodu 5 haneli olmalıdır.",
    ),
  countryCode: z.string().trim().length(2).default("TR"),
  cityId: z.string().trim().optional().nullable(),
  districtId: z.string().trim().min(1, "İlçe seçimi zorunludur."),
  email: z
    .string()
    .trim()
    .max(190)
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Geçerli bir e-posta adresi girin.",
    ),
  phone: z
    .string()
    .trim()
    .min(1, "Telefon numarası zorunludur.")
    .refine(
      (value) => isValidPhoneTr(value),
      "Geçerli bir telefon numarası girin (05xx… veya alan kodlu hat).",
    ),
  newPassword: z
    .string()
    .max(200)
    .refine(
      (value) => !value || value.length >= 8,
      "Şifre en az 8 karakter olmalıdır.",
    ),
  businessId: z.string().trim().optional().nullable(),
  legalName: z
    .string()
    .trim()
    .min(1, "Ünvan / işletme adı zorunludur.")
    .max(255),
  tradeName: z.string().trim().max(255).optional().nullable(),
  taxOffice: z
    .string()
    .trim()
    .min(1, "Vergi dairesi zorunludur.")
    .max(120),
  taxNo: requiredTaxNo,
  businessPhone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) => !value || isValidPhoneTr(value),
      "Geçerli bir telefon numarası girin (05xx… veya alan kodlu hat).",
    ),
  businessEmail: z
    .string()
    .trim()
    .email()
    .max(190)
    .optional()
    .or(z.literal("")),
  website: z.string().trim().max(255).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  directoryVisible: z.boolean().default(false),
  verificationStatus: businessVerificationSchema.default("unverified"),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;

async function generateMemberNo() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const candidate = `M${year}${suffix}`;
    const existing = await prisma.member.findFirst({
      where: { memberNo: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `M${year}${Date.now().toString().slice(-6)}`;
}

async function resolveLocation(input: {
  cityId?: string | null;
  districtId?: string | null;
  countryCode?: string | null;
}) {
  const countryCode = (input.countryCode?.trim() || "TR").toUpperCase();
  const districtId = input.districtId?.trim() || null;
  const cityId = input.cityId?.trim() || null;

  if (districtId) {
    const district = await prisma.district.findUnique({
      where: { id: districtId },
      include: { city: true },
    });
    if (!district) {
      throw new Error("DISTRICT_NOT_FOUND");
    }
    if (cityId && district.cityId !== cityId) {
      throw new Error("DISTRICT_CITY_MISMATCH");
    }
    return {
      countryCode,
      districtId: district.id,
      cityId: district.cityId,
      cityName: district.city.name,
      districtName: district.name,
    };
  }

  if (cityId) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new Error("CITY_NOT_FOUND");
    }
    return {
      countryCode,
      districtId: null,
      cityId: city.id,
      cityName: city.name,
      districtName: null as string | null,
    };
  }

  return {
    countryCode,
    districtId: null,
    cityId: null,
    cityName: null as string | null,
    districtName: null as string | null,
  };
}

export async function listLocationOptions() {
  return prisma.city.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      districts: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

/** @deprecated Prefer listLocationOptions */
export async function listDistrictOptions() {
  return prisma.district.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export type AdminMemberTableRow = {
  id: string;
  memberNo: string;
  fullName: string;
  businessName: string;
  districtLabel: string;
  phone: string;
  status: MemberStatus;
  statusLabel: string;
  registeredLabel: string;
};

export async function listMembers(filters?: {
  q?: string;
  status?: MemberStatus;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters?.pageSize ?? 10));
  const q = filters?.q?.trim();

  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    ...(filters?.status ? { status: filters.status } : {}),
    ...(q
      ? {
          OR: [
            { memberNo: { contains: q } },
            { profile: { firstName: { contains: q } } },
            { profile: { lastName: { contains: q } } },
            { user: { email: { contains: q } } },
            { user: { phone: { contains: q } } },
            { businesses: { some: { legalName: { contains: q } } } },
            { businesses: { some: { tradeName: { contains: q } } } },
            { businesses: { some: { taxOffice: { contains: q } } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.member.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        profile: true,
        user: { select: { email: true, phone: true } },
        businesses: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          take: 1,
          include: {
            district: {
              select: {
                id: true,
                name: true,
                slug: true,
                city: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.member.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function listMembersForAdminTable(filters?: {
  q?: string;
  status?: MemberStatus;
  page?: number;
  pageSize?: number;
}) {
  const statusLabels = getMessages().admin.memberStatuses;
  const result = await listMembers(filters);

  const rows: AdminMemberTableRow[] = result.rows.map((member) => {
    const business = member.businesses[0];
    const fullName = member.profile
      ? `${member.profile.firstName} ${member.profile.lastName}`.trim()
      : "—";

    return {
      id: member.id,
      memberNo: member.memberNo,
      fullName: fullName || "—",
      businessName:
        business?.tradeName?.trim() || business?.legalName?.trim() || "—",
      districtLabel:
        business?.district?.name || member.profile?.districtName || "—",
      phone: business?.phone || member.user.phone || "—",
      status: member.status,
      statusLabel: statusLabels[member.status] ?? member.status,
      registeredLabel: formatDate(member.registrationDate),
    };
  });

  return {
    rows,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export async function getMemberById(id: string) {
  return prisma.member.findFirst({
    where: { id, deletedAt: null },
    include: {
      profile: true,
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          status: true,
          lastLoginAt: true,
        },
      },
      businesses: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          district: {
            select: {
              id: true,
              name: true,
              slug: true,
              cityId: true,
              city: { select: { id: true, name: true } },
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
    },
  });
}

export function serializeMemberForForm(
  member: NonNullable<Awaited<ReturnType<typeof getMemberById>>>,
) {
  const business = member.businesses[0] ?? null;
  return {
    id: member.id,
    memberNo: member.memberNo,
    status: member.status,
    directoryConsent: member.directoryConsent,
    collectionRef: member.collectionRef ?? "",
    registrationDate: toDateInputValue(member.registrationDate),
    terminationDate: toDateInputValue(member.terminationDate),
    identityNo: applyInputFormat(
      "identityNo",
      decryptField(member.identityNoEnc) ?? "",
    ),
    firstName: applyInputFormat(
      "personName",
      member.profile?.firstName ?? "",
    ),
    lastName: applyInputFormat(
      "personName",
      member.profile?.lastName ?? "",
    ),
    birthDate: toDateInputValue(member.profile?.birthDate),
    preferredContact: member.profile?.preferredContact ?? "",
    addressLine1: member.profile?.addressLine1 ?? "",
    addressLine2: member.profile?.addressLine2 ?? "",
    postalCode: member.profile?.postalCode ?? "",
    countryCode: member.profile?.countryCode ?? business?.countryCode ?? "TR",
    cityId: business?.district?.cityId ?? "",
    cityName:
      business?.district?.city.name ?? member.profile?.cityName ?? "",
    districtName:
      business?.district?.name ?? member.profile?.districtName ?? "",
    email: applyInputFormat("email", member.user.email ?? ""),
    phone: applyInputFormat("phoneTr", member.user.phone ?? ""),
    businessId: business?.id ?? "",
    legalName: business?.legalName ?? "",
    tradeName: business?.tradeName ?? "",
    taxOffice: business?.taxOffice ?? "",
    taxNo: applyInputFormat(
      "taxNo",
      decryptField(business?.taxNoEnc) ?? "",
    ),
    businessPhone: applyInputFormat(
      "phoneTr",
      business?.phone ?? "",
    ),
    businessEmail: applyInputFormat("email", business?.email ?? ""),
    website: applyInputFormat("url", business?.website ?? ""),
    districtId: business?.districtId ?? "",
    address: business?.address ?? "",
    directoryVisible: business?.directoryVisible ?? false,
    verificationStatus: business?.verificationStatus ?? "unverified",
    statusHistory: member.statusHistory.map((item) => ({
      id: item.id,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      reason: item.reason,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function createMember(
  raw: MemberCreateInput,
  changedByUserId: string,
) {
  const input = memberCreateSchema.parse(raw);
  const memberNo = input.memberNo?.trim()
    ? input.memberNo.trim()
    : await generateMemberNo();

  const existingNo = await prisma.member.findFirst({
    where: { memberNo },
    select: { id: true },
  });
  if (existingNo) {
    throw new Error("MEMBER_NO_TAKEN");
  }

  const email = input.email?.trim() || null;
  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });
    if (existingEmail) {
      throw new Error("EMAIL_TAKEN");
    }
  }

  const location = await resolveLocation({
    countryCode: input.countryCode,
    cityId: input.cityId,
    districtId: input.districtId,
  });

  const identityNo = input.identityNo?.trim()
    ? normalizeIdentityNo(input.identityNo)
    : "";
  const taxNo = input.taxNo?.trim() ? normalizeTaxNo(input.taxNo) : "";

  if (identityNo) {
    const identityHash = hashIdentityForLookup(identityNo);
    const existingIdentity = await prisma.member.findFirst({
      where: { identityNoHash: identityHash, deletedAt: null },
      select: { id: true },
    });
    if (existingIdentity) {
      throw new Error("IDENTITY_TAKEN");
    }
  }

  const passwordHash = await hashPassword(input.password);
  const registrationDate =
    parseOptionalDate(input.registrationDate) ?? new Date();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        memberNo,
        email,
        phone: input.phone?.trim()
          ? normalizePhoneTr(input.phone)
          : null,
        passwordHash,
        status: "active",
      },
    });

    const member = await tx.member.create({
      data: {
        userId: user.id,
        memberNo,
        status: input.status,
        directoryConsent: input.directoryConsent,
        collectionRef: input.collectionRef?.trim() || null,
        registrationDate,
        identityNoEnc: identityNo ? encryptField(identityNo) : null,
        identityNoHash: identityNo ? hashIdentityForLookup(identityNo) : null,
      },
    });

    await ensureMemberRole(user.id, tx);

    await tx.memberProfile.create({
      data: {
        memberId: member.id,
        firstName: input.firstName,
        lastName: input.lastName,
        countryCode: location.countryCode,
        cityName: location.cityName,
        districtName: location.districtName,
        addressLine1: input.addressLine1?.trim() || null,
        addressLine2: input.addressLine2?.trim() || null,
        postalCode: input.postalCode?.trim()
          ? input.postalCode.replace(/\D/g, "").slice(0, 5)
          : null,
      },
    });

    await tx.memberStatusHistory.create({
      data: {
        memberId: member.id,
        fromStatus: null,
        toStatus: input.status,
        reason: "Üye kaydı oluşturuldu",
        changedBy: changedByUserId,
      },
    });

    const legalName = input.legalName?.trim();
    if (legalName) {
      await tx.business.create({
        data: {
          memberId: member.id,
          legalName,
          tradeName: input.tradeName?.trim() || null,
          taxOffice: input.taxOffice?.trim() || null,
          taxNoEnc: taxNo ? encryptField(taxNo) : null,
          phone: input.businessPhone?.trim()
            ? normalizePhoneTr(input.businessPhone)
            : input.phone?.trim()
              ? normalizePhoneTr(input.phone)
              : null,
          countryCode: location.countryCode,
          districtId: location.districtId,
          address:
            input.address?.trim() || input.addressLine1?.trim() || null,
          directoryVisible: input.directoryVisible,
          verificationStatus: input.verificationStatus,
        },
      });
    }

    return member;
  });
}

export async function updateMember(
  id: string,
  raw: MemberUpdateInput,
  changedByUserId: string,
) {
  const existing = await getMemberById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const input = memberUpdateSchema.parse(raw);
  const email = input.email?.trim() || null;

  if (email) {
    const existingEmail = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        NOT: { id: existing.userId },
      },
      select: { id: true },
    });
    if (existingEmail) {
      throw new Error("EMAIL_TAKEN");
    }
  }

  const location = await resolveLocation({
    countryCode: input.countryCode,
    cityId: input.cityId,
    districtId: input.districtId,
  });

  const statusChanged = existing.status !== input.status;
  const passwordHash = input.newPassword?.trim()
    ? await hashPassword(input.newPassword.trim())
    : null;

  const identityNo = input.identityNo?.trim()
    ? normalizeIdentityNo(input.identityNo)
    : "";
  const taxNo = input.taxNo?.trim() ? normalizeTaxNo(input.taxNo) : "";

  if (identityNo) {
    const identityHash = hashIdentityForLookup(identityNo);
    const existingIdentity = await prisma.member.findFirst({
      where: {
        identityNoHash: identityHash,
        deletedAt: null,
        NOT: { id },
      },
      select: { id: true },
    });
    if (existingIdentity) {
      throw new Error("IDENTITY_TAKEN");
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existing.userId },
      data: {
        email,
        phone: input.phone?.trim()
          ? normalizePhoneTr(input.phone)
          : null,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    const member = await tx.member.update({
      where: { id },
      data: {
        status: input.status,
        directoryConsent: input.directoryConsent,
        collectionRef: input.collectionRef?.trim() || null,
        registrationDate: parseOptionalDate(input.registrationDate),
        terminationDate: parseOptionalDate(input.terminationDate),
        identityNoEnc: identityNo
          ? encryptField(identityNo)
          : existing.identityNoEnc,
        identityNoHash: identityNo
          ? hashIdentityForLookup(identityNo)
          : existing.identityNoHash,
      },
    });

    await ensureMemberRole(existing.userId, tx);

    const profileData = {
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: parseOptionalDate(input.birthDate),
      preferredContact: input.preferredContact?.trim() || null,
      addressLine1: input.addressLine1?.trim() || null,
      addressLine2: existing.profile?.addressLine2 ?? null,
      postalCode: input.postalCode?.trim()
        ? input.postalCode.replace(/\D/g, "").slice(0, 5)
        : null,
      countryCode: location.countryCode,
      cityName: location.cityName,
      districtName: location.districtName,
    };

    if (existing.profile) {
      await tx.memberProfile.update({
        where: { memberId: id },
        data: profileData,
      });
    } else {
      await tx.memberProfile.create({
        data: {
          memberId: id,
          ...profileData,
        },
      });
    }

    if (statusChanged) {
      await tx.memberStatusHistory.create({
        data: {
          memberId: id,
          fromStatus: existing.status,
          toStatus: input.status,
          reason: input.statusReason?.trim() || null,
          changedBy: changedByUserId,
        },
      });
    }

    const legalName = input.legalName?.trim();
    const businessId = input.businessId?.trim() || existing.businesses[0]?.id;
    const existingTaxEnc = existing.businesses[0]?.taxNoEnc ?? null;

    if (legalName) {
      const businessData = {
        legalName,
        tradeName: input.tradeName?.trim() || null,
        taxOffice: input.taxOffice?.trim() || null,
        taxNoEnc: taxNo ? encryptField(taxNo) : existingTaxEnc,
        phone: input.businessPhone?.trim()
          ? normalizePhoneTr(input.businessPhone)
          : input.phone?.trim()
            ? normalizePhoneTr(input.phone)
            : null,
        email: input.businessEmail?.trim() || null,
        website: input.website?.trim() || null,
        countryCode: location.countryCode,
        districtId: location.districtId,
        address: input.address?.trim() || input.addressLine1?.trim() || null,
        directoryVisible: input.directoryVisible,
        verificationStatus: input.verificationStatus,
      };

      if (businessId) {
        await tx.business.update({
          where: { id: businessId },
          data: businessData,
        });
      } else {
        await tx.business.create({
          data: {
            memberId: id,
            ...businessData,
          },
        });
      }
    }

    return member;
  });
}

export async function softDeleteMember(id: string) {
  const existing = await getMemberById(id);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "cancelled",
      },
    });
    await tx.user.update({
      where: { id: existing.userId },
      data: {
        deletedAt: new Date(),
        status: "disabled",
      },
    });
  });
}
