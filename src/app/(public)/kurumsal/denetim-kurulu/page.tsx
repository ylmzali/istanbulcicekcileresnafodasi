import type { Metadata } from "next";
import { BoardSection } from "@/components/corporate/board-members";
import { CorporatePageShell } from "@/components/corporate/corporate-page-shell";
import { auditBoard } from "@/lib/corporate/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Denetim Kurulu",
  description:
    "İstanbul Çiçekçiler Esnaf Odası denetim kurulu başkanı ve asil üyeleri.",
};

export default function AuditBoardPage() {
  const chair = auditBoard.filter((m) => m.role === "audit_chair");
  const members = auditBoard.filter((m) => m.role === "audit_member");

  return (
    <CorporatePageShell
      title="Denetim Kurulu"
      description="Odanın mali ve idari süreçlerini denetleyen kurul üyeleri."
      current={routes.corporate.auditBoard}
      breadcrumbs={[
        { label: "Kurumsal", href: routes.corporate.root },
        { label: "Denetim Kurulu" },
      ]}
    >
      <div className="space-y-14">
        <BoardSection members={chair} lead />
        <BoardSection members={members} />
      </div>
    </CorporatePageShell>
  );
}
