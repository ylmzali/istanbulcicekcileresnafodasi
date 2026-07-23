"use client";

type AutoSubmitSelectProps = {
  name: string;
  label: string;
  defaultValue?: string;
  allLabel: string;
  options: Array<{ value: string; label: string }>;
};

export function AutoSubmitSelect({
  name,
  label,
  defaultValue = "",
  allLabel,
  options,
}: AutoSubmitSelectProps) {
  return (
    <label className="min-w-[140px] space-y-1">
      <span className="block text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-sm outline-none focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
