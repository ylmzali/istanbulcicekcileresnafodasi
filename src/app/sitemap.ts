import { postHref } from "@/lib/content-paths";
import { publicSitemapPaths, routes } from "@/lib/routes";
import { listPublishedEventSlugs } from "@/services/events";
import { listPublishedPostSlugs } from "@/services/posts";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const staticEntries: MetadataRoute.Sitemap = publicSitemapPaths.map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === routes.home ? "daily" : "weekly",
      priority: path === routes.home ? 1 : 0.7,
    }),
  );

  let posts: Awaited<ReturnType<typeof listPublishedPostSlugs>> = [];
  let events: Awaited<ReturnType<typeof listPublishedEventSlugs>> = [];

  try {
    [posts, events] = await Promise.all([
      listPublishedPostSlugs(),
      listPublishedEventSlugs(),
    ]);
  } catch {
    // DB may be unavailable during build; keep static routes.
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}${postHref(post.type, post.slug)}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}${routes.events.detail(event.slug)}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...eventEntries];
}
