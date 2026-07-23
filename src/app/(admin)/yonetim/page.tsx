import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">
        Yönetim Paneli
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Yetki sistemi ve dashboard sonraki fazlarda eklenecektir.
      </p>
    </div>
  );
}
