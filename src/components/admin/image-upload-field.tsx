"use client";

import { useCallback, useId, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { MEDIA_PRESETS, type MediaPresetId } from "@/lib/media/presets";
import { cn } from "@/lib/utils";

type UploadLabels = {
  choose: string;
  change: string;
  remove: string;
  cropTitle: string;
  cropConfirm: string;
  cropCancel: string;
  uploading: string;
  error: string;
  zoom: string;
};

type ImageUploadFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  preset: MediaPresetId;
  labels: UploadLabels;
  /** Optional usage/ratio hint shown under the field. */
  hint?: string;
  className?: string;
};

async function cropImageToBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: "image/png" | "image/jpeg" = "image/png",
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("CANVAS_UNAVAILABLE");
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  // Prefer PNG (lossless). JPEG only as fallback at maximum quality.
  const quality = mimeType === "image/jpeg" ? 1 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("BLOB_FAILED"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("IMAGE_LOAD_FAILED")));
    image.src = url;
  });
}

export function ImageUploadField({
  name,
  label,
  value,
  onChange,
  preset,
  labels,
  hint,
  className,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("gorsel.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetConfig = MEDIA_PRESETS[preset];
  const aspect = presetConfig.aspect;
  const previewWidth =
    preset === "hero-media"
      ? 328
      : preset === "hero-image-link"
        ? 576
        : Math.min(presetConfig.maxWidth, 640);
  const previewStyle = {
    width: "100%",
    maxWidth: previewWidth,
    aspectRatio: `${presetConfig.maxWidth} / ${presetConfig.maxHeight}`,
  } as const;

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function resetCropper() {
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }
    setSourceUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }
    setSourceName(file.name || "gorsel.jpg");
    setSourceUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  async function handleConfirmCrop() {
    if (!sourceUrl || !croppedAreaPixels) return;
    setUploading(true);
    setError(null);

    try {
      // Always crop to PNG to avoid a lossy JPEG pass before server processing.
      const blob = await cropImageToBlob(
        sourceUrl,
        croppedAreaPixels,
        "image/png",
      );
      const formData = new FormData();
      formData.append("preset", preset);
      formData.append(
        "file",
        new File(
          [blob],
          sourceName.replace(/\.[^.]+$/, "") + ".png",
          { type: "image/png" },
        ),
      );

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { url?: string };
      };

      if (!response.ok || !payload.success || !payload.data?.url) {
        throw new Error(payload.message || "UPLOAD_FAILED");
      }

      onChange(payload.data.url);
      resetCropper();
    } catch {
      setError(labels.error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <p className="block text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </p>
      {hint ? (
        <p className="text-[11px] leading-4 text-[var(--color-text-muted)]">
          {hint}
        </p>
      ) : null}

      {value ? (
        <div
          className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)]"
          style={previewStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] text-xs text-[var(--color-text-muted)]"
          style={previewStyle}
        >
          {preset === "hero-media"
            ? "328×73"
            : preset === "hero-image-link"
              ? "576×285"
              : preset === "post-cover" || preset === "event-cover"
                ? "16:9 · 1600×900"
                : `${presetConfig.maxWidth}×${presetConfig.maxHeight}`}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {value ? labels.change : labels.choose}
        </Button>
        {value ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange("")}
            disabled={uploading}
          >
            {labels.remove}
          </Button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-accent)]">
          {error}
        </p>
      ) : null}

      {sourceUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${inputId}-crop-title`}
        >
          <div className="w-full max-w-2xl rounded-xl bg-[var(--color-surface)] p-4 shadow-lg">
            <h2
              id={`${inputId}-crop-title`}
              className="mb-1 text-sm font-semibold text-[var(--color-text)]"
            >
              {labels.cropTitle}
            </h2>
            {hint ? (
              <p className="mb-3 text-[11px] text-[var(--color-text-muted)]">
                {hint}
              </p>
            ) : (
              <p className="mb-3 text-[11px] text-[var(--color-text-muted)]">
                {preset === "post-cover" || preset === "event-cover"
                  ? "16:9"
                  : `${presetConfig.maxWidth}×${presetConfig.maxHeight}`}
              </p>
            )}
            <div className="relative h-72 overflow-hidden rounded-lg bg-black sm:h-96">
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <label className="mt-3 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
              <span>{labels.zoom}</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
            </label>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={resetCropper}
                disabled={uploading}
              >
                {labels.cropCancel}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmCrop}
                disabled={uploading || !croppedAreaPixels}
              >
                {uploading ? labels.uploading : labels.cropConfirm}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
