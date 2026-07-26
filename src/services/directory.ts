import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { INPUT_FORMATS } from "@/lib/input-formats";

export type PublicFlorist = {
  id: string;
  businessName: string;
  legalName: string;
  tradeName: string | null;
  districtSlug: string | null;
  districtName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  categories: string[];
  latitude: number | null;
  longitude: number | null;
};

const floristSelect = {
  id: true,
  legalName: true,
  tradeName: true,
  address: true,
  phone: true,
  email: true,
  website: true,
  description: true,
  latitude: true,
  longitude: true,
  district: { select: { slug: true, name: true } },
  categories: {
    select: {
      category: { select: { name: true } },
    },
  },
  // Directory-consent businesses may still have contact only on the member record.
  member: {
    select: {
      user: { select: { phone: true } },
      profile: { select: { addressLine1: true, addressLine2: true } },
    },
  },
} satisfies Prisma.BusinessSelect;

function publicDirectoryWhere(filters?: {
  q?: string;
  districtSlug?: string;
}): Prisma.BusinessWhereInput {
  const q = filters?.q?.trim();
  const districtSlug = filters?.districtSlug?.trim();

  return {
    deletedAt: null,
    directoryVisible: true,
    verificationStatus: "verified",
    member: {
      deletedAt: null,
      status: "active",
      directoryConsent: true,
    },
    ...(districtSlug ? { district: { slug: districtSlug } } : {}),
    ...(q
      ? {
          OR: [
            { legalName: { contains: q } },
            { tradeName: { contains: q } },
            { address: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };
}

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (value == null) return null;
  const n = typeof value === "number" ? value : value.toNumber();
  return Number.isFinite(n) ? n : null;
}

function toFlorist(row: {
  id: string;
  legalName: string;
  tradeName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  latitude: { toNumber(): number } | number | null;
  longitude: { toNumber(): number } | number | null;
  district: { slug: string; name: string } | null;
  categories: Array<{ category: { name: string } }>;
  member?: {
    user: { phone: string | null };
    profile: {
      addressLine1: string | null;
      addressLine2: string | null;
    } | null;
  } | null;
}): PublicFlorist {
  const tradeName = row.tradeName?.trim() || null;
  const legalName = row.legalName.trim();
  const profileAddress = [
    row.member?.profile?.addressLine1,
    row.member?.profile?.addressLine2,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  const rawPhone = row.phone?.trim() || row.member?.user.phone?.trim() || "";
  const rawAddress = row.address?.trim() || profileAddress || "";

  return {
    id: row.id,
    businessName: tradeName || legalName,
    legalName,
    tradeName,
    districtSlug: row.district?.slug ?? null,
    districtName: row.district?.name ?? null,
    address: rawAddress || null,
    phone: rawPhone ? INPUT_FORMATS.phoneTr.format(rawPhone) : null,
    email: row.email?.trim().toLowerCase() || null,
    website: row.website?.trim() || null,
    description: row.description?.trim() || null,
    categories: row.categories
      .map((item) => item.category.name.trim())
      .filter(Boolean),
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
  };
}

export async function listPublicFlorists(filters?: {
  q?: string;
  districtSlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 48));
  const where = publicDirectoryWhere(filters);

  const [total, rows] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.findMany({
      where,
      orderBy: [{ tradeName: "asc" }, { legalName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: floristSelect,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: rows.map(toFlorist),
  };
}

/** Compact list for map pins (coordinates required). */
export async function listPublicFloristMapPoints(filters?: {
  q?: string;
  districtSlug?: string;
  limit?: number;
}) {
  const limit = Math.min(500, Math.max(1, filters?.limit ?? 300));
  const where: Prisma.BusinessWhereInput = {
    ...publicDirectoryWhere(filters),
    latitude: { not: null },
    longitude: { not: null },
  };

  const rows = await prisma.business.findMany({
    where,
    orderBy: [{ tradeName: "asc" }, { legalName: "asc" }],
    take: limit,
    select: floristSelect,
  });

  return rows.map(toFlorist);
}
