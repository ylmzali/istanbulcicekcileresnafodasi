import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "Yönetim Paneli",
    template: "%s | Yönetim Paneli",
  },
};

/**
 * Admin route group is fully isolated from the public site chrome
 * (no SiteHeader / SiteFooter). Panel UI lives in AdminShell.
 */
export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-admin-app className="min-h-dvh bg-[var(--color-surface-soft)]">
      {children}
    </div>
  );
}
