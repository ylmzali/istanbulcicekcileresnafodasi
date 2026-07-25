import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, StatusBadge } from "@/components/admin/form-fields";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { getAdminDashboardStats } from "@/services/admin-dashboard";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export default async function AdminDashboardPage() {
  const a = getMessages().admin;
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: a.stats.pendingApplications, value: stats.pendingApplications },
    { label: a.stats.missingDocuments, value: stats.missingDocumentApplications },
    { label: a.stats.newContactSubmissions, value: stats.newContactSubmissions },
    { label: a.stats.openSupport, value: stats.openSupportRequests },
    { label: a.stats.overdueDues, value: stats.overdueDues },
  ];

  return (
    <div>
      <AdminPageHeader title={a.dashboard} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <p className="text-sm text-[var(--color-text-muted)]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-primary-900)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {a.stats.recentPosts}
          </h2>
          <Link
            href={routes.admin.posts}
            className="text-sm font-medium text-[var(--color-primary-800)] hover:underline"
          >
            {a.posts}
          </Link>
        </div>

        {stats.recentPosts.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">{a.empty}</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {stats.recentPosts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    href={routes.admin.postEdit(post.id)}
                    className="block truncate font-medium text-[var(--color-text)] hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {a.postTypes[post.type as keyof typeof a.postTypes] ?? post.type}
                    {" · "}
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
                <StatusBadge
                  label={
                    a.statuses[post.status as keyof typeof a.statuses] ?? post.status
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
