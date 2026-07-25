"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  supportRequestAction,
  type SupportFormState,
  type SupportFormValues,
} from "@/app/(public)/support-actions";
import {
  Checkbox,
  Field,
  FormActionAlert,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

type SupportFormMode = "information" | "complaint";

const initialState: SupportFormState = {};

export function SupportRequestForm({ mode }: { mode: SupportFormMode }) {
  const t = getMessages().supportForms;
  const defaultType = mode === "information" ? "information" : "complaint";
  const [state, formAction, pending] = useActionState(
    supportRequestAction,
    initialState,
  );
  const [values, setValues] = useState<SupportFormValues>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
    type: defaultType,
  });

  useEffect(() => {
    if (state.values) setValues(state.values);
  }, [state.values]);

  if (state.ok && state.trackingNo) {
    return (
      <div
        role="status"
        className="overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--color-primary-700)_28%,transparent)] bg-[var(--color-primary-100)]"
      >
        <div className="px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-[var(--color-primary-900)]">
            {t.successTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-primary-900)]/85">
            {t.successBody}
          </p>
          <p className="mt-4 rounded-[12px] border border-white/70 bg-white/80 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.trackingLabel}
            </span>
            <span className="mt-1 block font-mono text-lg font-semibold tracking-wide text-[var(--color-primary-900)]">
              {state.trackingNo}
            </span>
          </p>
          <Link
            href={routes.supportTrackQuery(state.trackingNo)}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            {t.trackCta}
          </Link>
        </div>
      </div>
    );
  }

  function setField<K extends keyof SupportFormValues>(
    key: K,
    value: SupportFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="relative space-y-4" noValidate>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="company_fax">Company fax</label>
        <input
          id="company_fax"
          name="company_fax"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
        />
      </div>

      {mode === "information" ? (
        <input type="hidden" name="type" value="information" />
      ) : (
        <Field
          label={t.type}
          htmlFor="type"
          required
          error={state.fieldErrors?.type}
        >
          <TextSelect
            id="type"
            name="type"
            required
            value={values.type}
            onChange={(event) => setField("type", event.target.value)}
          >
            <option value="complaint">{t.typeComplaint}</option>
            <option value="suggestion">{t.typeSuggestion}</option>
          </TextSelect>
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t.name}
          htmlFor="name"
          required
          error={state.fieldErrors?.name}
        >
          <TextInput
            format="personName"
            id="name"
            name="name"
            required
            autoComplete="name"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
          />
        </Field>
        <Field
          label={t.email}
          htmlFor="email"
          required
          error={state.fieldErrors?.email}
        >
          <TextInput
            format="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.phone} htmlFor="phone" error={state.fieldErrors?.phone}>
          <TextInput
            format="phoneTr"
            id="phone"
            name="phone"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => setField("phone", event.target.value)}
          />
        </Field>
        <Field
          label={t.subject}
          htmlFor="subject"
          required
          error={state.fieldErrors?.subject}
        >
          <TextInput
            format="title"
            id="subject"
            name="subject"
            required
            value={values.subject}
            onChange={(event) => setField("subject", event.target.value)}
          />
        </Field>
      </div>

      <Field
        label={t.message}
        htmlFor="message"
        required
        error={state.fieldErrors?.message}
      >
        <TextTextarea
          format="note"
          id="message"
          name="message"
          required
          rows={6}
          value={values.message}
          onChange={(event) => setField("message", event.target.value)}
        />
      </Field>

      <div>
        <Checkbox
          id="consent"
          name="consent"
          value="true"
          label={t.consent}
          className="items-start"
          checked={values.consent}
          onChange={(event) => setField("consent", event.target.checked)}
        />
        {state.fieldErrors?.consent ? (
          <p className="mt-1 text-xs text-[var(--color-accent)]" role="alert">
            {state.fieldErrors.consent}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {t.consentHint}{" "}
          <Link
            href={routes.legal.kvkk}
            className="font-medium text-[var(--color-primary-800)] hover:underline"
          >
            {t.kvkkLink}
          </Link>
        </p>
      </div>

      <FormActionAlert error={state.error} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={pending} className="min-w-[160px]">
          {pending ? t.submitting : t.submit}
        </Button>
        <Link
          href={routes.supportTrack}
          className="text-sm font-medium text-[var(--color-primary-800)] hover:underline"
        >
          {t.trackLink}
        </Link>
      </div>
    </form>
  );
}
