"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteMemberAction,
  saveMemberAction,
  type ActionState,
} from "@/app/(admin)/yonetim/member-actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
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
  StatusBadge,
  TextInput,
  TextSelect,
} from "@/components/admin/form-fields";
import { formatDateTime } from "@/lib/datetime";
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

type MemberFormValues = {
  id: string;
  memberNo: string;
  status: string;
  directoryConsent: boolean;
  collectionRef: string;
  registrationDate: string;
  terminationDate: string;
  identityNo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  preferredContact: string;
  addressLine1: string;
  postalCode: string;
  countryCode: string;
  cityId: string;
  email: string;
  phone: string;
  businessId: string;
  legalName: string;
  tradeName: string;
  taxOffice: string;
  taxNo: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  districtId: string;
  address: string;
  directoryVisible: boolean;
  verificationStatus: string;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    reason: string | null;
    createdAt: string;
  }>;
};

type Labels = {
  memberNo: string;
  firstName: string;
  lastName: string;
  identityNo: string;
  email: string;
  phone: string;
  status: string;
  statusReason: string;
  directoryConsent: string;
  collectionRef: string;
  collectionRefHint: string;
  registrationDate: string;
  terminationDate: string;
  birthDate: string;
  preferredContact: string;
  addressLine1: string;
  postalCode: string;
  district: string;
  newPassword: string;
  newPasswordHint: string;
  legalName: string;
  tradeName: string;
  taxOffice: string;
  taxNo: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  address: string;
  directoryVisible: string;
  verificationStatus: string;
  directoryPublishTitle: string;
  directoryPublishReady: string;
  directoryPublishBlocked: string;
  directoryNeedActive: string;
  directoryNeedConsent: string;
  directoryNeedVisible: string;
  directoryNeedVerified: string;
  sectionMembership: string;
  sectionProfile: string;
  sectionContact: string;
  sectionAddress: string;
  sectionTax: string;
  sectionBusiness: string;
  sectionHistory: string;
  preview: string;
  save: string;
  delete: string;
  back: string;
  memberStatuses: Record<string, string>;
  verificationStatuses: Record<string, string>;
};

type EditableValues = {
  status: string;
  statusReason: string;
  directoryConsent: boolean;
  collectionRef: string;
  registrationDate: string;
  terminationDate: string;
  firstName: string;
  lastName: string;
  identityNo: string;
  birthDate: string;
  preferredContact: string;
  addressLine1: string;
  postalCode: string;
  countryCode: string;
  cityId: string;
  districtId: string;
  email: string;
  phone: string;
  newPassword: string;
  legalName: string;
  tradeName: string;
  taxOffice: string;
  taxNo: string;
  businessPhone: string;
  businessEmail: string;
  website: string;
  address: string;
  directoryVisible: boolean;
  verificationStatus: string;
};

type FieldKey = keyof EditableValues;

const initialState: ActionState = {};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[var(--color-border)] pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary-700)]">
      {children}
    </h2>
  );
}

function validateEditField(
  key: FieldKey,
  values: EditableValues,
  originalStatus: string,
) {
  switch (key) {
    case "firstName":
    case "lastName":
    case "addressLine1":
    case "legalName":
    case "taxOffice":
    case "status":
      return validateRequired(values[key]);
    case "email":
    case "businessEmail":
      return validateOptionalEmail(values[key]);
    case "phone":
      return validatePhone(values.phone, { required: true });
    case "businessPhone":
      return validatePhone(values.businessPhone);
    case "newPassword":
      return validatePassword(values.newPassword, { required: false });
    case "identityNo":
      return validateIdentityNo(values.identityNo, { required: true });
    case "taxNo":
      return validateTaxNo(values.taxNo, { required: true });
    case "districtId":
      return validateDistrict(values.districtId);
    case "postalCode":
      return validateOptionalPostalCode(values.postalCode);
    case "statusReason":
      if (values.status !== originalStatus && !values.statusReason.trim()) {
        return "Durum değişikliğinde gerekçe girin.";
      }
      return null;
    default:
      return null;
  }
}

const validatedKeys: FieldKey[] = [
  "status",
  "statusReason",
  "firstName",
  "lastName",
  "identityNo",
  "phone",
  "email",
  "newPassword",
  "districtId",
  "addressLine1",
  "postalCode",
  "legalName",
  "businessPhone",
  "businessEmail",
  "taxOffice",
  "taxNo",
];

export function MemberForm({
  values: initial,
  cities,
  labels,
}: {
  values: MemberFormValues;
  cities: LocationCityOption[];
  labels: Labels;
}) {
  const action = saveMemberAction.bind(null, initial.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [values, setValues] = useState<EditableValues>({
    status: initial.status,
    statusReason: "",
    directoryConsent: initial.directoryConsent,
    collectionRef: initial.collectionRef,
    registrationDate: initial.registrationDate,
    terminationDate: initial.terminationDate,
    firstName: initial.firstName,
    lastName: initial.lastName,
    identityNo: initial.identityNo,
    birthDate: initial.birthDate,
    preferredContact: initial.preferredContact,
    addressLine1: initial.addressLine1,
    postalCode: initial.postalCode,
    countryCode: initial.countryCode,
    cityId: initial.cityId,
    districtId: initial.districtId,
    email: initial.email,
    phone: initial.phone,
    newPassword: "",
    legalName: initial.legalName,
    tradeName: initial.tradeName,
    taxOffice: initial.taxOffice,
    taxNo: initial.taxNo,
    businessPhone: initial.businessPhone,
    businessEmail: initial.businessEmail,
    website: initial.website,
    address: initial.address,
    directoryVisible: initial.directoryVisible,
    verificationStatus: initial.verificationStatus,
  });

  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>(
    {},
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const setField = <K extends FieldKey>(key: K, value: EditableValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      const liveKeys: FieldKey[] = [
        "identityNo",
        "taxNo",
        "email",
        "businessEmail",
        "newPassword",
        "firstName",
        "lastName",
        "phone",
        "districtId",
        "addressLine1",
        "legalName",
        "taxOffice",
        "statusReason",
      ];
      const keysToCheck: FieldKey[] =
        key === "status" ? ["statusReason"] : [key];
      setErrors((prev) => {
        const copy = { ...prev };
        for (const checkKey of keysToCheck) {
          const shouldValidate =
            touched[checkKey] ||
            Boolean(prev[checkKey]) ||
            submitAttempted ||
            key === "status" ||
            (liveKeys.includes(checkKey) &&
              String(next[checkKey]).trim().length > 0);
          if (!shouldValidate) continue;
          const message = validateEditField(checkKey, next, initial.status);
          if (message) copy[checkKey] = message;
          else delete copy[checkKey];
        }
        return copy;
      });
      return next;
    });
  };

  const markTouched = (key: FieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => {
      const message = validateEditField(key, values, initial.status);
      const copy = { ...prev };
      if (message) copy[key] = message;
      else delete copy[key];
      return copy;
    });
  };

  const previewStatus = labels.memberStatuses[values.status] ?? values.status;
  const fullName =
    `${values.firstName} ${values.lastName}`.trim() || "—";

  const fieldLabels = useMemo(
    () => ({
      status: labels.status,
      statusReason: labels.statusReason,
      firstName: labels.firstName,
      lastName: labels.lastName,
      identityNo: labels.identityNo,
      phone: labels.phone,
      email: labels.email,
      newPassword: labels.newPassword,
      districtId: labels.district,
      addressLine1: labels.addressLine1,
      postalCode: labels.postalCode,
      legalName: labels.legalName,
      businessPhone: labels.businessPhone,
      businessEmail: labels.businessEmail,
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
      className="space-y-3"
      noValidate
      onSubmit={(event) => {
        const nextErrors: Partial<Record<FieldKey, string>> = {};
        const nextTouched: Partial<Record<FieldKey, boolean>> = {};
        for (const key of validatedKeys) {
          nextTouched[key] = true;
          const message = validateEditField(key, values, initial.status);
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
      <input type="hidden" name="businessId" value={initial.businessId} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <div className="space-y-4">
          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.sectionMembership}</SectionTitle>
            <div className="flex flex-wrap gap-3">
              <Field label={labels.memberNo} htmlFor="memberNo" size="md">
                <TextInput
                  format="memberNo"
                  id="memberNo"
                  value={initial.memberNo}
                  readOnly
                  className="bg-[var(--color-surface-soft)]"
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
              <Field label={labels.terminationDate} htmlFor="terminationDate" size="md">
                <TextInput
                  id="terminationDate"
                  name="terminationDate"
                  type="date"
                  value={values.terminationDate}
                  onChange={(event) =>
                    setField("terminationDate", event.target.value)
                  }
                />
              </Field>
              <Field
                label={labels.collectionRef}
                htmlFor="collectionRef"
                size="md"
                hint={labels.collectionRefHint}
              >
                <TextInput
                  format="collectionRef"
                  id="collectionRef"
                  name="collectionRef"
                  value={values.collectionRef}
                  onChange={(event) =>
                    setField("collectionRef", event.target.value)
                  }
                />
              </Field>
            </div>
            {values.status !== initial.status ? (
              <Field
                label={labels.statusReason}
                htmlFor="statusReason"
                size="xl"
                required
                error={errors.statusReason}
              >
                <TextInput
                  format="note"
                  id="statusReason"
                  name="statusReason"
                  placeholder="Durum değişikliği gerekçesi"
                  value={values.statusReason}
                  onChange={(event) =>
                    setField("statusReason", event.target.value)
                  }
                  onBlur={() => markTouched("statusReason")}
                  aria-invalid={Boolean(errors.statusReason)}
                  aria-describedby={
                    errors.statusReason ? "statusReason-error" : undefined
                  }
                />
              </Field>
            ) : (
              <input type="hidden" name="statusReason" value="" />
            )}
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.directoryPublishTitle}</SectionTitle>
            {(() => {
              const missing = [
                values.status !== "active" ? labels.directoryNeedActive : null,
                !values.directoryConsent ? labels.directoryNeedConsent : null,
                !values.directoryVisible ? labels.directoryNeedVisible : null,
                values.verificationStatus !== "verified"
                  ? labels.directoryNeedVerified
                  : null,
              ].filter(Boolean) as string[];
              return missing.length === 0 ? (
                <p className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,transparent)] bg-[var(--color-primary-100)] px-3 py-2.5 text-sm font-medium text-[var(--color-primary-900)]">
                  {labels.directoryPublishReady}
                </p>
              ) : (
                <div
                  role="status"
                  className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] px-3 py-2.5 text-sm text-[var(--color-accent)]"
                >
                  <p className="font-medium">{labels.directoryPublishBlocked}</p>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px]">
                    {missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })()}
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
                  onChange={(event) =>
                    setField("firstName", event.target.value)
                  }
                  onBlur={() => markTouched("firstName")}
                  required
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={
                    errors.firstName ? "firstName-error" : undefined
                  }
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
                  aria-describedby={
                    errors.lastName ? "lastName-error" : undefined
                  }
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
              <Field label={labels.birthDate} htmlFor="birthDate" size="md">
                <TextInput
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={values.birthDate}
                  onChange={(event) =>
                    setField("birthDate", event.target.value)
                  }
                />
              </Field>
              <Field label={labels.preferredContact} htmlFor="preferredContact" size="md">
                <TextInput
                  format="plainText"
                  id="preferredContact"
                  name="preferredContact"
                  value={values.preferredContact}
                  onChange={(event) =>
                    setField("preferredContact", event.target.value)
                  }
                  placeholder="telefon / e-posta"
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
                onChange={(event) =>
                  setField("addressLine1", event.target.value)
                }
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
                onChange={(event) =>
                  setField("postalCode", event.target.value)
                }
                onBlur={() => markTouched("postalCode")}
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={
                  errors.postalCode ? "postalCode-error" : undefined
                }
              />
            </Field>
          </AdminFormCard>

          <AdminFormCard className="space-y-4">
            <SectionTitle>{labels.sectionContact}</SectionTitle>
            <div className="flex flex-wrap gap-3">
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
                  required
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
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
            </div>
            <Field
              label={labels.newPassword}
              htmlFor="newPassword"
              size="lg"
              hint={errors.newPassword ? undefined : labels.newPasswordHint}
              error={errors.newPassword}
            >
              <TextInput
                  format="password"
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                value={values.newPassword}
                onChange={(event) =>
                  setField("newPassword", event.target.value)
                }
                onBlur={() => markTouched("newPassword")}
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={
                  errors.newPassword ? "newPassword-error" : undefined
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
                  onChange={(event) =>
                    setField("legalName", event.target.value)
                  }
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
                  onChange={(event) =>
                    setField("tradeName", event.target.value)
                  }
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3">
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
              <Field
                label={labels.businessEmail}
                htmlFor="businessEmail"
                size="lg"
                error={errors.businessEmail}
              >
                <TextInput
                  format="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={values.businessEmail}
                  onChange={(event) =>
                    setField("businessEmail", event.target.value)
                  }
                  onBlur={() => markTouched("businessEmail")}
                  aria-invalid={Boolean(errors.businessEmail)}
                  aria-describedby={
                    errors.businessEmail ? "businessEmail-error" : undefined
                  }
                />
              </Field>
              <Field label={labels.website} htmlFor="website" size="lg">
                <TextInput
                  format="url"
                  id="website"
                  name="website"
                  value={values.website}
                  onChange={(event) => setField("website", event.target.value)}
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
                  onChange={(event) =>
                    setField("taxOffice", event.target.value)
                  }
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

          {initial.statusHistory.length > 0 ? (
            <AdminFormCard className="space-y-3">
              <SectionTitle>{labels.sectionHistory}</SectionTitle>
              <ul className="space-y-2">
                {initial.statusHistory.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        label={
                          labels.memberStatuses[item.toStatus] ?? item.toStatus
                        }
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    {item.reason ? (
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {item.reason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </AdminFormCard>
          ) : null}

          <AdminFormCard>
            <FormActionAlert
              error={state.error ?? clientErrorSummary?.title}
              errorDetails={state.errorDetails ?? clientErrorSummary?.details}
              success={state.success}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
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
              <ConfirmDeleteButton
                label={labels.delete}
                action={deleteMemberAction.bind(null, initial.id)}
              />
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
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-primary-800)]">
              {initial.memberNo}
            </p>
            <h2 className="text-lg font-semibold leading-snug text-[var(--color-text)]">
              {fullName}
            </h2>
            {values.legalName || values.tradeName ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                {values.tradeName || values.legalName}
              </p>
            ) : null}
          </AdminFormCard>
        </aside>
      </div>
    </form>
  );
}
