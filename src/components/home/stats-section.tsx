import {
  MapPinIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import { experienceYears } from "@/lib/utils";
import type { ReactNode } from "react";

type StatsSectionProps = {
  activeMemberCount?: number | null;
};

export function StatsSection({ activeMemberCount = null }: StatsSectionProps) {
  const messages = getMessages();
  const years = experienceYears(siteConfig.foundedYear);

  const items: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }> = [
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: `${years} ${messages.stats.experience}`,
      description: `${siteConfig.foundedYear}'dan beri sektörümüzün yanındayız.`,
    },
    {
      icon: <UserIcon className="h-6 w-6" />,
      title:
        typeof activeMemberCount === "number" && activeMemberCount > 0
          ? `${activeMemberCount.toLocaleString("tr-TR")} ${messages.stats.members}`
          : messages.stats.members,
      description: "Güçlü ve geniş üye ağımızla birlikteyiz.",
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: `${siteConfig.istanbulDistrictCount} ${messages.stats.districts}`,
      description: "İstanbul’un tüm ilçelerinde etkin temsil.",
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: messages.stats.solidarity,
      description: "Birlikte daha güçlü, birlikte daha ileri.",
    },
  ];

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-primary-900)] py-10 text-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-3 px-4 sm:gap-4 sm:px-6 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[16px] border border-white/10 bg-white/5 px-5 py-5"
          >
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/10">
              {item.icon}
            </div>
            <p className="text-base font-bold">{item.title}</p>
            <p className="mt-1.5 text-sm leading-6 text-white/75">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
