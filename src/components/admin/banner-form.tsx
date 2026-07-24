"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  deleteBannerAction,
  saveBannerAction,
  type ActionState,
} from "@/app/(admin)/yonetim/content-actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  AdminFormCard,
  Checkbox,
  Field,
  FormActionAlert,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

type BannerFormValues = {
  id?: string;
  variant: string;
  eyebrow: string;
  title: string;
  description: string;
  imageKey: string;
  mobileImageKey: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  primaryCtaNewTab: boolean;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaNewTab: boolean;
  sortOrder: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

type Labels = {
  variant: string;
  eyebrow: string;
  title: string;
  descriptionField: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  primaryCtaNewTab: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaNewTab: string;
  imageDesktop: string;
  imageMobile: string;
  linkHref: string;
  linkNewTab: string;
  sortOrder: string;
  active: string;
  startsAt: string;
  endsAt: string;
  save: string;
  delete: string;
  back: string;
  uploadChoose: string;
  uploadChange: string;
  uploadRemove: string;
  uploadCropTitle: string;
  uploadCropConfirm: string;
  uploadCropCancel: string;
  uploadUploading: string;
  uploadError: string;
  uploadZoom: string;
  bannerVariants: Record<string, string>;
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

export function BannerForm({
  values,
  labels,
}: {
  values: BannerFormValues;
  labels: Labels;
}) {
  const action = saveBannerAction.bind(null, values.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [variant, setVariant] = useState(values.variant || "text_cta");
  const [imageKey, setImageKey] = useState(values.imageKey);

  const isImageLink = variant === "image_link";
  const showTextFields = !isImageLink;
  const showSecondaryCta = !isImageLink;

  const uploadLabels = {
    choose: labels.uploadChoose,
    change: labels.uploadChange,
    remove: labels.uploadRemove,
    cropTitle: labels.uploadCropTitle,
    cropConfirm: labels.uploadCropConfirm,
    cropCancel: labels.uploadCropCancel,
    uploading: labels.uploadUploading,
    error: labels.uploadError,
    zoom: labels.uploadZoom,
  };

  return (
    <AdminFormCard className="max-w-3xl">
      <form action={formAction} className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Field label={labels.variant} htmlFor="variant" size="xl">
            <TextSelect
              id="variant"
              name="variant"
              value={variant}
              onChange={(event) => setVariant(event.target.value)}
              required
            >
              {Object.entries(labels.bannerVariants).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </TextSelect>
          </Field>
          <Checkbox
            id="active"
            name="active"
            defaultChecked={values.active}
            label={labels.active}
            className="pb-2.5"
          />
        </div>
        <input type="hidden" name="sortOrder" value={values.sortOrder} />

        <Field label={labels.title} htmlFor="title" size="xl">
          <TextInput
            id="title"
            name="title"
            defaultValue={values.title}
            required
          />
        </Field>

        {showTextFields ? (
          <>
            <Field label={labels.eyebrow} htmlFor="eyebrow" size="lg">
              <TextInput
                id="eyebrow"
                name="eyebrow"
                defaultValue={values.eyebrow}
              />
            </Field>
            <Field label={labels.descriptionField} htmlFor="description" size="xl">
              <TextTextarea
                id="description"
                name="description"
                defaultValue={values.description}
                rows={3}
              />
            </Field>
          </>
        ) : (
          <>
            <input type="hidden" name="eyebrow" value="" />
            <input type="hidden" name="description" value="" />
          </>
        )}

        {variant === "media_cta" || variant === "image_link" ? (
          <ImageUploadField
            name="imageKey"
            label={
              variant === "media_cta"
                ? `${labels.imageDesktop} (328×73)`
                : `${labels.imageDesktop} (576×285)`
            }
            value={imageKey}
            onChange={setImageKey}
            preset={
              variant === "media_cta" ? "hero-media" : "hero-image-link"
            }
            labels={uploadLabels}
          />
        ) : (
          <input type="hidden" name="imageKey" value="" />
        )}

        <input type="hidden" name="mobileImageKey" value="" />

        {isImageLink ? (
          <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Field label={labels.linkHref} htmlFor="primaryCtaHref">
              <TextInput
                id="primaryCtaHref"
                name="primaryCtaHref"
                defaultValue={values.primaryCtaHref}
                placeholder="/haberler veya https://…"
              />
            </Field>
            <Checkbox
              id="primaryCtaNewTab"
              name="primaryCtaNewTab"
              defaultChecked={values.primaryCtaNewTab}
              label={labels.linkNewTab}
              className="pb-2.5"
            />
          </div>
        ) : (
          <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <Field label={labels.primaryCtaLabel} htmlFor="primaryCtaLabel">
              <TextInput
                id="primaryCtaLabel"
                name="primaryCtaLabel"
                defaultValue={values.primaryCtaLabel}
              />
            </Field>
            <Field label={labels.primaryCtaHref} htmlFor="primaryCtaHref">
              <TextInput
                id="primaryCtaHref"
                name="primaryCtaHref"
                defaultValue={values.primaryCtaHref}
                placeholder="/uyelik-islemleri"
              />
            </Field>
            <Checkbox
              id="primaryCtaNewTab"
              name="primaryCtaNewTab"
              defaultChecked={values.primaryCtaNewTab}
              label={labels.primaryCtaNewTab}
              className="pb-2.5"
            />
          </div>
        )}

        {showSecondaryCta ? (
          <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <Field label={labels.secondaryCtaLabel} htmlFor="secondaryCtaLabel">
              <TextInput
                id="secondaryCtaLabel"
                name="secondaryCtaLabel"
                defaultValue={values.secondaryCtaLabel}
              />
            </Field>
            <Field label={labels.secondaryCtaHref} htmlFor="secondaryCtaHref">
              <TextInput
                id="secondaryCtaHref"
                name="secondaryCtaHref"
                defaultValue={values.secondaryCtaHref}
                placeholder="/kurumsal"
              />
            </Field>
            <Checkbox
              id="secondaryCtaNewTab"
              name="secondaryCtaNewTab"
              defaultChecked={values.secondaryCtaNewTab}
              label={labels.secondaryCtaNewTab}
              className="pb-2.5"
            />
          </div>
        ) : (
          <>
            <input type="hidden" name="primaryCtaLabel" value="" />
            <input type="hidden" name="secondaryCtaLabel" value="" />
            <input type="hidden" name="secondaryCtaHref" value="" />
            <input type="hidden" name="secondaryCtaNewTab" value="" />
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Field label={labels.startsAt} htmlFor="startsAt" size="lg">
            <TextInput
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(values.startsAt)}
            />
          </Field>
          <Field label={labels.endsAt} htmlFor="endsAt" size="lg">
            <TextInput
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(values.endsAt)}
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
              href={routes.admin.banners}
              className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
            >
              {labels.back}
            </Link>
          </div>
          {values.id ? (
            <ConfirmDeleteButton
              label={labels.delete}
              action={deleteBannerAction.bind(null, values.id)}
            />
          ) : null}
        </div>
      </form>
    </AdminFormCard>
  );
}
