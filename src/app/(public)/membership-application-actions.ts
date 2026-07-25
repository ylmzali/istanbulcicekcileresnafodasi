"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { ApplicationDocumentSlug } from "@/lib/application-labels";
import { APPLICATION_DOCUMENT_TYPE_DEFS } from "@/lib/application-labels";
import { routes } from "@/lib/routes";
import {
  addSingleDocumentToApplication,
  markApplicationReadyForReview,
  submitMembershipApplication,
} from "@/services/applications";

export type MembershipApplicationFormValues = {
  firstName: string;
  lastName: string;
  identityNo: string;
  taxNo: string;
  taxOffice: string;
  phone: string;
  email: string;
  businessName: string;
  address: string;
  districtId: string;
  notes: string;
  consentTruth: boolean;
  consentKvkk: boolean;
};

export type MembershipApplicationFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: MembershipApplicationFormValues;
  trackingNo?: string;
};

export type ApplicationTrackDocsState = {
  ok?: boolean;
  error?: string;
  message?: string;
  trackingNo?: string;
};

export type ApplicationMarkCompleteState = {
  ok?: boolean;
  error?: string;
  trackingNo?: string;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function clientIp(headerStore: Headers) {
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

function revalidateApplicationPaths(trackingNo: string) {
  revalidatePath(routes.admin.applications);
  revalidatePath(routes.admin.root);
  revalidatePath(routes.membership.applyTrack);
  revalidatePath(routes.membership.applyTrackQuery(trackingNo));
}

export async function membershipApplicationAction(
  _prev: MembershipApplicationFormState,
  formData: FormData,
): Promise<MembershipApplicationFormState> {
  const values: MembershipApplicationFormValues = {
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    identityNo: formValue(formData, "identityNo"),
    taxNo: formValue(formData, "taxNo"),
    taxOffice: formValue(formData, "taxOffice"),
    phone: formValue(formData, "phone"),
    email: formValue(formData, "email"),
    businessName: formValue(formData, "businessName"),
    address: formValue(formData, "address"),
    districtId: formValue(formData, "districtId"),
    notes: formValue(formData, "notes"),
    consentTruth: formData.get("consentTruth") === "true",
    consentKvkk: formData.get("consentKvkk") === "true",
  };

  const headerStore = await headers();

  const result = await submitMembershipApplication({
    raw: {
      ...values,
      companyFax: formValue(formData, "company_fax"),
    },
    meta: { ip: clientIp(headerStore) },
  });

  if (!result.ok) {
    return {
      ok: false,
      error: result.message,
      fieldErrors: result.fieldErrors,
      values,
    };
  }

  revalidateApplicationPaths(result.trackingNo);

  return {
    ok: true,
    trackingNo: result.trackingNo,
  };
}

export async function applicationTrackDocumentAction(
  _prev: ApplicationTrackDocsState,
  formData: FormData,
): Promise<ApplicationTrackDocsState> {
  const trackingNo = formValue(formData, "trackingNo").trim().toUpperCase();
  const slug = formValue(formData, "documentSlug").trim();
  const entry = formData.get("file");

  if (!trackingNo) {
    return { ok: false, error: "Takip numarası gerekli." };
  }

  const allowed = APPLICATION_DOCUMENT_TYPE_DEFS.some((item) => item.slug === slug);
  if (!allowed) {
    return { ok: false, error: "Geçersiz belge türü.", trackingNo };
  }

  if (!(entry instanceof File) || entry.size <= 0) {
    return { ok: false, error: "Dosya seçin.", trackingNo };
  }

  const headerStore = await headers();
  const result = await addSingleDocumentToApplication({
    trackingNo,
    file: {
      slug: slug as ApplicationDocumentSlug,
      buffer: Buffer.from(await entry.arrayBuffer()),
      originalName: entry.name || `${slug}.pdf`,
      mimeType: entry.type || "application/octet-stream",
    },
    meta: { ip: clientIp(headerStore) },
  });

  if (!result.ok) {
    return { ok: false, error: result.message, trackingNo };
  }

  revalidateApplicationPaths(trackingNo);

  return {
    ok: true,
    trackingNo,
    message: "Belge yüklendi.",
  };
}

export async function applicationMarkCompleteAction(
  _prev: ApplicationMarkCompleteState,
  formData: FormData,
): Promise<ApplicationMarkCompleteState> {
  const trackingNo = formValue(formData, "trackingNo").trim().toUpperCase();
  if (!trackingNo) {
    return { ok: false, error: "Takip numarası gerekli." };
  }

  const headerStore = await headers();
  const result = await markApplicationReadyForReview({
    trackingNo,
    meta: { ip: clientIp(headerStore) },
  });

  if (!result.ok) {
    return { ok: false, error: result.message, trackingNo };
  }

  revalidateApplicationPaths(trackingNo);

  return { ok: true, trackingNo };
}
