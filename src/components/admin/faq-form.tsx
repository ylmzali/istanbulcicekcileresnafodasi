"use client";

import { useActionState, useState } from "react";
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
  StatusBadge,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { SlugInputField } from "@/components/admin/slug-input-field";
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
  preview: string;
  previewEmpty: string;
  faqSectionBasic: string;
  faqSectionAnswer: string;
  faqViewPublic: string;
  save: string;
  delete: string;
  back: string;
  statuses: Record<string, string>;
};

const initialState: ActionState = {};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[var(--color-border)] pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
      {children}
    </h2>
  );
}

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

  const [question, setQuestion] = useState(values.question);
  const [answer, setAnswer] = useState(values.answer);
  const [categoryId, setCategoryId] = useState(values.categoryId);
  const [status, setStatus] = useState(values.status);
  const [sortOrder, setSortOrder] = useState(values.sortOrder);

  const previewStatus = labels.statuses[status] ?? status;
  const categoryLabel =
    categories.find((item) => item.id === categoryId)?.name ?? null;

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4">
          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.faqSectionBasic}</SectionTitle>

            <Field label={labels.question} htmlFor="question" size="xl">
              <TextInput
                  format="title"
                id="question"
                name="question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                required
              />
            </Field>

            <div className="flex flex-wrap gap-3">
              <Field label={labels.category} htmlFor="categoryId" size="lg">
                <TextSelect
                  id="categoryId"
                  name="categoryId"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
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
                <TextSelect
                  id="status"
                  name="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  required
                >
                  {Object.entries(labels.statuses).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </TextSelect>
              </Field>
              <Field label={labels.sortOrder} htmlFor="sortOrder" size="sm">
                <TextInput
                  format="sortOrder"
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                />
              </Field>
            </div>
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.faqSectionAnswer}</SectionTitle>
            <Field label={labels.answer} htmlFor="answer" size="xl">
              <TextTextarea
                  format="multiline"
                id="answer"
                name="answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                required
                rows={8}
                className="min-h-36"
              />
            </Field>
          </AdminFormCard>

          <AdminFormCard>
            <FormActionAlert error={state.error} success={state.success} />
            <div className="flex flex-wrap items-center justify-between gap-2">
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
          </AdminFormCard>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <AdminFormCard className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {labels.preview}
              </p>
              <StatusBadge label={previewStatus} />
            </div>

            {categoryLabel ? (
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-primary-800)]">
                {categoryLabel}
              </p>
            ) : null}

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-3">
              <p className="text-sm font-semibold leading-snug text-[var(--color-text)]">
                {question.trim() || "—"}
              </p>
              {answer.trim() ? (
                <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {answer}
                </p>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {labels.previewEmpty}
                </p>
              )}
            </div>

            {status === "published" ? (
              <Link
                href={routes.faq}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-surface-soft)]"
              >
                {labels.faqViewPublic} →
              </Link>
            ) : null}
          </AdminFormCard>
        </aside>
      </div>
    </form>
  );
}

export function FaqCategoryForm({
  labels,
}: {
  labels: {
    name: string;
    slug: string;
    slugHint: string;
    slugChecking: string;
    slugAvailable: string;
    slugTaken: string;
    slugInvalid: string;
    slugEmptyHint: string;
    save: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    createFaqCategoryAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field
          label={labels.name}
          htmlFor="category-name"
          size="lg"
          className="min-w-[200px] flex-1"
        >
          <TextInput format="title" id="category-name" name="name" required />
        </Field>
        <SlugInputField
          id="category-slug"
          name="slug"
          scope="faq_category"
          size="lg"
          labels={{
            label: labels.slug,
            hint: labels.slugHint,
            checking: labels.slugChecking,
            available: labels.slugAvailable,
            taken: labels.slugTaken,
            invalid: labels.slugInvalid,
            emptyHint: labels.slugEmptyHint,
          }}
        />
        <input type="hidden" name="sortOrder" value="0" />
        <Button type="submit" size="sm" disabled={pending}>
          {labels.save}
        </Button>
      </div>
      <FormActionAlert error={state.error} success={state.success} />
    </form>
  );
}
