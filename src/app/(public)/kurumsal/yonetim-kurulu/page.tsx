import type { Metadata } from "next";
import { BoardSection } from "@/components/corporate/board-members";
import { CorporatePageShell } from "@/components/corporate/corporate-page-shell";
import { managementBoard } from "@/lib/corporate/content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Yönetim Kurulu",
  description:
    "İstanbul Çiçekçiler Esnaf Odası yönetim kurulu başkanı, başkan vekili ve asil üyeleri.",
};

export default function BoardPage() {
  const president = managementBoard.filter((m) => m.role === "president");
  const vice = managementBoard.filter((m) => m.role === "vice_president");
  const members = managementBoard.filter((m) => m.role === "member");

  return (
    <CorporatePageShell
      title="Yönetim Kurulu"
      description="Genel kurulda seçilen güncel dönem yönetim kurulu."
      current={routes.corporate.board}
      breadcrumbs={[
        { label: "Kurumsal", href: routes.corporate.root },
        { label: "Yönetim Kurulu" },
      ]}
    >
      <div className="space-y-14">
        <BoardSection members={president} lead />
        <BoardSection members={vice} lead />
        <BoardSection members={members} />
      </div>
    </CorporatePageShell>
  );
}
