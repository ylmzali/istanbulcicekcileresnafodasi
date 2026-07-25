"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { routes } from "@/lib/routes";
import { submitContactForm } from "@/services/contact";

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
};

export type ContactFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: ContactFormValues;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function contactFormAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values: ContactFormValues = {
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    subject: formValue(formData, "subject"),
    message: formValue(formData, "message"),
    consent: formData.get("consent") === "true",
  };

  const headerStore = await headers();
  const result = await submitContactForm(
    {
      ...values,
      companyFax: formValue(formData, "company_fax"),
    },
    {
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      error: result.message,
      fieldErrors: result.fieldErrors,
      values,
    };
  }

  revalidatePath(routes.admin.contactSubmissions);
  revalidatePath(routes.admin.root);

  return { ok: true };
}
