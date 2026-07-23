"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  deleteEventAction,
  saveEventAction,
  type ActionState,
} from "@/app/(admin)/yonetim/content-actions";
import { Button } from "@/components/ui/button";
import {
  AdminFormCard,
  Checkbox,
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
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
  coverImage: string;
};

type Labels = {
  title: string;
  slug: string;
  content: string;
  status: string;
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
  uploadChoose: string;
  uploadChange: string;
  uploadRemove: string;
  uploadCropTitle: string;
  uploadCropConfirm: string;
  uploadCropCancel: string;
  uploadUploading: string;
  uploadError: string;
  uploadZoom: string;
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

export function EventForm({
  values,
  labels,
}: {
  values: EventFormValues;
  labels: Labels;
}) {
  const action = saveEventAction.bind(null, values.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [coverImage, setCoverImage] = useState(values.coverImage);

  return (
    <AdminFormCard className="max-w-3xl">
      <form action={formAction} className="space-y-3">
        {state.error ? (
          <p role="alert" className="text-sm text-[var(--color-accent)]">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[var(--color-primary-800)]">Kaydedildi.</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={labels.title} htmlFor="title">
            <TextInput id="title" name="title" defaultValue={values.title} required />
          </Field>
          <Field label={labels.status} htmlFor="status">
            <TextSelect id="status" name="status" defaultValue={values.status} required>
              {Object.entries(labels.statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </TextSelect>
          </Field>
        </div>

        <Field label={labels.slug} htmlFor="slug" hint="Boş bırakılırsa başlıktan üretilir.">
          <TextInput id="slug" name="slug" defaultValue={values.slug} />
        </Field>

        <Field label={labels.content} htmlFor="description">
          <TextTextarea
            id="description"
            name="description"
            defaultValue={values.description}
            rows={5}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={labels.eventType} htmlFor="eventType">
            <TextInput id="eventType" name="eventType" defaultValue={values.eventType} />
          </Field>
          <Field label={labels.location} htmlFor="location">
            <TextInput id="location" name="location" defaultValue={values.location} />
          </Field>
        </div>

        <Checkbox
          name="isOnline"
          label={labels.isOnline}
          defaultChecked={values.isOnline}
        />

        <Field label={labels.onlineUrl} htmlFor="onlineUrl">
          <TextInput id="onlineUrl" name="onlineUrl" defaultValue={values.onlineUrl} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={labels.startsAt} htmlFor="startsAt">
            <TextInput
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(values.startsAt)}
              required
            />
          </Field>
          <Field label={labels.endsAt} htmlFor="endsAt">
            <TextInput
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(values.endsAt)}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={labels.capacity} htmlFor="capacity">
            <TextInput
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={values.capacity}
            />
          </Field>
          <Field label={labels.registrationOpen} htmlFor="registrationOpen">
            <TextInput
              id="registrationOpen"
              name="registrationOpen"
              type="datetime-local"
              defaultValue={toDatetimeLocal(values.registrationOpen)}
            />
          </Field>
          <Field label={labels.registrationClose} htmlFor="registrationClose">
            <TextInput
              id="registrationClose"
              name="registrationClose"
              type="datetime-local"
              defaultValue={toDatetimeLocal(values.registrationClose)}
            />
          </Field>
        </div>

        <ImageUploadField
          name="coverImage"
          label={labels.coverImage}
          value={coverImage}
          onChange={setCoverImage}
          preset="event-cover"
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

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" size="sm" disabled={pending}>
            {labels.save}
          </Button>
          <Link
            href={routes.admin.events}
            className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
          >
            {labels.back}
          </Link>
          {values.id ? (
            <Button
              type="submit"
              size="sm"
              variant="danger"
              formAction={deleteEventAction.bind(null, values.id)}
            >
              {labels.delete}
            </Button>
          ) : null}
        </div>
      </form>
    </AdminFormCard>
  );
}
