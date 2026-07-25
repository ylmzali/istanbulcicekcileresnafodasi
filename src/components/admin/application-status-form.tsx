"use client";

import { useActionState } from "react";
import {
  updateApplicationStatusAction,
  type ApplicationActionState,
} from "@/app/(admin)/yonetim/application-actions";
import {
  Field,
  FormActionAlert,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus } from "@/generated/prisma/client";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-labels";
import { getMessages } from "@/lib/i18n";

const initialState: ApplicationActionState = {};

const NEXT_OPTIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["under_review", "missing_documents", "rejected", "cancelled"],
  under_review: [
    "missing_documents",
    "approved",
    "rejected",
    "cancelled",
  ],
  missing_documents: ["under_review", "rejected", "cancelled"],
  approved: [],
  rejected: [],
  cancelled: [],
};

export function ApplicationStatusForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const a = getMessages().admin;
  const [state, formAction, pending] = useActionState(
    updateApplicationStatusAction,
    initialState,
  );
  const options = NEXT_OPTIONS[currentStatus] ?? [];

  if (options.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Bu başvuru sonuçlanmış; durum değiştirilemez.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={applicationId} />
      <Field label={a.applicationChangeStatus} htmlFor="toStatus" required>
        <TextSelect id="toStatus" name="toStatus" required defaultValue="">
          <option value="" disabled>
            Durum seçin
          </option>
          {options.map((status) => (
            <option key={status} value={status}>
              {APPLICATION_STATUS_LABELS[status]}
            </option>
          ))}
        </TextSelect>
      </Field>
      <Field
        label={a.applicationStatusNote}
        htmlFor="note"
        hint="Eksik belge ve ret için zorunlu."
      >
        <TextTextarea format="note" id="note" name="note" rows={3} />
      </Field>
      <FormActionAlert
        error={state.error}
        success={state.success}
        successMessage={state.message}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Durumu güncelle"}
      </Button>
    </form>
  );
}
