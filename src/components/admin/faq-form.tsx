"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createFaqCategoryAction,
  deleteFaqAction,
  saveFaqAction,
  type ActionState,
} from "@/app/(admin)/yonetim/content-actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import {
  AdminFormCard,
  Field,
  FormActionAlert,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { routes } from "@/lib/routes";

type FaqFormValues = {
  id?: string;
  question: string;
  answer: string;
  categoryId: string;
  status: string;
  sortOrder: string;
};

type CategoryOption = { id: string; name: string };

type Labels = {
  question: string;
  answer: string;
  category: string;
  status: string;
  sortOrder: string;
  save: string;
  delete: string;
  back: string;
  statuses: Record<string, string>;
};

const initialState: ActionState = {};

export function FaqForm({
  values,
  categories,
  labels,
}: {
  values: FaqFormValues;
  categories: CategoryOption[];
  labels: Labels;
}) {
  const action = saveFaqAction.bind(null, values.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <AdminFormCard className="max-w-3xl">
      <form action={formAction} className="space-y-3">
        <Field label={labels.question} htmlFor="question">
          <TextInput id="question" name="question" defaultValue={values.question} required />
        </Field>

        <Field label={labels.answer} htmlFor="answer">
          <TextTextarea
            id="answer"
            name="answer"
            defaultValue={values.answer}
            required
            rows={5}
          />
        </Field>

        <div className="flex flex-wrap gap-3">
          <Field label={labels.category} htmlFor="categoryId" size="lg">
            <TextSelect
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId}
            >
              <option value="">—</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </TextSelect>
          </Field>
          <Field label={labels.status} htmlFor="status" size="md">
            <TextSelect id="status" name="status" defaultValue={values.status} required>
              {Object.entries(labels.statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </TextSelect>
          </Field>
          <Field label={labels.sortOrder} htmlFor="sortOrder" size="sm">
            <TextInput
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={values.sortOrder}
            />
          </Field>
        </div>

        <FormActionAlert error={state.error} success={state.success} />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {labels.save}
            </Button>
            <Link
              href={routes.admin.faqs}
              className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
            >
              {labels.back}
            </Link>
          </div>
          {values.id ? (
            <ConfirmDeleteButton
              label={labels.delete}
              action={deleteFaqAction.bind(null, values.id)}
            />
          ) : null}
        </div>
      </form>
    </AdminFormCard>
  );
}

export function FaqCategoryForm({
  labels,
}: {
  labels: { name: string; save: string };
}) {
  const [state, formAction, pending] = useActionState(
    createFaqCategoryAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <Field label={labels.name} htmlFor="category-name" className="min-w-[200px] flex-1">
        <TextInput id="category-name" name="name" required />
      </Field>
      <input type="hidden" name="sortOrder" value="0" />
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <FormActionAlert error={state.error} success={state.success} />
        <Button type="submit" size="sm" disabled={pending}>
          {labels.save}
        </Button>
      </div>
    </form>
  );
}
