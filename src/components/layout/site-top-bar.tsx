import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export function SiteTopBar() {
  const messages = getMessages();

  return (
    <div className="border-b border-[var(--color-primary-900)]/20 bg-[var(--color-primary-900)] text-white print:hidden">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 sm:text-[13px]">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-1.5 text-white/90 transition hover:text-white"
            aria-label={`${messages.topBar.phoneLabel}: ${siteConfig.phoneDisplay}`}
          >
            <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden font-medium sm:inline">
              {siteConfig.phoneDisplay}
            </span>
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex min-w-0 items-center gap-1.5 text-white/90 transition hover:text-white"
            aria-label={`${messages.topBar.emailLabel}: ${siteConfig.email}`}
          >
            <MailIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium max-sm:max-w-[11rem] md:max-w-none">
              <span className="sm:hidden">E-posta</span>
              <span className="hidden sm:inline">{siteConfig.email}</span>
            </span>
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-white"
            aria-label={messages.topBar.instagram}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/85 transition hover:bg-white/10 hover:text-white"
            aria-label={messages.topBar.facebook}
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
