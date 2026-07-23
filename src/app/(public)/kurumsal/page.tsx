import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurumsal",
  description: "İstanbul Çiçekçiler Esnaf Odası hakkında kurumsal bilgiler.",
};

export default function CorporatePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-[var(--color-text)]">
        Kurumsal
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Oda hakkında, başkanın mesajı, yönetim kurulu ve diğer kurumsal
        içerikler bu alanda yönetilebilir hale getirilecektir.
      </p>
    </div>
  );
}
