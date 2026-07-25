"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import {
  collectDuePaymentAction,
  unwaiveDueAction,
  waiveDueAction,
  type ActionState,
} from "@/app/(admin)/yonetim/dues-actions";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";
import {
  AdminFormCard,
  Field,
  FormActionAlert,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";

type Labels = {
  collect: string;
  amount: string;
  method: string;
  methods: Record<string, string>;
  providerReference: string;
  note: string;
  paidAt: string;
  waive: string;
  waiveConfirmTitle: string;
  waiveConfirmMessage: string;
  waiveConfirm: string;
  unwaive: string;
  unwaiveConfirmTitle: string;
  unwaiveConfirmMessage: string;
  unwaiveConfirm: string;
  cancel: string;
  remainingHint: string;
  waivedNote: string;
};

const initialState: ActionState = {};

export function DuesCollectForm({
  dueId,
  remainingLabel,
  canCollect,
  canWaive,
  canUnwaive,
  labels,
}: {
  dueId: string;
  remainingLabel: string;
  canCollect: boolean;
  canWaive: boolean;
  canUnwaive: boolean;
  labels: Labels;
}) {
  const router = useRouter();
  const action = collectDuePaymentAction.bind(null, dueId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [waiverState, setWaiverState] = useState<ActionState>({});

  const alertError = state.error || waiverState.error;
  const alertSuccess = state.success || waiverState.success;
  const alertMessage = state.message || waiverState.message;

  async function runWaiver(
    run: () => Promise<ActionState>,
  ): Promise<void> {
    const result = await run();
    setWaiverState(result);
    if (result.success) router.refresh();
  }

  return (
    <div className="space-y-3">
      <AdminFormCard className="space-y-4">
        <FormActionAlert
          error={alertError}
          success={alertSuccess}
          successMessage={alertMessage}
        />
        <p className="text-sm text-[var(--color-text-muted)]">
          {labels.remainingHint}:{" "}
          <span className="font-semibold text-[var(--color-text)]">
            {remainingLabel}
          </span>
        </p>
        {canUnwaive ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {labels.waivedNote}
          </p>
        ) : null}

        {canCollect ? (
          <form action={formAction} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Field label={labels.amount} htmlFor="amount" size="md" required>
                <TextInput
                  format="money"
                  id="amount"
                  name="amount"
                  required
                />
              </Field>
              <Field label={labels.method} htmlFor="method" size="md">
                <TextSelect
                  id="method"
                  name="method"
                  defaultValue="bank_transfer"
                >
                  {Object.entries(labels.methods).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </TextSelect>
              </Field>
              <Field label={labels.paidAt} htmlFor="paidAt" size="md">
                <TextInput id="paidAt" name="paidAt" type="datetime-local" />
              </Field>
            </div>

            <Field
              label={labels.providerReference}
              htmlFor="providerReference"
              size="xl"
            >
              <TextInput id="providerReference" name="providerReference" />
            </Field>

            <Field label={labels.note} htmlFor="note" size="xl">
              <TextTextarea id="note" name="note" rows={3} />
            </Field>

            <Button type="submit" size="sm" disabled={pending}>
              {labels.collect}
            </Button>
          </form>
        ) : null}

        {canWaive ? (
          <ConfirmActionDialog
            triggerLabel={labels.waive}
            title={labels.waiveConfirmTitle}
            message={labels.waiveConfirmMessage}
            confirmLabel={labels.waiveConfirm}
            cancelLabel={labels.cancel}
            triggerVariant="outline"
            confirmVariant="danger"
            onConfirm={() => runWaiver(() => waiveDueAction(dueId))}
          />
        ) : null}

        {canUnwaive ? (
          <ConfirmActionDialog
            triggerLabel={labels.unwaive}
            title={labels.unwaiveConfirmTitle}
            message={labels.unwaiveConfirmMessage}
            confirmLabel={labels.unwaiveConfirm}
            cancelLabel={labels.cancel}
            triggerVariant="outline"
            onConfirm={() => runWaiver(() => unwaiveDueAction(dueId))}
          />
        ) : null}
      </AdminFormCard>
    </div>
  );
}
