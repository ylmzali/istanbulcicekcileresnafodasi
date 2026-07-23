import { InfoIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

type AnnouncementBarProps = {
  title?: string | null;
  href?: string;
};

export function AnnouncementBar({
  title,
  href = routes.news.root,
}: AnnouncementBarProps) {
  const messages = getMessages();
  if (!title) return null;

  return (
    <Link
      href={href}
      className="group block w-full bg-[var(--color-primary-900)] transition-colors duration-300 ease-out hover:bg-[var(--color-primary-800)]"
    >
      <span className="mx-auto flex w-full max-w-[1280px] items-center gap-2.5 px-4 py-2.5 sm:px-6">
        <InfoIcon className="h-4 w-4 shrink-0 text-white/75" />
        <span className="min-w-0 text-[13px] leading-5 text-white/95">
          <span className="mr-2 font-medium tracking-wide text-white/70">
            {messages.announcement.label}
          </span>
          <span className="text-white/90 underline-offset-4 group-hover:underline">
            {title}
          </span>
          <span className="ml-2 whitespace-nowrap font-medium text-white/80">
            {messages.announcement.cta} →
          </span>
        </span>
      </span>
    </Link>
  );
}
