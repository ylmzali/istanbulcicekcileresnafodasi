"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createResourceAction,
  deleteResourceAction,
  saveResourceAction,
  type ActionState,
} from "@/app/(admin)/yonetim/resource-actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { DocumentUploadField } from "@/components/admin/document-upload-field";
import {
  AdminFormCard,
  Field,
  FormActionAlert,
  TextInput,
  TextSelect,
} from "@/components/admin/form-fields";
import { SlugInputField } from "@/components/admin/slug-input-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

type ResourceFormValues = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  version: string;
  visibility: string;
  sortOrder: string;
  publishedAt: string;
  fileKey: string;
  fileSize: number | null;
  mimeType: string;
};

type Labels = {
  title: string;
  slug: string;
  slugHint: string;
  slugChecking: string;
  slugAvailable: string;
  slugTaken: string;
  slugInvalid: string;
  slugEmptyHint: string;
  category: string;
  version: string;
  visibility: string;
  visibilities: Record<string, string>;
  sortOrder: string;
  publishedAt: string;
  file: string;
  fileHint: string;
  sectionBasic: string;
  sectionFile: string;
  viewPublic: string;
  save: string;
  delete: string;
  back: string;
  uploadChoose: string;
  uploadChange: string;
  uploadRemove: string;
  uploadUploading: string;
  uploadError: string;
};

const initialState: ActionState = {};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[var(--color-border)] pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
      {children}
    </h2>
  );
}

export function ResourceForm({
  values,
  labels,
}: {
  values: ResourceFormValues;
  labels: Labels;
}) {
  const isEdit = Boolean(values.id);
  const action = isEdit
    ? saveResourceAction.bind(null, values.id!)
    : createResourceAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(values.title);
  const [category, setCategory] = useState(values.category);
  const [version, setVersion] = useState(values.version);
  const [visibility, setVisibility] = useState(values.visibility || "public");
  const [sortOrder, setSortOrder] = useState(values.sortOrder || "0");
  const [publishedAt, setPublishedAt] = useState(values.publishedAt);
  const [fileMeta, setFileMeta] = useState({
    fileKey: values.fileKey,
    fileSize: values.fileSize,
    mimeType: values.mimeType,
  });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <div className="space-y-4">
          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.sectionBasic}</SectionTitle>

            <Field label={labels.title} htmlFor="title" size="xl">
              <TextInput
                  format="title"
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>

            <SlugInputField
              defaultValue={values.slug}
              scope="resource"
              excludeId={values.id}
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

            <div className="flex flex-wrap gap-3">
              <Field label={labels.category} htmlFor="category" size="lg">
                <TextInput
                  format="plainText"
                  id="category"
                  name="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
              </Field>
              <Field label={labels.version} htmlFor="version" size="md">
                <TextInput
                  format="version"
                  id="version"
                  name="version"
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <Field label={labels.visibility} htmlFor="visibility" size="md">
                <TextSelect
                  id="visibility"
                  name="visibility"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                >
                  {Object.entries(labels.visibilities).map(([value, label]) => (
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
                  min={0}
                  max={9999}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                />
              </Field>
              <Field label={labels.publishedAt} htmlFor="publishedAt" size="md">
                <TextInput
                  id="publishedAt"
                  name="publishedAt"
                  type="date"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                />
              </Field>
            </div>
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.sectionFile}</SectionTitle>
            <DocumentUploadField
              label={labels.file}
              hint={labels.fileHint}
              required={!isEdit}
              value={fileMeta}
              onChange={setFileMeta}
              labels={{
                choose: labels.uploadChoose,
                change: labels.uploadChange,
                remove: labels.uploadRemove,
                uploading: labels.uploadUploading,
                error: labels.uploadError,
              }}
            />
          </AdminFormCard>
        </div>

        <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <AdminFormCard className="space-y-3">
            <FormActionAlert error={state.error} success={state.success} />
            <Button type="submit" className="w-full" disabled={pending}>
              {labels.save}
            </Button>
            <Link
              href={routes.admin.resources}
              className="inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
            >
              {labels.back}
            </Link>
            <Link
              href={routes.legislation}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center rounded-[10px] text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
            >
              {labels.viewPublic}
            </Link>
            {isEdit ? (
              <ConfirmDeleteButton
                label={labels.delete}
                action={deleteResourceAction.bind(null, values.id!)}
              />
            ) : null}
          </AdminFormCard>
        </aside>
      </div>
    </form>
  );
}
