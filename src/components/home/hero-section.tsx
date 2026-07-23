import { AnnouncementBar } from "@/components/home/announcement-bar";
import { HeroSlider } from "@/components/home/hero-slider";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import Image from "next/image";

type HeroSectionProps = {
  announcementTitle?: string | null;
  announcementHref?: string;
};

export function HeroSection({
  announcementTitle,
  announcementHref = routes.news.root,
}: HeroSectionProps) {
  return (
    <section className="relative isolate w-full overflow-hidden text-white">
      <Image
        src={siteConfig.heroImage.src}
        alt={siteConfig.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(11,61,40,0.88)_0%,rgba(11,61,40,0.68)_48%,rgba(11,61,40,0.28)_100%)]" />

      <div className="relative flex min-h-[300px] w-full flex-col sm:min-h-[340px] lg:min-h-[380px]">
        <AnnouncementBar title={announcementTitle} href={announcementHref} />

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <HeroSlider />
        </div>
      </div>
    </section>
  );
}
