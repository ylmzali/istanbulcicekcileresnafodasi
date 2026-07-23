import { getMessages } from "@/lib/i18n";
import { memberLoginHref, routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const messages = getMessages();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--color-primary-900)] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.logo.alt}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full bg-white object-cover"
            />
            <p className="text-sm font-semibold tracking-wide">
              {messages.brand.name}
            </p>
          </div>
          <p className="text-sm leading-6 text-white/75">{messages.footer.about}</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">
            {messages.footer.quickLinks}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href={routes.corporate.root} className="hover:text-white">
                {messages.nav.corporate}
              </Link>
            </li>
            <li>
              <Link href={routes.news.root} className="hover:text-white">
                {messages.nav.news}
              </Link>
            </li>
            <li>
              <Link href={routes.trainings} className="hover:text-white">
                {messages.nav.trainings}
              </Link>
            </li>
            <li>
              <Link href={routes.legislation} className="hover:text-white">
                {messages.nav.legislation}
              </Link>
            </li>
            <li>
              <Link href={routes.contact} className="hover:text-white">
                {messages.nav.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">
            {messages.footer.memberServices}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href={routes.member.login} className="hover:text-white">
                {messages.nav.memberLogin}
              </Link>
            </li>
            <li>
              <Link href={routes.membership.apply} className="hover:text-white">
                {messages.memberHub.cards.membershipApplication.title}
              </Link>
            </li>
            <li>
              <Link href={memberLoginHref("aidat")} className="hover:text-white">
                {messages.memberHub.cards.dues.title}
              </Link>
            </li>
            <li>
              <Link
                href={routes.documentVerification}
                className="hover:text-white"
              >
                {messages.nav.documentVerification}
              </Link>
            </li>
            <li>
              <Link href={routes.florists} className="hover:text-white">
                {messages.directory.title}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">{messages.footer.contact}</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{siteConfig.address}</li>
            <li>
              <a href={siteConfig.phoneHref} className="hover:text-white">
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-white"
              >
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {siteConfig.name}. {messages.footer.rights}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={routes.legal.kvkk} className="hover:text-white">
              {messages.footer.kvkk}
            </Link>
            <Link href={routes.legal.privacy} className="hover:text-white">
              {messages.footer.privacy}
            </Link>
            <Link href={routes.legal.cookies} className="hover:text-white">
              {messages.footer.cookies}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
