"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  assessDuesPeriodAction,
  syncOpenDuesPeriodAction,
  type ActionState,
} from "@/app/(admin)/yonetim/dues-actions";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
import { FormActionAlert } from "@/components/admin/form-fields";

type PeriodActionLabels = {
  label: string;
  hint: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel: string;
  cancelLabel: string;
};

export function DuesAssessButton({
  periodId,
  labels,
}: {
  periodId: string;
  labels: PeriodActionLabels;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({});

  return (
    <div className="space-y-2">
      <FormActionAlert
        error={state.error}
        success={state.success}
        successMessage={state.message}
      />
      <p className="text-xs text-[var(--color-text-muted)]">{labels.hint}</p>
      <ConfirmActionDialog
        triggerLabel={labels.label}
        title={labels.confirmTitle}
        message={labels.confirmMessage}
        confirmLabel={labels.confirmLabel}
        cancelLabel={labels.cancelLabel}
        triggerVariant="primary"
        onConfirm={async () => {
          const result = await assessDuesPeriodAction(periodId);
          setState(result);
          if (result.success) router.refresh();
        }}
      />
    </div>
  );
}

export function DuesSyncOpenButton({
  periodId,
  labels,
}: {
  periodId: string;
  labels: PeriodActionLabels;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({});

  return (
    <div className="space-y-2">
      <FormActionAlert
        error={state.error}
        success={state.success}
        successMessage={state.message}
      />
      <p className="text-xs text-[var(--color-text-muted)]">{labels.hint}</p>
      <ConfirmActionDialog
        triggerLabel={labels.label}
        title={labels.confirmTitle}
        message={labels.confirmMessage}
        confirmLabel={labels.confirmLabel}
        cancelLabel={labels.cancelLabel}
        triggerVariant="outline"
        onConfirm={async () => {
          const result = await syncOpenDuesPeriodAction(periodId);
          setState(result);
          if (result.success) router.refresh();
        }}
      />
    </div>
  );
}
