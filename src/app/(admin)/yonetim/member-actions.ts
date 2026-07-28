"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireAdminPermission } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";
import {
  createMember,
  softDeleteMember,
  updateMember,
  type MemberCreateInput,
  type MemberUpdateInput,
} from "@/services/members";

export type ActionState = {
  error?: string;
  errorDetails?: string[];
  success?: boolean;
};

const MEMBER_FIELD_LABELS: Record<string, string> = {
  memberNo: "Üye no",
  firstName: "Ad",
  lastName: "Soyad",
  identityNo: "T.C. kimlik no",
  email: "E-posta",
  phone: "Telefon",
  password: "Şifre",
  newPassword: "Yeni şifre",
  status: "Durum",
  districtId: "İlçe",
  cityId: "İl",
  countryCode: "Ülke",
  addressLine1: "Adres",
  addressLine2: "Adres satırı 2",
  postalCode: "Posta kodu",
  legalName: "Ünvan / işletme adı",
  tradeName: "Tabela adı",
  taxOffice: "Vergi dairesi",
  taxNo: "Vergi no",
  businessPhone: "İşletme telefonu",
  businessEmail: "İşletme e-postası",
  website: "Web sitesi",
  address: "İşletme adresi",
  collectionRef: "Tahsilat ID",
  registrationDate: "Kayıt tarihi",
  terminationDate: "Ayrılış tarihi",
  verificationStatus: "Doğrulama durumu",
  directoryConsent: "Rehber izni",
  directoryVisible: "Rehberde görünür",
};

function boolFromForm(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

function str(formData: FormData, key: string) {
  const value = formData.get(key);
  return value == null ? "" : String(value);
}

function nullable(formData: FormData, key: string) {
  const value = str(formData, key).trim();
  return value.length ? value : null;
}

async function assertMemberUpdate() {
  return requireAdminPermission("members.update");
}

function rethrowRedirect(error: unknown) {
  if (isRedirectError(error)) {
    throw error;
  }
}

function isZodError(error: unknown): error is ZodError {
  return (
    error instanceof ZodError ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "ZodError" &&
      "issues" in error &&
      Array.isArray((error as { issues?: unknown }).issues))
  );
}

function formatZodDetails(error: ZodError): string[] {
  const seen = new Set<string>();
  const details: string[] = [];

  for (const issue of error.issues) {
    const key = issue.path[0];
    const label =
      typeof key === "string" ? (MEMBER_FIELD_LABELS[key] ?? key) : null;
    const detail = label ? `${label}: ${issue.message}` : issue.message;
    if (seen.has(detail)) continue;
    seen.add(detail);
    details.push(detail);
    if (details.length >= 8) break;
  }

  return details;
}

function prismaUniqueTarget(error: Error): string[] {
  const meta = (error as { meta?: { target?: unknown } }).meta;
  if (!meta?.target) return [];
  if (Array.isArray(meta.target)) {
    return meta.target.map(String);
  }
  return [String(meta.target)];
}

function formatMemberActionError(
  error: unknown,
  fallback: string,
): { error: string; errorDetails?: string[] } {
  if (isZodError(error)) {
    const details = formatZodDetails(error);
    if (details.length === 1) {
      return { error: details[0]! };
    }
    if (details.length > 1) {
      return {
        error: "Bazı alanları kontrol edin.",
        errorDetails: details,
      };
    }
    return { error: fallback };
  }

  if (!(error instanceof Error)) {
    return { error: fallback };
  }

  switch (error.message) {
    case "MEMBER_NO_TAKEN":
      return { error: "Bu üye numarası zaten kullanılıyor." };
    case "EMAIL_TAKEN":
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    case "IDENTITY_TAKEN":
      return { error: "Bu T.C. kimlik numarası ile kayıtlı bir üye var." };
    case "NOT_FOUND":
      return { error: "Üye bulunamadı." };
    case "DISTRICT_NOT_FOUND":
      return { error: "Seçilen ilçe bulunamadı. İl / ilçe seçimini yenileyin." };
    case "CITY_NOT_FOUND":
      return { error: "Seçilen il bulunamadı. İl seçimini yenileyin." };
    case "DISTRICT_CITY_MISMATCH":
      return { error: "Seçilen ilçe, seçilen ile ait değil." };
    default:
      break;
  }

  const code = (error as { code?: string }).code;
  if (code === "P2002") {
    const target = prismaUniqueTarget(error).join(" ").toLowerCase();
    if (target.includes("identity")) {
      return { error: "Bu T.C. kimlik numarası ile kayıtlı bir üye var." };
    }
    if (target.includes("email")) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }
    if (target.includes("member_no") || target.includes("memberno")) {
      return { error: "Bu üye numarası zaten kullanılıyor." };
    }
    return { error: "Bu bilgilerle kayıtlı başka bir üye var." };
  }

  if (
    error.message.includes("Unknown argument") ||
    error.name === "PrismaClientValidationError"
  ) {
    return {
      error:
        "Veritabanı şeması güncel değil. Lütfen sayfayı yenileyip tekrar deneyin.",
    };
  }

  if (
    error.message.includes("FIELD_ENCRYPTION_KEY") ||
    error.message.includes("AUTH_SECRET")
  ) {
    return {
      error:
        "Şifreleme anahtarı yapılandırılmamış. Sistem yöneticisine bildirin.",
    };
  }

  return { error: fallback };
}

export async function createMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertMemberUpdate();

  const input: MemberCreateInput = {
    memberNo: nullable(formData, "memberNo") ?? undefined,
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    identityNo: str(formData, "identityNo"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    password: str(formData, "password"),
    status: str(formData, "status") as MemberCreateInput["status"],
    directoryConsent: boolFromForm(formData.get("directoryConsent")),
    registrationDate: nullable(formData, "registrationDate"),
    countryCode: str(formData, "countryCode") || "TR",
    cityId: nullable(formData, "cityId"),
    districtId: str(formData, "districtId"),
    addressLine1: str(formData, "addressLine1"),
    addressLine2: null,
    postalCode: nullable(formData, "postalCode"),
    legalName: str(formData, "legalName"),
    tradeName: nullable(formData, "tradeName"),
    taxOffice: str(formData, "taxOffice"),
    taxNo: str(formData, "taxNo"),
    address: nullable(formData, "address"),
    businessPhone: nullable(formData, "businessPhone"),
    directoryVisible: boolFromForm(formData.get("directoryVisible")),
    verificationStatus: str(
      formData,
      "verificationStatus",
    ) as MemberCreateInput["verificationStatus"],
  };

  try {
    const created = await createMember(input, session.id);
    revalidatePath(routes.admin.members);
    revalidatePath(routes.home);
    redirect(routes.admin.memberEdit(created.id));
  } catch (error) {
    rethrowRedirect(error);
    return formatMemberActionError(
      error,
      "Üye oluşturulamadı. Alanları kontrol edin.",
    );
  }
}

export async function saveMemberAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertMemberUpdate();

  const input: MemberUpdateInput = {
    status: str(formData, "status") as MemberUpdateInput["status"],
    statusReason: nullable(formData, "statusReason"),
    directoryConsent: boolFromForm(formData.get("directoryConsent")),
    collectionRef: nullable(formData, "collectionRef"),
    registrationDate: nullable(formData, "registrationDate"),
    terminationDate: nullable(formData, "terminationDate"),
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    identityNo: str(formData, "identityNo"),
    birthDate: nullable(formData, "birthDate"),
    preferredContact: nullable(formData, "preferredContact"),
    addressLine1: str(formData, "addressLine1"),
    postalCode: nullable(formData, "postalCode"),
    countryCode: str(formData, "countryCode") || "TR",
    cityId: nullable(formData, "cityId"),
    districtId: str(formData, "districtId"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    newPassword: str(formData, "newPassword"),
    businessId: nullable(formData, "businessId"),
    legalName: str(formData, "legalName"),
    tradeName: nullable(formData, "tradeName"),
    taxOffice: str(formData, "taxOffice"),
    taxNo: str(formData, "taxNo"),
    businessPhone: nullable(formData, "businessPhone"),
    businessEmail: str(formData, "businessEmail"),
    website: nullable(formData, "website"),
    address: nullable(formData, "address"),
    directoryVisible: boolFromForm(formData.get("directoryVisible")),
    verificationStatus: str(
      formData,
      "verificationStatus",
    ) as MemberUpdateInput["verificationStatus"],
  };

  try {
    await updateMember(id, input, session.id);
    revalidatePath(routes.admin.members);
    revalidatePath(routes.admin.memberEdit(id));
    revalidatePath(routes.home);
    return { success: true };
  } catch (error) {
    return formatMemberActionError(
      error,
      "Üye kaydedilemedi. Alanları kontrol edin.",
    );
  }
}

export async function deleteMemberAction(id: string) {
  await assertMemberUpdate();
  try {
    await softDeleteMember(id);
  } catch {
    return;
  }
  revalidatePath(routes.admin.members);
  redirect(routes.admin.members);
}
