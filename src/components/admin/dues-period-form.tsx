"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createDuesPeriodAction,
  saveDuesPeriodAction,
  type ActionState,
} from "@/app/(admin)/yonetim/dues-actions";
import {
  AdminFormCard,
  Checkbox,
  Field,
  FormActionAlert,
  TextInput,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

type PeriodFormValues = {
  id?: string;
  year: string;
  period: string;
  title: string;
  dueDate: string;
  amount: string;
  active: boolean;
};

type Labels = {
  year: string;
  periodKey: string;
  periodKeyHint: string;
  title: string;
  amount: string;
  dueDate: string;
  active: string;
  save: string;
  back: string;
};

const initialState: ActionState = {};

export function DuesPeriodForm({
  values,
  labels,
}: {
  values: PeriodFormValues;
  labels: Labels;
}) {
  const isEdit = Boolean(values.id);
  const action = isEdit
    ? saveDuesPeriodAction.bind(null, values.id!)
    : createDuesPeriodAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <AdminFormCard className="space-y-4">
        <FormActionAlert
          error={state.error}
          success={state.success}
          successMessage={state.message}
        />

        <div className="flex flex-wrap gap-3">
          <Field label={labels.year} htmlFor="year" size="sm" required>
            <TextInput
                  format="year"
              id="year"
              name="year"
              type="number"
              min={2000}
              max={2100}
              defaultValue={values.year}
              required
            />
          </Field>
          <Field
            label={labels.periodKey}
            htmlFor="period"
            size="md"
            hint={labels.periodKeyHint}
            required
          >
            <TextInput
                  format="slug"
              id="period"
              name="period"
              defaultValue={values.period}
              required
            />
          </Field>
          <Field label={labels.amount} htmlFor="amount" size="md" required>
            <TextInput
                  format="money"
              id="amount"
              name="amount"
              defaultValue={values.amount}
              required
            />
          </Field>
          <Field label={labels.dueDate} htmlFor="dueDate" size="md" required>
            <TextInput
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={values.dueDate}
              required
            />
          </Field>
        </div>

        <Field label={labels.title} htmlFor="title" size="xl" required>
          <TextInput
                  format="title"
            id="title"
            name="title"
            defaultValue={values.title}
            required
          />
        </Field>

        <Checkbox
          id="active"
          name="active"
          defaultChecked={values.active}
          label={labels.active}
        />

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" size="sm" disabled={pending}>
            {labels.save}
          </Button>
          <Link
            href={routes.admin.dues}
            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-text)]"
          >
            {labels.back}
          </Link>
        </div>
      </AdminFormCard>
    </form>
  );
}
