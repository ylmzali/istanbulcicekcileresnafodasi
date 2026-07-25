"use client";

import { useActionState, useEffect, useState } from "react";
import {
  contactFormAction,
  type ContactFormState,
  type ContactFormValues,
} from "@/app/(public)/contact-actions";
import {
  Checkbox,
  Field,
  FormActionAlert,
  TextInput,
  TextTextarea,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

const initialState: ContactFormState = {};

const emptyValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
};

export function ContactForm() {
  const t = getMessages().contact;
  const [state, formAction, pending] = useActionState(
    contactFormAction,
    initialState,
  );
  const [values, setValues] = useState<ContactFormValues>(emptyValues);

  useEffect(() => {
    if (state.values) {
      setValues(state.values);
    }
  }, [state.values]);

  if (state.ok) {
    return (
      <div
        role="status"
        className="rounded-[16px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,transparent)] bg-[var(--color-primary-100)] px-5 py-6"
      >
        <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
          {t.successTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-primary-900)]/85">
          {t.successBody}
        </p>
      </div>
    );
  }

  function setField<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="relative space-y-4" noValidate>
      {/* Honeypot — obscure name avoids browser/password-manager autofill */}
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
            aria-invalid={Boolean(state.fieldErrors?.name)}
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
            aria-invalid={Boolean(state.fieldErrors?.email)}
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
            aria-invalid={Boolean(state.fieldErrors?.phone)}
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
            aria-invalid={Boolean(state.fieldErrors?.subject)}
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
          aria-invalid={Boolean(state.fieldErrors?.message)}
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
          aria-invalid={Boolean(state.fieldErrors?.consent)}
        />
        {state.fieldErrors?.consent ? (
          <p className="mt-1 text-xs text-[var(--color-accent)]" role="alert">
            {state.fieldErrors.consent}
          </p>
        ) : null}
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        {t.consentHint}{" "}
        <Link
          href={routes.legal.kvkk}
          className="font-medium text-[var(--color-primary-800)] hover:underline"
        >
          {t.kvkkLink}
        </Link>
      </p>

      <FormActionAlert error={state.error} />

      <Button type="submit" disabled={pending} className="min-w-[160px]">
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
