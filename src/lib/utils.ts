import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function experienceYears(foundedYear: number, now = new Date()) {
  return Math.max(0, now.getFullYear() - foundedYear);
}

export {
  assetFilenameSchema,
  isValidAssetFilename,
  isValidSlug,
  slugify,
  slugifyAssetFilename,
  slugSchema,
} from "@/lib/slug";
