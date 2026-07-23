import { publicSitemapPaths, routes } from "@/lib/routes";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return publicSitemapPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === routes.home ? "daily" : "weekly",
    priority: path === routes.home ? 1 : 0.7,
  }));
}
