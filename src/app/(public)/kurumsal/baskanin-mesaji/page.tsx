import type { Metadata } from "next";
import { CorporatePageShell } from "@/components/corporate/corporate-page-shell";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Başkanın Mesajı",
  description: "İstanbul Çiçekçiler Esnaf Odası başkanının mesajı.",
};

export default function PresidentMessagePage() {
  return (
    <CorporatePageShell
      title="Başkanın Mesajı"
      description="Başkanın kurumsal mesajı yakında bu sayfada yer alacaktır."
      current={routes.corporate.presidentMessage}
      breadcrumbs={[
        { label: "Kurumsal", href: routes.corporate.root },
        { label: "Başkanın Mesajı" },
      ]}
    >
      <div className="mx-auto max-w-2xl py-6 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[var(--color-primary-100)] ring-1 ring-[var(--color-border)]" />
        <p className="text-[15px] leading-7 text-[var(--color-text-muted)]">
          Mesaj metni onay sürecinin ardından burada yayınlanacaktır.
        </p>
      </div>
    </CorporatePageShell>
  );
}
