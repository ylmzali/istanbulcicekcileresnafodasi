"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  deletePostAction,
  savePostAction,
  type ActionState,
} from "@/app/(admin)/yonetim/content-actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import {
  AdminFormCard,
  Checkbox,
  Field,
  FormActionAlert,
  StatusBadge,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { SlugInputField } from "@/components/admin/slug-input-field";
import { CalendarIcon, ClockIcon } from "@/components/ui/icons";
import { postHref } from "@/lib/content-paths";
import { buildSeoDescription, buildSeoTitle } from "@/lib/seo";
import { routes } from "@/lib/routes";
import type { PostType } from "@/generated/prisma/client";

type PostFormValues = {
  id?: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  expiresAt: string;
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
  excerpt: string;
  content: string;
  status: string;
  type: string;
  featured: string;
  publishedAt: string;
  expiresAt: string;
  coverImage: string;
  coverImageHint: string;
  uploadChoose: string;
  uploadChange: string;
  uploadRemove: string;
  uploadCropTitle: string;
  uploadCropConfirm: string;
  uploadCropCancel: string;
  uploadUploading: string;
  uploadError: string;
  uploadZoom: string;
  seoTitle: string;
  seoDescription: string;
  preview: string;
  previewEmpty: string;
  seoAutoHint: string;
  postSectionBasic: string;
  postSectionContent: string;
  postSectionMedia: string;
  postSectionSchedule: string;
  postSectionSeo: string;
  postViewPublic: string;
  save: string;
  delete: string;
  back: string;
  postTypes: Record<string, string>;
  statuses: Record<string, string>;
};

const initialState: ActionState = {};

function toDatetimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatPreviewDateTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[var(--color-border)] pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
      {children}
    </h2>
  );
}

export function PostForm({
  values,
  labels,
}: {
  values: PostFormValues;
  labels: Labels;
}) {
  const action = savePostAction.bind(null, values.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(values.title);
  const [excerpt, setExcerpt] = useState(values.excerpt);
  const [content, setContent] = useState(values.content);
  const [coverImage, setCoverImage] = useState(values.coverImage);
  const [type, setType] = useState(values.type);
  const [status, setStatus] = useState(values.status);
  const [featured, setFeatured] = useState(values.featured);
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocal(values.publishedAt),
  );
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocal(values.expiresAt));
  const [seoTitle, setSeoTitle] = useState(
    values.seoTitle || buildSeoTitle(values.title),
  );
  const [seoDescription, setSeoDescription] = useState(
    values.seoDescription ||
      buildSeoDescription(values.excerpt, values.content),
  );

  const seoTitleTouched = useRef(Boolean(values.seoTitle));
  const seoDescriptionTouched = useRef(Boolean(values.seoDescription));

  useEffect(() => {
    if (!seoTitleTouched.current) {
      setSeoTitle(buildSeoTitle(title));
    }
  }, [title]);

  useEffect(() => {
    if (!seoDescriptionTouched.current) {
      setSeoDescription(buildSeoDescription(excerpt, content));
    }
  }, [excerpt, content]);

  const previewType = labels.postTypes[type] ?? type;
  const previewStatus = labels.statuses[status] ?? status;
  const publishedLabel = useMemo(
    () => formatPreviewDateTime(publishedAt),
    [publishedAt],
  );
  const expiresLabel = useMemo(
    () => formatPreviewDateTime(expiresAt),
    [expiresAt],
  );

  const publicHref =
    values.id && values.slug && status === "published"
      ? postHref(type as PostType, values.slug)
      : null;

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4">
          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.postSectionBasic}</SectionTitle>

            <Field label={labels.title} htmlFor="title" size="xl">
              <TextInput
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Field>

            <div className="flex flex-wrap gap-3">
              <Field label={labels.type} htmlFor="type" size="md">
                <TextSelect
                  id="type"
                  name="type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  required
                >
                  {Object.entries(labels.postTypes).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
              <SlugInputField
                defaultValue={values.slug}
                scope="post"
                excludeId={values.id}
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
            </div>

            <Checkbox
              id="featured"
              name="featured"
              label={labels.featured}
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.postSectionContent}</SectionTitle>

            <Field label={labels.excerpt} htmlFor="excerpt" size="xl">
              <TextTextarea
                id="excerpt"
                name="excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
              />
            </Field>

            <Field label={labels.content} htmlFor="content" size="xl">
              <TextTextarea
                id="content"
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={10}
                className="min-h-40"
              />
            </Field>
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.postSectionMedia}</SectionTitle>
            <ImageUploadField
              name="coverImage"
              label={labels.coverImage}
              value={coverImage}
              onChange={setCoverImage}
              preset="post-cover"
              hint={labels.coverImageHint}
              labels={{
                choose: labels.uploadChoose,
                change: labels.uploadChange,
                remove: labels.uploadRemove,
                cropTitle: labels.uploadCropTitle,
                cropConfirm: labels.uploadCropConfirm,
                cropCancel: labels.uploadCropCancel,
                uploading: labels.uploadUploading,
                error: labels.uploadError,
                zoom: labels.uploadZoom,
              }}
            />
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.postSectionSchedule}</SectionTitle>

            <div className="flex flex-wrap gap-3">
              <Field label={labels.publishedAt} htmlFor="publishedAt" size="lg">
                <TextInput
                  id="publishedAt"
                  name="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                />
              </Field>
              <Field label={labels.expiresAt} htmlFor="expiresAt" size="lg">
                <TextInput
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </Field>
            </div>
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.postSectionSeo}</SectionTitle>

            <Field
              label={labels.seoTitle}
              htmlFor="seoTitle"
              size="xl"
              hint={labels.seoAutoHint}
            >
              <TextInput
                id="seoTitle"
                name="seoTitle"
                value={seoTitle}
                onChange={(event) => {
                  seoTitleTouched.current = true;
                  setSeoTitle(event.target.value);
                }}
              />
            </Field>
            <Field
              label={labels.seoDescription}
              htmlFor="seoDescription"
              size="xl"
            >
              <TextTextarea
                id="seoDescription"
                name="seoDescription"
                value={seoDescription}
                onChange={(event) => {
                  seoDescriptionTouched.current = true;
                  setSeoDescription(event.target.value);
                }}
                rows={3}
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
                  href={routes.admin.posts}
                  className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
                >
                  {labels.back}
                </Link>
              </div>
              {values.id ? (
                <ConfirmDeleteButton
                  label={labels.delete}
                  action={deletePostAction.bind(null, values.id)}
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
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {featured ? (
                  <span className="rounded-md bg-[var(--color-primary-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary-800)]">
                    {labels.featured}
                  </span>
                ) : null}
                <StatusBadge label={previewStatus} />
              </div>
            </div>

            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt=""
                className="aspect-[16/9] w-full rounded-lg bg-[var(--color-surface-soft)] object-contain"
              />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-[var(--color-surface-soft)] text-xs text-[var(--color-text-muted)]">
                Kapak yok
              </div>
            )}

            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-primary-800)]">
              {previewType}
            </p>

            <h2 className="text-lg font-semibold leading-snug text-[var(--color-text)]">
              {title.trim() || "—"}
            </h2>

            {excerpt.trim() ? (
              <p className="line-clamp-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {excerpt}
              </p>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                {labels.previewEmpty}
              </p>
            )}

            <ul className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text)]">
              {publishedLabel ? (
                <li className="flex items-start gap-2">
                  <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                  <span>
                    <span className="text-[var(--color-text-muted)]">
                      {labels.publishedAt}:{" "}
                    </span>
                    {publishedLabel}
                  </span>
                </li>
              ) : (
                <li className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <ClockIcon className="h-4 w-4 shrink-0" />
                  <span>{labels.publishedAt}</span>
                </li>
              )}
              {expiresLabel ? (
                <li className="flex items-start gap-2">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                  <span>
                    <span className="text-[var(--color-text-muted)]">
                      {labels.expiresAt}:{" "}
                    </span>
                    {expiresLabel}
                  </span>
                </li>
              ) : null}
            </ul>

            {(seoTitle || seoDescription) && (
              <div className="rounded-lg bg-[var(--color-surface-soft)] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  SEO
                </p>
                <p className="mt-1 truncate text-sm font-medium text-[#1a0dab]">
                  {seoTitle || "—"}
                </p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-[var(--color-text-muted)]">
                  {seoDescription || "—"}
                </p>
              </div>
            )}

            {publicHref ? (
              <Link
                href={publicHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-surface-soft)]"
              >
                {labels.postViewPublic} →
              </Link>
            ) : null}
          </AdminFormCard>
        </aside>
      </div>
    </form>
  );
}
