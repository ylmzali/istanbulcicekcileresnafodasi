"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { routes } from "@/lib/routes";
import {
  addPublicSupportReply,
  submitSupportRequest,
} from "@/services/support";

export type SupportFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
  type: string;
};

export type SupportFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: SupportFormValues;
  trackingNo?: string;
};

export type SupportTrackReplyState = {
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

export async function supportRequestAction(
  _prev: SupportFormState,
  formData: FormData,
): Promise<SupportFormState> {
  const values: SupportFormValues = {
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    subject: formValue(formData, "subject"),
    message: formValue(formData, "message"),
    consent: formData.get("consent") === "true",
    type: formValue(formData, "type"),
  };

  const headerStore = await headers();
  const result = await submitSupportRequest({
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

  revalidatePath(routes.admin.support);
  revalidatePath(routes.admin.root);

  return { ok: true, trackingNo: result.trackingNo };
}

export async function supportTrackReplyAction(
  _prev: SupportTrackReplyState,
  formData: FormData,
): Promise<SupportTrackReplyState> {
  const trackingNo = formValue(formData, "trackingNo").trim().toUpperCase();
  const message = formValue(formData, "message");
  if (!trackingNo) {
    return { ok: false, error: "Takip numarası gerekli." };
  }

  const headerStore = await headers();
  const result = await addPublicSupportReply({
    trackingNo,
    message,
    meta: { ip: clientIp(headerStore) },
  });

  if (!result.ok) {
    return { ok: false, error: result.message, trackingNo };
  }

  revalidatePath(routes.admin.support);
  revalidatePath(routes.supportTrack);
  revalidatePath(routes.supportTrackQuery(trackingNo));

  return { ok: true, trackingNo };
}
