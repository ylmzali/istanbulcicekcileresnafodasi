"use client";

import { useActionState } from "react";
import {
  updateSupportStatusAction,
  type SupportAdminActionState,
} from "@/app/(admin)/yonetim/support-actions";
import {
  Field,
  FormActionAlert,
  TextSelect,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import type { SupportRequestStatus } from "@/generated/prisma/client";
import { getMessages } from "@/lib/i18n";
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_STATUS_TRANSITIONS,
} from "@/lib/support-labels";

const initialState: SupportAdminActionState = {};

export function SupportStatusForm({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: SupportRequestStatus;
}) {
  const a = getMessages().admin;
  const [state, formAction, pending] = useActionState(
    updateSupportStatusAction,
    initialState,
  );
  const options = SUPPORT_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (options.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Bu talep kapatılmış; durum değiştirilemez.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={requestId} />
      <Field label={a.supportChangeStatus} htmlFor="toStatus" required>
        <TextSelect id="toStatus" name="toStatus" required defaultValue="">
          <option value="" disabled>
            Durum seçin
          </option>
          {options.map((status) => (
            <option key={status} value={status}>
              {SUPPORT_STATUS_LABELS[status]}
            </option>
          ))}
        </TextSelect>
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
