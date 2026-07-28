import { NotFoundView } from "@/components/content/not-found-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteSearchProvider } from "@/components/layout/site-search";
import { SiteTopBar } from "@/components/layout/site-top-bar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

/** Global unmatched URLs (no route-group layout). */
export default function NotFoundPage() {
  return (
    <SiteSearchProvider>
      <div className="flex min-h-dvh flex-1 flex-col">
        <SiteTopBar />
        <SiteHeader />
        <main id="main-content" className="flex flex-1 flex-col">
          <NotFoundView />
        </main>
        <SiteFooter />
      </div>
    </SiteSearchProvider>
  );
}
