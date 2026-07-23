import { prisma } from "@/lib/db";
import { routes } from "@/lib/routes";
import { isValidSlug } from "@/lib/slug";

export async function getFeaturedAnnouncement() {
  try {
    const post = await prisma.post.findFirst({
      where: {
        type: "announcement",
        status: "published",
        featured: true,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ publishedAt: "desc" }],
      select: {
        title: true,
        slug: true,
      },
    });

    if (!post) return null;

    const href = isValidSlug(post.slug)
      ? routes.announcements.detail(post.slug)
      : routes.announcements.root;

    return {
      title: post.title,
      href,
    };
  } catch {
    return null;
  }
}

export async function getActiveMemberCount() {
  try {
    return await prisma.member.count({
      where: {
        status: "active",
        deletedAt: null,
      },
    });
  } catch {
    return null;
  }
}
