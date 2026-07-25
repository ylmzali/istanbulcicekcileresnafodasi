import {
  applyInputFilter,
  applyInputFormat,
  getInputFormat,
  type InputFormatId,
} from "@/lib/input-formats";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm leading-5 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]/70 focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]";

/** Compact widths for short admin controls (status, dates, numbers). */
const fieldSizeClass = {
  sm: "w-full max-w-[8.5rem]",
  md: "w-full max-w-[13.5rem]",
  lg: "w-full max-w-[18rem]",
  xl: "w-full max-w-[28rem]",
  full: "w-full",
} as const;

export type FieldSize = keyof typeof fieldSizeClass;

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  /** Constrain field width — prefer this over stretching short inputs. */
  size?: FieldSize;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  size = "full",
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-1", fieldSizeClass[size], className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-[var(--color-text-muted)]"
      >
        {label}
        {required ? (
          <span
            className="ml-0.5 text-[var(--color-accent)]"
            aria-hidden="true"
          >
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-[11px] leading-4 text-[var(--color-accent)]"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-4 text-[var(--color-text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const invalidFieldClass =
  "border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:ring-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Applies character filter, maxLength, inputMode and related attrs. */
  format?: InputFormatId;
};

type TextTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  format?: InputFormatId;
};

const currencySymbolByCode: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function TextInput({
  className,
  format,
  "aria-invalid": ariaInvalid,
  onChange,
  onBlur,
  maxLength,
  inputMode,
  type,
  autoComplete,
  spellCheck,
  autoCapitalize,
  pattern,
  ...props
}: TextInputProps) {
  const profile = format ? getInputFormat(format) : null;
  const isMoney = format === "money";
  const resolvedType = type ?? profile?.type ?? "text";
  const isNumeric =
    resolvedType === "number" || Boolean(profile?.numericAlign);
  const currencyCode = siteConfig.currency;
  const currencySymbol =
    currencySymbolByCode[currencyCode] ?? currencyCode;

  function emitChange(
    event: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>,
    nextValue: string,
  ) {
    if (event.target.value !== nextValue) {
      event.target.value = nextValue;
    }
    onChange?.(event as ChangeEvent<HTMLInputElement>);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (profile) {
      emitChange(event, applyInputFilter(profile.id, event.target.value));
      return;
    }
    onChange?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (profile) {
      const formatted = applyInputFormat(profile.id, event.target.value);
      emitChange(event, formatted);
    }
    onBlur?.(event);
  }

  const input = (
    <input
      className={cn(
        fieldClass,
        ariaInvalid === true || ariaInvalid === "true"
          ? invalidFieldClass
          : null,
        isMoney ? "pr-8" : null,
        isNumeric ? "text-right tabular-nums" : null,
        className,
      )}
      aria-invalid={ariaInvalid}
      type={resolvedType}
      maxLength={maxLength ?? profile?.maxLength}
      inputMode={inputMode ?? profile?.inputMode}
      autoComplete={autoComplete ?? profile?.autoComplete}
      spellCheck={spellCheck ?? profile?.spellCheck}
      autoCapitalize={autoCapitalize ?? profile?.autoCapitalize}
      pattern={pattern ?? profile?.pattern}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );

  if (!isMoney) return input;

  return (
    <div className="relative">
      {input}
      <span
        className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-[var(--color-text-muted)]"
        aria-hidden
        title={currencyCode}
      >
        {currencySymbol}
      </span>
      <span className="sr-only">{currencyCode}</span>
    </div>
  );
}

export function TextTextarea({
  className,
  format,
  onChange,
  onBlur,
  maxLength,
  spellCheck,
  ...props
}: TextTextareaProps) {
  const profile = format ? getInputFormat(format) : null;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (profile) {
      const filtered = applyInputFilter(profile.id, event.target.value);
      if (event.target.value !== filtered) {
        event.target.value = filtered;
      }
    }
    onChange?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (profile) {
      const formatted = applyInputFormat(profile.id, event.target.value);
      if (event.target.value !== formatted) {
        event.target.value = formatted;
        onChange?.(event as unknown as ChangeEvent<HTMLTextAreaElement>);
      }
    }
    onBlur?.(event);
  }

  return (
    <textarea
      className={cn(fieldClass, "min-h-20 resize-y", className)}
      maxLength={maxLength ?? profile?.maxLength}
      spellCheck={spellCheck ?? profile?.spellCheck}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}

export function TextSelect({
  className,
  children,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        fieldClass,
        ariaInvalid === true || ariaInvalid === "true"
          ? invalidFieldClass
          : null,
        className,
      )}
      aria-invalid={ariaInvalid}
      {...props}
    >
      {children}
    </select>
  );
}

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  /** `onDark`: açık kontrol + koyu zemin (üye hub vb.) */
  tone?: "default" | "onDark";
};

export function Checkbox({
  label,
  className,
  id,
  tone = "default",
  ...props
}: CheckProps) {
  const inputId = id ?? props.name;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-sm leading-none text-[var(--color-text)]",
        tone === "onDark" && "text-white/85",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          "admin-check",
          tone === "onDark" && "admin-check--on-dark",
        )}
        {...props}
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export function Radio({
  label,
  className,
  id,
  tone = "default",
  ...props
}: CheckProps) {
  const inputId = id ?? `${props.name}-${props.value}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-sm leading-none text-[var(--color-text)]",
        tone === "onDark" && "text-white/85",
        className,
      )}
    >
      <input
        id={inputId}
        type="radio"
        className={cn(
          "admin-radio",
          tone === "onDark" && "admin-radio--on-dark",
        )}
        {...props}
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-[var(--color-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-[var(--color-primary-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-900)]">
      {label}
    </span>
  );
}

export function FormActionAlert({
  error,
  errorDetails,
  success,
  successMessage = "Kaydedildi.",
}: {
  error?: string | null;
  errorDetails?: string[] | null;
  success?: boolean;
  successMessage?: string;
}) {
  if (error || (errorDetails && errorDetails.length > 0)) {
    return (
      <div
        role="alert"
        className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] px-3 py-2.5 text-sm text-[var(--color-accent)]"
      >
        {error ? <p className="font-medium">{error}</p> : null}
        {errorDetails && errorDetails.length > 0 ? (
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-5">
            {errorDetails.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (success) {
    return (
      <p
        role="status"
        className="rounded-[10px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,transparent)] bg-[var(--color-primary-100)] px-3 py-2.5 text-sm font-medium text-[var(--color-primary-900)]"
      >
        {successMessage}
      </p>
    );
  }

  return null;
}


export function AdminFormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
