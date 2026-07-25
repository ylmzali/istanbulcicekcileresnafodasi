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
  success?: boolean;
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

function memberErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  if (!(error instanceof Error)) return fallback;
  if (error.message === "MEMBER_NO_TAKEN") {
    return "Bu üye numarası zaten kullanılıyor.";
  }
  if (error.message === "EMAIL_TAKEN") {
    return "Bu e-posta adresi zaten kayıtlı.";
  }
  if (error.message === "NOT_FOUND") {
    return "Üye bulunamadı.";
  }
  if (
    error.message === "DISTRICT_NOT_FOUND" ||
    error.message === "CITY_NOT_FOUND" ||
    error.message === "DISTRICT_CITY_MISMATCH"
  ) {
    return "İl / ilçe seçimi geçersiz.";
  }
  if (
    error.message.includes("Unknown argument") ||
    error.name === "PrismaClientValidationError"
  ) {
    return "Veritabanı şeması güncel değil. Lütfen sayfayı yenileyip tekrar deneyin.";
  }
  if (error.message.includes("FIELD_ENCRYPTION_KEY") || error.message.includes("AUTH_SECRET")) {
    return "Şifreleme anahtarı yapılandırılmamış. Sistem yöneticisine bildirin.";
  }
  return fallback;
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
    return {
      error: memberErrorMessage(
        error,
        "Üye oluşturulamadı. Alanları kontrol edin.",
      ),
    };
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
    return {
      error: memberErrorMessage(
        error,
        "Üye kaydedilemedi. Alanları kontrol edin.",
      ),
    };
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
