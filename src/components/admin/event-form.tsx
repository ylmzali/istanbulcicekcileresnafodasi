"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteEventAction,
  saveEventAction,
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
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { eventHref } from "@/lib/content-paths";
import { routes } from "@/lib/routes";

type EventFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  eventType: string;
  location: string;
  isOnline: boolean;
  onlineUrl: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  registrationOpen: string;
  registrationClose: string;
  status: string;
  featured: boolean;
  coverImage: string;
  registrationsCount?: number;
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
  content: string;
  status: string;
  featured: string;
  eventType: string;
  location: string;
  isOnline: string;
  onlineUrl: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  registrationOpen: string;
  registrationClose: string;
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
  preview: string;
  eventPreviewEmpty: string;
  eventSectionBasic: string;
  eventSectionSchedule: string;
  eventSectionVenue: string;
  eventSectionMedia: string;
  eventRegistrations: string;
  eventViewPublic: string;
  online: string;
  save: string;
  delete: string;
  back: string;
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

export function EventForm({
  values,
  labels,
}: {
  values: EventFormValues;
  labels: Labels;
}) {
  const action = saveEventAction.bind(null, values.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(values.title);
  const [description, setDescription] = useState(values.description);
  const [eventType, setEventType] = useState(values.eventType);
  const [location, setLocation] = useState(values.location);
  const [isOnline, setIsOnline] = useState(values.isOnline);
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(values.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(values.endsAt));
  const [capacity, setCapacity] = useState(values.capacity);
  const [status, setStatus] = useState(values.status);
  const [coverImage, setCoverImage] = useState(values.coverImage);

  const previewStatus = labels.statuses[status] ?? status;
  const startsLabel = useMemo(() => formatPreviewDateTime(startsAt), [startsAt]);
  const endsLabel = useMemo(() => formatPreviewDateTime(endsAt), [endsAt]);
  const locationLabel = isOnline
    ? labels.online
    : location.trim() || null;

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-4">
          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.eventSectionBasic}</SectionTitle>

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
              <Field label={labels.eventType} htmlFor="eventType" size="lg">
                <TextInput
                  id="eventType"
                  name="eventType"
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                  placeholder="Eğitim, seminer…"
                />
              </Field>
              <SlugInputField
                defaultValue={values.slug}
                scope="event"
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

            <Field label={labels.content} htmlFor="description" size="xl">
              <TextTextarea
                id="description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={7}
                className="min-h-28"
              />
            </Field>

            <Checkbox
              id="featured"
              name="featured"
              label={labels.featured}
              defaultChecked={values.featured}
            />
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.eventSectionSchedule}</SectionTitle>

            <div className="flex flex-wrap gap-3">
              <Field label={labels.startsAt} htmlFor="startsAt" size="lg">
                <TextInput
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  required
                />
              </Field>
              <Field label={labels.endsAt} htmlFor="endsAt" size="lg">
                <TextInput
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </Field>
              <Field label={labels.capacity} htmlFor="capacity" size="sm">
                <TextInput
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <Field
                label={labels.registrationOpen}
                htmlFor="registrationOpen"
                size="lg"
              >
                <TextInput
                  id="registrationOpen"
                  name="registrationOpen"
                  type="datetime-local"
                  defaultValue={toDatetimeLocal(values.registrationOpen)}
                />
              </Field>
              <Field
                label={labels.registrationClose}
                htmlFor="registrationClose"
                size="lg"
              >
                <TextInput
                  id="registrationClose"
                  name="registrationClose"
                  type="datetime-local"
                  defaultValue={toDatetimeLocal(values.registrationClose)}
                />
              </Field>
            </div>
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.eventSectionVenue}</SectionTitle>

            <Checkbox
              id="isOnline"
              name="isOnline"
              label={labels.isOnline}
              checked={isOnline}
              onChange={(event) => setIsOnline(event.target.checked)}
            />

            {isOnline ? (
              <Field label={labels.onlineUrl} htmlFor="onlineUrl" size="xl">
                <TextInput
                  id="onlineUrl"
                  name="onlineUrl"
                  type="url"
                  defaultValue={values.onlineUrl}
                  placeholder="https://"
                />
              </Field>
            ) : (
              <>
                <input type="hidden" name="onlineUrl" value="" />
                <Field label={labels.location} htmlFor="location" size="xl">
                  <TextInput
                    id="location"
                    name="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Adres veya salon"
                  />
                </Field>
              </>
            )}

            {isOnline ? (
              <input type="hidden" name="location" value={location} />
            ) : null}
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.eventSectionMedia}</SectionTitle>
            <ImageUploadField
              name="coverImage"
              label={labels.coverImage}
              value={coverImage}
              onChange={setCoverImage}
              preset="event-cover"
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

          <AdminFormCard>
            <FormActionAlert error={state.error} success={state.success} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm" disabled={pending}>
                  {labels.save}
                </Button>
                <Link
                  href={routes.admin.events}
                  className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
                >
                  {labels.back}
                </Link>
              </div>
              {values.id ? (
                <ConfirmDeleteButton
                  label={labels.delete}
                  action={deleteEventAction.bind(null, values.id)}
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

            {eventType.trim() ? (
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-primary-800)]">
                {eventType}
              </p>
            ) : null}

            <h2 className="text-lg font-semibold leading-snug text-[var(--color-text)]">
              {title.trim() || "—"}
            </h2>

            {description.trim() ? (
              <p className="line-clamp-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {description}
              </p>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                {labels.eventPreviewEmpty}
              </p>
            )}

            <ul className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text)]">
              {startsLabel ? (
                <li className="flex items-start gap-2">
                  <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                  <span>
                    {startsLabel}
                    {endsLabel ? ` – ${endsLabel}` : ""}
                  </span>
                </li>
              ) : (
                <li className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <ClockIcon className="h-4 w-4 shrink-0" />
                  <span>{labels.startsAt}</span>
                </li>
              )}
              {locationLabel ? (
                <li className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                  <span>{locationLabel}</span>
                </li>
              ) : null}
              {capacity.trim() ? (
                <li className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 shrink-0 text-[var(--color-primary-700)]" />
                  <span>
                    {capacity} {labels.capacity.toLocaleLowerCase("tr-TR")}
                  </span>
                </li>
              ) : null}
            </ul>

            {typeof values.registrationsCount === "number" ? (
              <div className="rounded-lg bg-[var(--color-surface-soft)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">
                  {values.registrationsCount}
                </span>{" "}
                {labels.eventRegistrations}
              </div>
            ) : null}

            {values.id && values.slug && status === "published" ? (
              <Link
                href={eventHref(values.slug)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-3 text-sm font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-surface-soft)]"
              >
                {labels.eventViewPublic} →
              </Link>
            ) : null}
          </AdminFormCard>
        </aside>
      </div>
    </form>
  );
}
