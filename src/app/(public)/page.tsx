import { AboutSection } from "@/components/home/about-section";
import { DirectorySection } from "@/components/home/directory-section";
import { EventsResourcesSection } from "@/components/home/events-resources-section";
import { FaqSupportSection } from "@/components/home/faq-support-section";
import { HeroSection } from "@/components/home/hero-section";
import { MemberHubSection } from "@/components/home/member-hub-section";
import { NewsSection } from "@/components/home/news-section";
import { PresidentMessageSection } from "@/components/home/president-message-section";
import { StatsSection } from "@/components/home/stats-section";
import { SupportCtaSection } from "@/components/home/support-cta-section";
import {
  getActiveMemberCount,
  getFeaturedAnnouncement,
} from "@/services/home";
import { listUpcomingEvents } from "@/services/events";
import { getHomeNewsFeed, serializeHomeNewsItem } from "@/services/posts";
import { listActiveHeroSlides } from "@/services/banners";
import { listPublicResources } from "@/services/resources";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description:
    "İstanbul Çiçekçiler Esnaf Odası resmi web sitesi. Üyelik işlemleri, duyurular, eğitimler ve kayıtlı çiçekçi rehberi.",
};

export default async function HomePage() {
  const [
    announcement,
    activeMemberCount,
    newsItems,
    upcomingEvents,
    heroSlides,
    resources,
  ] = await Promise.all([
    getFeaturedAnnouncement(),
    getActiveMemberCount(),
    getHomeNewsFeed(4, "all")
      .then((rows) => rows.map(serializeHomeNewsItem))
      .catch(() => []),
    listUpcomingEvents(3).catch(() => []),
    listActiveHeroSlides().catch(() => []),
    listPublicResources(5).catch(() => []),
  ]);

  return (
    <>
      <HeroSection
        slides={heroSlides}
        announcementTitle={announcement?.title}
        announcementHref={announcement?.href}
      />
      <PresidentMessageSection />
      <MemberHubSection />
      <DirectorySection />
      <NewsSection items={newsItems} />
      <EventsResourcesSection events={upcomingEvents} resources={resources} />
      <StatsSection activeMemberCount={activeMemberCount} />
      <AboutSection />
      <FaqSupportSection />
      <SupportCtaSection />
    </>
  );
}
