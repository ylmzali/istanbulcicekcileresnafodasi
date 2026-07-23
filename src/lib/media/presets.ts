export type MediaPresetId = "post-cover" | "event-cover";

export type MediaPreset = {
  id: MediaPresetId;
  /** Folder under public/uploads */
  folder: string;
  aspect: number;
  maxWidth: number;
  maxHeight: number;
  quality: number;
};

export const MEDIA_PRESETS: Record<MediaPresetId, MediaPreset> = {
  "post-cover": {
    id: "post-cover",
    folder: "covers",
    aspect: 16 / 9,
    maxWidth: 1200,
    maxHeight: 675,
    quality: 82,
  },
  "event-cover": {
    id: "event-cover",
    folder: "covers",
    aspect: 16 / 9,
    maxWidth: 1200,
    maxHeight: 675,
    quality: 82,
  },
};

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
