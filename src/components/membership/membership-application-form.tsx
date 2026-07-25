"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  membershipApplicationAction,
  type MembershipApplicationFormState,
  type MembershipApplicationFormValues,
} from "@/app/(public)/membership-application-actions";
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
import { cn } from "@/lib/utils";

const initialState: MembershipApplicationFormState = {};

const emptyValues: MembershipApplicationFormValues = {
  firstName: "",
  lastName: "",
  identityNo: "",
  taxNo: "",
  taxOffice: "",
  phone: "",
  email: "",
  businessName: "",
  address: "",
  districtId: "",
  notes: "",
  consentTruth: false,
  consentKvkk: false,
};

type DistrictOption = { id: string; name: string };

type MembershipApplicationFormProps = {
  districts: DistrictOption[];
};

function FormSection({
  step,
  title,
  hint,
  children,
  className,
}: {
  step: string;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6",
        className,
      )}
    >
      <header className="mb-5 flex items-start gap-3 border-b border-[var(--color-border)] pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-bold text-[var(--color-primary-900)]">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
            {title}
          </h2>
          {hint ? (
            <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-muted)]">
              {hint}
            </p>
          ) : null}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function MembershipApplicationForm({
  districts,
}: MembershipApplicationFormProps) {
  const t = getMessages().membershipApplication;
  const [state, formAction, pending] = useActionState(
    membershipApplicationAction,
    initialState,
  );
  const [values, setValues] = useState<MembershipApplicationFormValues>(
    emptyValues,
  );

  useEffect(() => {
    if (state.values) setValues(state.values);
  }, [state.values]);

  if (state.ok && state.trackingNo) {
    return (
      <div
        role="status"
        className="overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--color-primary-700)_28%,transparent)] bg-[var(--color-primary-100)]"
      >
        <div className="border-b border-[color-mix(in_srgb,var(--color-primary-700)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-primary-800)_8%,transparent)] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-white">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M16.5 5.5 8.25 13.75 3.5 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-primary-900)]">
                {t.successTitle}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--color-primary-900)]/85">
                {t.successBody}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="rounded-[12px] border border-white/70 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.trackingLabel}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-[var(--color-primary-900)]">
              {state.trackingNo}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-800)]">
              {t.successNext}
            </p>
            <Link
              href={routes.membership.applyTrackQuery(state.trackingNo)}
              className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
            >
              {t.trackCta}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function setField<K extends keyof MembershipApplicationFormValues>(
    key: K,
    value: MembershipApplicationFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction} className="relative space-y-5" noValidate>
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

      <FormSection
        step="1"
        title={t.sectionApplicant}
        hint={t.sectionApplicantHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.firstName}
            htmlFor="firstName"
            required
            error={state.fieldErrors?.firstName}
          >
            <TextInput
              format="personName"
              id="firstName"
              name="firstName"
              required
              autoComplete="given-name"
              value={values.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
            />
          </Field>
          <Field
            label={t.lastName}
            htmlFor="lastName"
            required
            error={state.fieldErrors?.lastName}
          >
            <TextInput
              format="personName"
              id="lastName"
              name="lastName"
              required
              autoComplete="family-name"
              value={values.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
            />
          </Field>
        </div>
        <Field
          label={t.identityNo}
          htmlFor="identityNo"
          required
          error={state.fieldErrors?.identityNo}
        >
          <TextInput
            format="identityNo"
            id="identityNo"
            name="identityNo"
            required
            value={values.identityNo}
            onChange={(event) => setField("identityNo", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.phone}
            htmlFor="phone"
            required
            error={state.fieldErrors?.phone}
          >
            <TextInput
              format="phoneTr"
              id="phone"
              name="phone"
              required
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
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
      </FormSection>

      <FormSection
        step="2"
        title={t.sectionBusiness}
        hint={t.sectionBusinessHint}
      >
        <Field
          label={t.businessName}
          htmlFor="businessName"
          required
          error={state.fieldErrors?.businessName}
        >
          <TextInput
            format="title"
            id="businessName"
            name="businessName"
            required
            value={values.businessName}
            onChange={(event) => setField("businessName", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.taxOffice}
            htmlFor="taxOffice"
            error={state.fieldErrors?.taxOffice}
          >
            <TextInput
              format="title"
              id="taxOffice"
              name="taxOffice"
              value={values.taxOffice}
              onChange={(event) => setField("taxOffice", event.target.value)}
            />
          </Field>
          <Field
            label={t.taxNo}
            htmlFor="taxNo"
            error={state.fieldErrors?.taxNo}
          >
            <TextInput
              format="taxNo"
              id="taxNo"
              name="taxNo"
              value={values.taxNo}
              onChange={(event) => setField("taxNo", event.target.value)}
            />
          </Field>
        </div>
        <Field
          label={t.district}
          htmlFor="districtId"
          required
          error={state.fieldErrors?.districtId}
        >
          <TextSelect
            id="districtId"
            name="districtId"
            required
            value={values.districtId}
            onChange={(event) => setField("districtId", event.target.value)}
          >
            <option value="">{t.districtPlaceholder}</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </TextSelect>
        </Field>
        <Field
          label={t.address}
          htmlFor="address"
          required
          error={state.fieldErrors?.address}
        >
          <TextTextarea
            format="addressLong"
            id="address"
            name="address"
            required
            rows={3}
            value={values.address}
            onChange={(event) => setField("address", event.target.value)}
          />
        </Field>
        <Field label={t.notes} htmlFor="notes" error={state.fieldErrors?.notes}>
          <TextTextarea
            format="note"
            id="notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={(event) => setField("notes", event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection
        step="3"
        title={t.sectionConsent}
        hint={t.sectionConsentHint}
      >
        <div className="space-y-4 rounded-[12px] bg-[var(--color-surface-soft)] px-4 py-4">
          <div>
            <Checkbox
              id="consentTruth"
              name="consentTruth"
              value="true"
              label={t.consentTruth}
              className="items-start"
              checked={values.consentTruth}
              onChange={(event) =>
                setField("consentTruth", event.target.checked)
              }
            />
            {state.fieldErrors?.consentTruth ? (
              <p className="mt-1 text-xs text-[var(--color-accent)]" role="alert">
                {state.fieldErrors.consentTruth}
              </p>
            ) : null}
          </div>
          <div>
            <Checkbox
              id="consentKvkk"
              name="consentKvkk"
              value="true"
              label={t.consentKvkk}
              className="items-start"
              checked={values.consentKvkk}
              onChange={(event) =>
                setField("consentKvkk", event.target.checked)
              }
            />
            {state.fieldErrors?.consentKvkk ? (
              <p className="mt-1 text-xs text-[var(--color-accent)]" role="alert">
                {state.fieldErrors.consentKvkk}
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
        </div>
      </FormSection>

      <FormActionAlert error={state.error} />

      <div className="sticky bottom-3 z-10 rounded-[14px] border border-[var(--color-border)] bg-white/95 p-4 shadow-[0_12px_30px_rgba(23,35,29,0.08)] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:border-t sm:border-[var(--color-border)] sm:pt-6">
          <p className="order-2 text-[12px] leading-5 text-[var(--color-text-muted)] sm:order-1">
            {t.submitHint}
          </p>
          <Button
            type="submit"
            disabled={pending}
            className="order-1 min-w-[200px] sm:order-2"
          >
            {pending ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}
