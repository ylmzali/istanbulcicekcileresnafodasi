export type MediaPresetId =
  | "post-cover"
  | "event-cover"
  | "article-inline"
  | "hero-desktop"
  | "hero-mobile"
  | "hero-media"
  | "hero-image-link";

export type MediaPreset = {
  id: MediaPresetId;
  /** Folder under public/uploads */
  folder: string;
  aspect: number;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  /** Prefer PNG (lossless) after processing. */
  lossless?: boolean;
  /** Avoid secondary crop on server (client already cropped to aspect). */
  fit?: "cover" | "inside";
};

/** Canonical post/announcement cover ratio — keep all public displays in sync. */
export const POST_COVER_ASPECT = 16 / 9;
export const POST_COVER_ASPECT_CLASS = "aspect-[16/9]";

export const MEDIA_PRESETS: Record<MediaPresetId, MediaPreset> = {
  "post-cover": {
    id: "post-cover",
    folder: "covers",
    aspect: POST_COVER_ASPECT,
    maxWidth: 1600,
    maxHeight: 900,
    quality: 95,
    lossless: true,
    fit: "inside",
  },
  "event-cover": {
    id: "event-cover",
    folder: "covers",
    aspect: 16 / 9,
    maxWidth: 1600,
    maxHeight: 900,
    quality: 95,
    lossless: true,
    fit: "inside",
  },
  "article-inline": {
    id: "article-inline",
    folder: "articles",
    aspect: 16 / 9,
    maxWidth: 1400,
    maxHeight: 1400,
    quality: 90,
    fit: "inside",
  },
  "hero-desktop": {
    id: "hero-desktop",
    folder: "hero",
    aspect: 16 / 9,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 84,
  },
  "hero-mobile": {
    id: "hero-mobile",
    folder: "hero",
    aspect: 4 / 5,
    maxWidth: 900,
    maxHeight: 1125,
    quality: 84,
  },
  "hero-media": {
    id: "hero-media",
    folder: "hero",
    aspect: 328 / 73,
    maxWidth: 984,
    maxHeight: 219,
    quality: 100,
  },
  "hero-image-link": {
    id: "hero-image-link",
    folder: "hero",
    aspect: 576 / 285,
    maxWidth: 1728,
    maxHeight: 855,
    quality: 100,
  },
};

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
