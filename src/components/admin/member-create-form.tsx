"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  createMemberAction,
  type ActionState,
} from "@/app/(admin)/yonetim/member-actions";
import {
  LocationFields,
  type LocationCityOption,
} from "@/components/admin/location-fields";
import { Button } from "@/components/ui/button";
import {
  AdminFormCard,
  Checkbox,
  Field,
  FormActionAlert,
  TextInput,
  TextSelect,
} from "@/components/admin/form-fields";
import {
  buildValidationSummary,
  hasFieldErrors,
  validateDistrict,
  validateIdentityNo,
  validateOptionalEmail,
  validateOptionalPostalCode,
  validatePassword,
  validatePhone,
  validateRequired,
  validateTaxNo,
} from "@/lib/member-client-validation";
import { routes } from "@/lib/routes";

type Labels = {
  memberNo: string;
  memberNoHint: string;
  firstName: string;
  lastName: string;
  identityNo: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  directoryConsent: string;
  directoryVisible: string;
  verificationStatus: string;
  registrationDate: string;
  district: string;
  addressLine1: string;
  postalCode: string;
  legalName: string;
  tradeName: string;
  taxOffice: string;
  taxNo: string;
  address: string;
  businessPhone: string;
  sectionMembership: string;
  sectionProfile: string;
  sectionAddress: string;
  sectionTax: string;
  sectionBusiness: string;
  save: string;
  back: string;
  memberStatuses: Record<string, string>;
  verificationStatuses: Record<string, string>;
};

type FormValues = {
  memberNo: string;
  status: string;
  registrationDate: string;
  directoryConsent: boolean;
  directoryVisible: boolean;
  verificationStatus: string;
  firstName: string;
  lastName: string;
  identityNo: string;
  email: string;
  phone: string;
  password: string;
  countryCode: string;
  cityId: string;
  districtId: string;
  addressLine1: string;
  postalCode: string;
  legalName: string;
  tradeName: string;
  businessPhone: string;
  address: string;
  taxOffice: string;
  taxNo: string;
};

type FieldKey = keyof FormValues;

const initialState: ActionState = {};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[var(--color-border)] pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
      {children}
    </h2>
  );
}

function validateCreateField(key: FieldKey, values: FormValues) {
  switch (key) {
    case "firstName":
    case "lastName":
    case "addressLine1":
    case "legalName":
    case "taxOffice":
    case "status":
      return validateRequired(values[key]);
    case "email":
      return validateOptionalEmail(values.email);
    case "phone":
      return validatePhone(values.phone, { required: true });
    case "businessPhone":
      return validatePhone(values.businessPhone);
    case "password":
      return validatePassword(values.password, { required: true });
    case "identityNo":
      return validateIdentityNo(values.identityNo, { required: true });
    case "taxNo":
      return validateTaxNo(values.taxNo, { required: true });
    case "districtId":
      return validateDistrict(values.districtId);
    case "postalCode":
      return validateOptionalPostalCode(values.postalCode);
    default:
      return null;
  }
}

const validatedKeys: FieldKey[] = [
  "status",
  "firstName",
  "lastName",
  "identityNo",
  "phone",
  "password",
  "email",
  "districtId",
  "addressLine1",
  "postalCode",
  "legalName",
  "businessPhone",
  "taxOffice",
  "taxNo",
];

export function MemberCreateForm({
  cities,
  labels,
}: {
  cities: LocationCityOption[];
  labels: Labels;
}) {
  const [state, formAction, pending] = useActionState(
    createMemberAction,
    initialState,
  );

  const defaultCityId =
    cities.find((city) => city.name === "İstanbul")?.id ?? cities[0]?.id ?? "";

  const [values, setValues] = useState<FormValues>({
    memberNo: "",
    status: "pending",
    registrationDate: "",
    directoryConsent: false,
    directoryVisible: false,
    verificationStatus: "unverified",
    firstName: "",
    lastName: "",
    identityNo: "",
    email: "",
    phone: "",
    password: "",
    countryCode: "TR",
    cityId: defaultCityId,
    districtId: "",
    addressLine1: "",
    postalCode: "",
    legalName: "",
    tradeName: "",
    businessPhone: "",
    address: "",
    taxOffice: "",
    taxNo: "",
  });

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>(
    {},
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const setField = <K extends FieldKey>(key: K, value: FormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      const liveKeys: FieldKey[] = [
        "identityNo",
        "taxNo",
        "email",
        "password",
        "firstName",
        "lastName",
        "phone",
        "districtId",
        "addressLine1",
        "legalName",
        "taxOffice",
      ];
      const shouldValidate =
        touched[key] ||
        Boolean(errors[key]) ||
        submitAttempted ||
        (liveKeys.includes(key) && String(value).trim().length > 0);
      if (shouldValidate) {
        const message = validateCreateField(key, next);
        setErrors((prev) => {
          const copy = { ...prev };
          if (message) copy[key] = message;
          else delete copy[key];
          return copy;
        });
      }
      return next;
    });
  };

  const markTouched = (key: FieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => {
      const message = validateCreateField(key, values);
      const copy = { ...prev };
      if (message) copy[key] = message;
      else delete copy[key];
      return copy;
    });
  };

  const fieldLabels = useMemo(
    () => ({
      status: labels.status,
      firstName: labels.firstName,
      lastName: labels.lastName,
      identityNo: labels.identityNo,
      phone: labels.phone,
      password: labels.password,
      email: labels.email,
      districtId: labels.district,
      addressLine1: labels.addressLine1,
      postalCode: labels.postalCode,
      legalName: labels.legalName,
      businessPhone: labels.businessPhone,
      taxOffice: labels.taxOffice,
      taxNo: labels.taxNo,
    }),
    [labels],
  );

  const clientErrorSummary = useMemo(() => {
    if (!submitAttempted || !hasFieldErrors(errors)) return null;
    return buildValidationSummary(errors, fieldLabels, validatedKeys);
  }, [errors, fieldLabels, submitAttempted]);

  return (
    <form
      action={formAction}
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        const nextErrors: Partial<Record<FieldKey, string>> = {};
        const nextTouched: Partial<Record<FieldKey, boolean>> = {};
        for (const key of validatedKeys) {
          nextTouched[key] = true;
          const message = validateCreateField(key, values);
          if (message) nextErrors[key] = message;
        }
        setSubmitAttempted(true);
        setTouched((prev) => ({ ...prev, ...nextTouched }));
        setErrors(nextErrors);
        if (hasFieldErrors(nextErrors)) {
          event.preventDefault();
          const firstKey = validatedKeys.find((key) => nextErrors[key]);
          if (firstKey) {
            document.getElementById(firstKey)?.focus();
          }
        }
      }}
    >
      <AdminFormCard className="space-y-4">
        <SectionTitle>{labels.sectionMembership}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Field
            label={labels.memberNo}
            htmlFor="memberNo"
            size="md"
            hint={labels.memberNoHint}
          >
            <TextInput
                  format="memberNo"
              id="memberNo"
              name="memberNo"
              value={values.memberNo}
              onChange={(event) => setField("memberNo", event.target.value)}
            />
          </Field>
          <Field label={labels.status} htmlFor="status" size="md" required>
            <TextSelect
              id="status"
              name="status"
              value={values.status}
              onChange={(event) => setField("status", event.target.value)}
              required
            >
              {Object.entries(labels.memberStatuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </TextSelect>
          </Field>
          <Field label={labels.registrationDate} htmlFor="registrationDate" size="md">
            <TextInput
              id="registrationDate"
              name="registrationDate"
              type="date"
              value={values.registrationDate}
              onChange={(event) =>
                setField("registrationDate", event.target.value)
              }
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          <Checkbox
            id="directoryConsent"
            name="directoryConsent"
            label={labels.directoryConsent}
            checked={values.directoryConsent}
            onChange={(event) => {
              const checked = event.target.checked;
              setField("directoryConsent", checked);
              if (checked) {
                setField("directoryVisible", true);
                if (values.verificationStatus === "unverified") {
                  setField("verificationStatus", "verified");
                }
              }
            }}
          />
          <Checkbox
            id="directoryVisible"
            name="directoryVisible"
            label={labels.directoryVisible}
            checked={values.directoryVisible}
            onChange={(event) =>
              setField("directoryVisible", event.target.checked)
            }
          />
        </div>
        <Field
          label={labels.verificationStatus}
          htmlFor="verificationStatus"
          size="md"
        >
          <TextSelect
            id="verificationStatus"
            name="verificationStatus"
            value={values.verificationStatus}
            onChange={(event) =>
              setField("verificationStatus", event.target.value)
            }
          >
            {Object.entries(labels.verificationStatuses).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </TextSelect>
        </Field>
      </AdminFormCard>

      <AdminFormCard className="space-y-4">
        <SectionTitle>{labels.sectionProfile}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Field
            label={labels.firstName}
            htmlFor="firstName"
            size="lg"
            required
            error={errors.firstName}
          >
            <TextInput
                  format="personName"
              id="firstName"
              name="firstName"
              value={values.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
              onBlur={() => markTouched("firstName")}
              required
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
          </Field>
          <Field
            label={labels.lastName}
            htmlFor="lastName"
            size="lg"
            required
            error={errors.lastName}
          >
            <TextInput
                  format="personName"
              id="lastName"
              name="lastName"
              value={values.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
              onBlur={() => markTouched("lastName")}
              required
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
          </Field>
          <Field
            label={labels.identityNo}
            htmlFor="identityNo"
            size="md"
            required
            error={errors.identityNo}
          >
            <TextInput
                  format="identityNo"
              id="identityNo"
              name="identityNo"
              value={values.identityNo}
              onChange={(event) =>
                setField("identityNo", event.target.value)
              }
              onBlur={() => markTouched("identityNo")}
              aria-invalid={Boolean(errors.identityNo)}
              aria-describedby={
                errors.identityNo ? "identityNo-error" : undefined
              }
            />
          </Field>
          <Field
            label={labels.email}
            htmlFor="email"
            size="lg"
            error={errors.email}
          >
            <TextInput
                  format="email"
              id="email"
              name="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              onBlur={() => markTouched("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </Field>
          <Field
            label={labels.phone}
            htmlFor="phone"
            size="md"
            required
            error={errors.phone}
          >
            <TextInput
                  format="phoneTr"
              id="phone"
              name="phone"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
              onBlur={() => markTouched("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
          </Field>
          <Field
            label={labels.password}
            htmlFor="password"
            size="lg"
            required
            error={errors.password}
          >
            <TextInput
                  format="password"
              id="password"
              name="password"
              required
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => setField("password", event.target.value)}
              onBlur={() => markTouched("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
          </Field>
        </div>
      </AdminFormCard>

      <AdminFormCard className="space-y-4">
        <SectionTitle>{labels.sectionAddress}</SectionTitle>
        <LocationFields
          cities={cities}
          countryCode={values.countryCode}
          cityId={values.cityId}
          districtId={values.districtId}
          onDistrictChange={(value) => setField("districtId", value)}
          onDistrictBlur={() => markTouched("districtId")}
          required
          error={errors.districtId}
          labels={{
            district: labels.district,
          }}
        />
        <Field
          label={labels.addressLine1}
          htmlFor="addressLine1"
          size="xl"
          required
          error={errors.addressLine1}
        >
          <TextInput
                  format="address"
            id="addressLine1"
            name="addressLine1"
            value={values.addressLine1}
            onChange={(event) => setField("addressLine1", event.target.value)}
            onBlur={() => markTouched("addressLine1")}
            required
            aria-invalid={Boolean(errors.addressLine1)}
            aria-describedby={
              errors.addressLine1 ? "addressLine1-error" : undefined
            }
          />
        </Field>
        <Field
          label={labels.postalCode}
          htmlFor="postalCode"
          size="sm"
          error={errors.postalCode}
        >
          <TextInput
                  format="postalCode"
            id="postalCode"
            name="postalCode"
            value={values.postalCode}
            onChange={(event) => setField("postalCode", event.target.value)}
            onBlur={() => markTouched("postalCode")}
            aria-invalid={Boolean(errors.postalCode)}
            aria-describedby={
              errors.postalCode ? "postalCode-error" : undefined
            }
          />
        </Field>
      </AdminFormCard>

      <AdminFormCard className="space-y-4">
        <SectionTitle>{labels.sectionBusiness}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Field
            label={labels.legalName}
            htmlFor="legalName"
            size="xl"
            required
            error={errors.legalName}
          >
            <TextInput
                  format="title"
              id="legalName"
              name="legalName"
              value={values.legalName}
              onChange={(event) => setField("legalName", event.target.value)}
              onBlur={() => markTouched("legalName")}
              required
              aria-invalid={Boolean(errors.legalName)}
              aria-describedby={
                errors.legalName ? "legalName-error" : undefined
              }
            />
          </Field>
          <Field label={labels.tradeName} htmlFor="tradeName" size="lg">
            <TextInput
                  format="title"
              id="tradeName"
              name="tradeName"
              value={values.tradeName}
              onChange={(event) => setField("tradeName", event.target.value)}
            />
          </Field>
          <Field
            label={labels.businessPhone}
            htmlFor="businessPhone"
            size="md"
            error={errors.businessPhone}
          >
            <TextInput
                  format="phoneTr"
              id="businessPhone"
              name="businessPhone"
              value={values.businessPhone}
              onChange={(event) =>
                setField("businessPhone", event.target.value)
              }
              onBlur={() => markTouched("businessPhone")}
              aria-invalid={Boolean(errors.businessPhone)}
              aria-describedby={
                errors.businessPhone ? "businessPhone-error" : undefined
              }
            />
          </Field>
        </div>
        <Field label={labels.address} htmlFor="address" size="xl">
          <TextInput
                  format="addressLong"
            id="address"
            name="address"
            value={values.address}
            onChange={(event) => setField("address", event.target.value)}
          />
        </Field>
      </AdminFormCard>

      <AdminFormCard className="space-y-4">
        <SectionTitle>{labels.sectionTax}</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Field
            label={labels.taxOffice}
            htmlFor="taxOffice"
            size="lg"
            required
            error={errors.taxOffice}
          >
            <TextInput
                  format="plainText"
              id="taxOffice"
              name="taxOffice"
              value={values.taxOffice}
              onChange={(event) => setField("taxOffice", event.target.value)}
              onBlur={() => markTouched("taxOffice")}
              required
              aria-invalid={Boolean(errors.taxOffice)}
              aria-describedby={
                errors.taxOffice ? "taxOffice-error" : undefined
              }
            />
          </Field>
          <Field
            label={labels.taxNo}
            htmlFor="taxNo"
            size="md"
            required
            error={errors.taxNo}
          >
            <TextInput
                  format="taxNo"
              id="taxNo"
              name="taxNo"
              value={values.taxNo}
              onChange={(event) =>
                setField("taxNo", event.target.value)
              }
              onBlur={() => markTouched("taxNo")}
              aria-invalid={Boolean(errors.taxNo)}
              aria-describedby={errors.taxNo ? "taxNo-error" : undefined}
            />
          </Field>
        </div>
      </AdminFormCard>

      <AdminFormCard>
        <FormActionAlert
          error={state.error ?? clientErrorSummary?.title}
          errorDetails={clientErrorSummary?.details}
          success={state.success}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={
              pending || (submitAttempted && hasFieldErrors(errors))
            }
          >
            {labels.save}
          </Button>
          <Link
            href={routes.admin.members}
            className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] px-3 text-sm"
          >
            {labels.back}
          </Link>
        </div>
      </AdminFormCard>
    </form>
  );
}
