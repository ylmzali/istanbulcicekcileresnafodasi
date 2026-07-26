"use client";

import { useActionState, useRef, useState } from "react";
import {
  uploadReceiptFileAction,
  type ActionState,
} from "@/app/(admin)/yonetim/dues-actions";
import { FormActionAlert } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 10 * 1024 * 1024;
const initialState: ActionState = {};

type ReceiptUploadFormProps = {
  paymentId: string;
  dueId: string;
  hasFile: boolean;
  downloadHref?: string | null;
  labels: {
    upload: string;
    replace: string;
    download: string;
    hint: string;
    choose: string;
  };
};

export function ReceiptUploadForm({
  paymentId,
  dueId,
  hasFile,
  downloadHref,
  labels,
}: ReceiptUploadFormProps) {
  const action = uploadReceiptFileAction.bind(null, paymentId, dueId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-2">
      <FormActionAlert
        error={clientError || state.error}
        success={!clientError && state.success}
        successMessage={state.message}
      />
      {hasFile && downloadHref ? (
        <a
          href={downloadHref}
          className="inline-flex text-xs font-semibold text-[var(--color-primary-800)] hover:underline"
        >
          {labels.download}
        </a>
      ) : null}
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          const input = formRef.current?.elements.namedItem(
            "file",
          ) as HTMLInputElement | null;
          const file = input?.files?.[0];
          if (!file) {
            setClientError("Lütfen bir dosya seçin.");
            event.preventDefault();
            return;
          }
          if (file.size > MAX_BYTES) {
            setClientError("Dosya en fazla 10 MB olabilir.");
            event.preventDefault();
            return;
          }
          setClientError(null);
        }}
      >
        <label className="min-w-[12rem] flex-1 text-xs">
          <span className="mb-1 block font-medium text-[var(--color-text-muted)]">
            {labels.choose}
          </span>
          <input
            type="file"
            name="file"
            accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
            required
            className="block w-full text-xs text-[var(--color-text)] file:mr-2 file:rounded-md file:border-0 file:bg-[var(--color-primary-100)] file:px-2 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-primary-900)]"
          />
        </label>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "…" : hasFile ? labels.replace : labels.upload}
        </Button>
      </form>
      <p className="text-[11px] text-[var(--color-text-muted)]">{labels.hint}</p>
    </div>
  );
}
