import { z } from "zod";

export const slugCheckScopeSchema = z.enum([
  "post",
  "event",
  "faq_category",
  "resource",
]);

export type SlugCheckScope = z.infer<typeof slugCheckScopeSchema>;

export type SlugCheckResult =
  | { status: "empty"; slug: ""; available: true }
  | { status: "invalid"; slug: string; available: false }
  | { status: "available"; slug: string; available: true }
  | { status: "taken"; slug: string; available: false };
