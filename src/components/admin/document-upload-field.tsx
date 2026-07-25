"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type DocumentUploadLabels = {
  choose: string;
  change: string;
  remove: string;
  uploading: string;
  error: string;
};

type DocumentMeta = {
  fileKey: string;
  fileSize: number | null;
  mimeType: string;
  filename?: string;
};

type DocumentUploadFieldProps = {
  label: string;
  hint?: string;
  value: DocumentMeta;
  onChange: (value: DocumentMeta) => void;
  labels: DocumentUploadLabels;
  required?: boolean;
  className?: string;
};

function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadField({
  label,
  hint,
  value,
  onChange,
  labels,
  required = false,
  className,
}: DocumentUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/resources/upload", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          storageKey: string;
          filename: string;
          mimeType: string;
          size: number;
        };
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || labels.error);
      }

      onChange({
        fileKey: payload.data.storageKey,
        fileSize: payload.data.size,
        mimeType: payload.data.mimeType,
        filename: payload.data.filename,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const displayName =
    value.filename ||
    (value.fileKey ? value.fileKey.split("/").pop() : null) ||
    null;
  const sizeLabel = formatBytes(value.fileSize);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-[var(--color-accent)]" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      </div>

      <input type="hidden" name="fileKey" value={value.fileKey} />
      <input
        type="hidden"
        name="fileSize"
        value={value.fileSize != null ? String(value.fileSize) : ""}
      />
      <input type="hidden" name="mimeType" value={value.mimeType} />

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      <div className="rounded-[14px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4">
        {displayName ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[var(--color-primary-700)] ring-1 ring-[var(--color-border)]">
                <DownloadIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {displayName}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {[value.mimeType, sizeLabel].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? labels.uploading : labels.change}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={uploading}
                onClick={() =>
                  onChange({
                    fileKey: "",
                    fileSize: null,
                    mimeType: "",
                    filename: undefined,
                  })
                }
              >
                {labels.remove}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-text-muted)]">
              {uploading ? labels.uploading : labels.choose}
            </p>
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? labels.uploading : labels.choose}
            </Button>
          </div>
        )}
      </div>

      {hint ? (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-accent)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
