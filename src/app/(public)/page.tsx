import { AboutSection } from "@/components/home/about-section";
import { DirectorySection } from "@/components/home/directory-section";
import { EventsResourcesSection } from "@/components/home/events-resources-section";
import { FaqSupportSection } from "@/components/home/faq-support-section";
import { HeroSection } from "@/components/home/hero-section";
import { MemberHubSection } from "@/components/home/member-hub-section";
import { NewsSection } from "@/components/home/news-section";
import { StatsSection } from "@/components/home/stats-section";
import { SupportCtaSection } from "@/components/home/support-cta-section";
import { routes } from "@/lib/routes";
import {
  getActiveMemberCount,
  getFeaturedAnnouncement,
} from "@/services/home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description:
    "İstanbul Çiçekçiler Esnaf Odası resmi web sitesi. Üyelik işlemleri, duyurular, eğitimler ve kayıtlı çiçekçi rehberi.",
};

export default async function HomePage() {
  const [announcement, activeMemberCount] = await Promise.all([
    getFeaturedAnnouncement(),
    getActiveMemberCount(),
  ]);

  return (
    <>
      <HeroSection
        announcementTitle={
          announcement?.title ??
          "Aidat ödemeleri ve üyelik işlemleri için online hizmetlerimizi kullanabilirsiniz."
        }
        announcementHref={announcement?.href ?? routes.news.root}
      />
      <MemberHubSection />
      <DirectorySection />
      <NewsSection />
      <EventsResourcesSection />
      <StatsSection activeMemberCount={activeMemberCount} />
      <AboutSection />
      <FaqSupportSection />
      <SupportCtaSection />
    </>
  );
}
