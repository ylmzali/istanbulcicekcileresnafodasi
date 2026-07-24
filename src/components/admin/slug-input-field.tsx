"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Field,
  TextInput,
  type FieldSize,
} from "@/components/admin/form-fields";
import {
  CheckIcon,
  CloseIcon,
  SpinnerIcon,
} from "@/components/ui/icons";
import { slugify } from "@/lib/slug";
import type { SlugCheckScope } from "@/lib/slug-check";

type SlugStatus = "idle" | "checking" | "empty" | "available" | "taken" | "invalid";

type Labels = {
  label: string;
  hint?: string;
  checking: string;
  available: string;
  taken: string;
  invalid: string;
  emptyHint: string;
};

export function SlugInputField({
  id = "slug",
  name = "slug",
  defaultValue = "",
  scope,
  excludeId,
  size = "lg",
  labels,
}: {
  id?: string;
  name?: string;
  defaultValue?: string;
  scope: SlugCheckScope;
  excludeId?: string;
  size?: FieldSize;
  labels: Labels;
}) {
  const reactId = useId();
  const statusId = `${reactId}-slug-status`;
  const requestId = useRef(0);
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<SlugStatus>(
    defaultValue.trim() ? "idle" : "empty",
  );

  async function verify(raw: string) {
    const currentRequest = ++requestId.current;
    const trimmed = raw.trim();

    if (!trimmed) {
      setValue("");
      setStatus("empty");
      return;
    }

    const normalized = slugify(trimmed);
    setValue(normalized);
    setStatus("checking");

    try {
      const params = new URLSearchParams({
        scope,
        slug: normalized,
      });
      if (excludeId) params.set("excludeId", excludeId);

      const response = await fetch(`/api/admin/slugs/check?${params}`, {
        method: "GET",
        credentials: "same-origin",
      });

      if (currentRequest !== requestId.current) return;

      if (!response.ok) {
        setStatus("invalid");
        return;
      }

      const payload = (await response.json()) as {
        success?: boolean;
        data?: { status?: SlugStatus; slug?: string };
      };

      if (!payload.success || !payload.data?.status) {
        setStatus("invalid");
        return;
      }

      if (payload.data.slug && payload.data.slug !== normalized) {
        setValue(payload.data.slug);
      }

      setStatus(payload.data.status);
    } catch {
      if (currentRequest !== requestId.current) return;
      setStatus("invalid");
    }
  }

  useEffect(() => {
    if (defaultValue.trim()) {
      void verify(defaultValue);
    }
    // Initial availability check for existing records only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusMessage =
    status === "checking"
      ? labels.checking
      : status === "available"
        ? labels.available
        : status === "taken"
          ? labels.taken
          : status === "invalid"
            ? labels.invalid
            : status === "empty"
              ? labels.emptyHint
              : "";

  const hint =
    status === "taken" || status === "invalid" || status === "checking"
      ? statusMessage
      : status === "available"
        ? statusMessage
        : status === "empty"
          ? labels.emptyHint
          : labels.hint;

  return (
    <Field label={labels.label} htmlFor={id} size={size} hint={hint || undefined}>
      <div className="relative">
        <TextInput
          id={id}
          name={name}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (status !== "idle" && status !== "checking") {
              setStatus("idle");
            }
          }}
          onBlur={(event) => {
            void verify(event.target.value);
          }}
          autoComplete="off"
          spellCheck={false}
          aria-describedby={statusMessage ? statusId : undefined}
          aria-invalid={status === "taken" || status === "invalid"}
          className="pr-9"
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center"
          aria-hidden
        >
          {status === "checking" ? (
            <SpinnerIcon className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
          ) : status === "available" ? (
            <CheckIcon className="h-4 w-4 text-[var(--color-primary-700)]" />
          ) : status === "taken" || status === "invalid" ? (
            <CloseIcon className="h-4 w-4 text-[var(--color-accent)]" />
          ) : null}
        </span>
        <span id={statusId} className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </span>
      </div>
    </Field>
  );
}
