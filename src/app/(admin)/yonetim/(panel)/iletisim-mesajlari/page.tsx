import type { Metadata } from "next";
import { AdminPageHeader, StatusBadge } from "@/components/admin/form-fields";
import { formatDateTime } from "@/lib/datetime";
import { getMessages } from "@/lib/i18n";
import { listContactSubmissions } from "@/services/contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim Mesajları",
  robots: { index: false, follow: false },
};

export default async function ContactSubmissionsPage() {
  const a = getMessages().admin;
  const result = await listContactSubmissions({ pageSize: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={a.contactSubmissions}
        description={`Site iletişim formundan gelen mesajlar. Toplam ${result.total} kayıt.`}
      />

      {result.rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
          {a.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {result.rows.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {row.subject || "Konusuz"}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                    {row.name} · {row.email}
                    {row.phone ? ` · ${row.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={row.status === "new" ? "Yeni" : row.status}
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatDateTime(row.createdAt)}
                  </span>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--color-text)]">
                {row.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
