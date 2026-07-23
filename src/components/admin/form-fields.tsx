import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm leading-5 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]/70 focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, htmlFor, hint, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-[var(--color-text-muted)]"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-[11px] leading-4 text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function TextTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldClass, "min-h-20 resize-y", className)} {...props} />
  );
}

export function TextSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClass, className)} {...props}>
      {children}
    </select>
  );
}

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ label, className, id, ...props }: CheckProps) {
  const inputId = id ?? props.name;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        className="admin-check"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function Radio({ label, className, id, ...props }: CheckProps) {
  const inputId = id ?? `${props.name}-${props.value}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]",
        className,
      )}
    >
      <input id={inputId} type="radio" className="admin-radio" {...props} />
      <span>{label}</span>
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
