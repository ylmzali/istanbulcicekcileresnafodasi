"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  deletePostAction,
  savePostAction,
  type ActionState,
} from "@/app/(admin)/yonetim/content-actions";
import { Button } from "@/components/ui/button";
import {
  AdminFormCard,
  Checkbox,
  Field,
  StatusBadge,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { buildSeoDescription, buildSeoTitle } from "@/lib/seo";
import { routes } from "@/lib/routes";
import { ImageUploadField } from "@/components/admin/image-upload-field";

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
  excerpt: string;
  content: string;
  status: string;
  type: string;
  featured: string;
  publishedAt: string;
  expiresAt: string;
  coverImage: string;
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

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? (
        <p role="alert" className="text-sm text-[var(--color-accent)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[var(--color-primary-800)]">Kaydedildi.</p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <AdminFormCard className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={labels.type} htmlFor="type">
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
            <Field label={labels.status} htmlFor="status">
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
          </div>

          <Field label={labels.title} htmlFor="title">
            <TextInput
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>

          <Field label={labels.slug} htmlFor="slug" hint="Boş bırakılırsa başlıktan üretilir.">
            <TextInput id="slug" name="slug" defaultValue={values.slug} />
          </Field>

          <Field label={labels.excerpt} htmlFor="excerpt">
            <TextTextarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
            />
          </Field>

          <Field label={labels.content} htmlFor="content">
            <TextTextarea
              id="content"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              className="min-h-28"
            />
          </Field>

          <ImageUploadField
            name="coverImage"
            label={labels.coverImage}
            value={coverImage}
            onChange={setCoverImage}
            preset="post-cover"
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

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={labels.publishedAt} htmlFor="publishedAt">
              <TextInput
                id="publishedAt"
                name="publishedAt"
                type="datetime-local"
                defaultValue={toDatetimeLocal(values.publishedAt)}
              />
            </Field>
            <Field label={labels.expiresAt} htmlFor="expiresAt">
              <TextInput
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                defaultValue={toDatetimeLocal(values.expiresAt)}
              />
            </Field>
          </div>

          <Checkbox
            name="featured"
            label={labels.featured}
            defaultChecked={values.featured}
          />

          <div className="grid gap-3 border-t border-[var(--color-border)] pt-3 sm:grid-cols-2">
            <Field label={labels.seoTitle} htmlFor="seoTitle" hint={labels.seoAutoHint}>
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
            <Field label={labels.seoDescription} htmlFor="seoDescription">
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
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" size="sm" disabled={pending}>
              {labels.save}
            </Button>
            <Link
              href={routes.admin.posts}
              className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
            >
              {labels.back}
            </Link>
            {values.id ? (
              <Button
                type="submit"
                size="sm"
                variant="danger"
                formAction={deletePostAction.bind(null, values.id)}
              >
                {labels.delete}
              </Button>
            ) : null}
          </div>
        </AdminFormCard>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <AdminFormCard className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {labels.preview}
              </p>
              <StatusBadge label={previewStatus} />
            </div>

            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt=""
                className="h-36 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-28 items-center justify-center rounded-lg bg-[var(--color-surface-soft)] text-xs text-[var(--color-text-muted)]">
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
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                {excerpt}
              </p>
            ) : null}

            {content.trim() ? (
              <div className="whitespace-pre-wrap border-t border-[var(--color-border)] pt-3 text-sm leading-relaxed text-[var(--color-text)]">
                {content}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                {labels.previewEmpty}
              </p>
            )}

            {(seoTitle || seoDescription) && (
              <div className="rounded-lg bg-[var(--color-surface-soft)] p-3">
                <p className="truncate text-sm font-medium text-[#1a0dab]">
                  {seoTitle || "—"}
                </p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-[var(--color-text-muted)]">
                  {seoDescription || "—"}
                </p>
              </div>
            )}
          </AdminFormCard>
        </aside>
      </div>
    </form>
  );
}
