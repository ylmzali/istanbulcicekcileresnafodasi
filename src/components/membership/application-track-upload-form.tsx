"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applicationMarkCompleteAction,
  applicationTrackDocumentAction,
  type ApplicationMarkCompleteState,
  type ApplicationTrackDocsState,
} from "@/app/(public)/membership-application-actions";
import { FormActionAlert } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";

type ChecklistItem = {
  slug: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  uploadedAt: Date | string | null;
};

function SingleDocumentUploadRow({
  trackingNo,
  item,
}: {
  trackingNo: string;
  item: ChecklistItem;
}) {
  const t = getMessages().membershipApplication;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    applicationTrackDocumentAction,
    {} as ApplicationTrackDocsState,
  );
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (state.ok) {
      setFileName("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <li className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {item.name}
            {item.required ? (
              <span className="text-[var(--color-accent)]"> *</span>
            ) : (
              <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
                ({t.optional})
              </span>
            )}
          </p>
          {item.uploaded ? (
            <p className="mt-1 text-xs font-medium text-[var(--color-primary-800)]">
              {t.docUploaded}
              {item.uploadedAt
                ? ` · ${formatDateTime(new Date(item.uploadedAt))}`
                : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {t.docPending}
            </p>
          )}
        </div>

        <form action={formAction} className="flex flex-col items-end gap-2">
          <input type="hidden" name="trackingNo" value={trackingNo} />
          <input type="hidden" name="documentSlug" value={item.slug} />
          <input
            ref={inputRef}
            name="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            required
            className="block w-full max-w-[14rem] text-xs text-[var(--color-text-muted)] file:mr-2 file:rounded-md file:border-0 file:bg-[var(--color-primary-100)] file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-primary-900)]"
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? "");
            }}
          />
          {fileName ? (
            <p className="max-w-[14rem] truncate text-[11px] text-[var(--color-text-muted)]">
              {fileName}
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            {pending
              ? t.submitting
              : item.uploaded
                ? t.docReplace
                : t.docUpload}
          </Button>
          {state.error ? (
            <p className="text-xs text-[var(--color-accent)]" role="alert">
              {state.error}
            </p>
          ) : null}
        </form>
      </div>
    </li>
  );
}

function MarkCompleteButton({ trackingNo }: { trackingNo: string }) {
  const t = getMessages().membershipApplication;
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    applicationMarkCompleteAction,
    {} as ApplicationMarkCompleteState,
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="trackingNo" value={trackingNo} />
      <FormActionAlert error={state.error} />
      <Button type="submit" disabled={pending} className="min-w-[220px]">
        {pending ? t.submitting : t.markComplete}
      </Button>
    </form>
  );
}

export function ApplicationDocumentChecklist({
  trackingNo,
  checklist,
  canUpload,
  canMarkComplete,
  uploadedRequiredCount,
  requiredCount,
}: {
  trackingNo: string;
  checklist: ChecklistItem[];
  canUpload: boolean;
  canMarkComplete: boolean;
  uploadedRequiredCount: number;
  requiredCount: number;
}) {
  const t = getMessages().membershipApplication;

  if (!canUpload) {
    return (
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
          {t.trackUploadTitle}
        </h2>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li
              key={item.slug}
              className="flex items-center justify-between rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm"
            >
              <span>{item.name}</span>
              <span
                className={
                  item.uploaded
                    ? "text-xs font-medium text-[var(--color-primary-800)]"
                    : "text-xs text-[var(--color-text-muted)]"
                }
              >
                {item.uploaded ? t.docUploaded : t.docPending}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-primary-900)]">
          {t.trackUploadTitle}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {t.trackUploadHint}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--color-primary-800)]">
          {t.docProgress
            .replace("{uploaded}", String(uploadedRequiredCount))
            .replace("{total}", String(requiredCount))}
        </p>
      </div>

      <ul className="space-y-3">
        {checklist.map((item) => (
          <SingleDocumentUploadRow
            key={item.slug}
            trackingNo={trackingNo}
            item={item}
          />
        ))}
      </ul>

      {canMarkComplete ? (
        <div className="rounded-[12px] border border-[color-mix(in_srgb,var(--color-primary-700)_30%,transparent)] bg-[var(--color-primary-100)] px-4 py-4">
          <p className="mb-3 text-sm text-[var(--color-primary-900)]">
            {t.markCompleteHint}
          </p>
          <MarkCompleteButton trackingNo={trackingNo} />
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          {t.markCompleteLocked}
        </p>
      )}
    </section>
  );
}
