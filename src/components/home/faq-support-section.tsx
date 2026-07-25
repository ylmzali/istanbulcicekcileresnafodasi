import Link from "next/link";
import {
  FaqAccordion,
  FaqViewAllLink,
} from "@/components/content/faq-accordion";
import { PhoneIcon, UserIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import { listPublishedFaqs } from "@/services/faqs";

export async function FaqSupportSection() {
  const messages = getMessages();
  const published = await listPublishedFaqs({ limit: 6 });

  const items =
    published.length > 0
      ? published.map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        }))
      : messages.faq.items.map((item, index) => ({
          id: `fallback-${index}`,
          question: item.question,
          answer: item.answer,
        }));

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] py-14">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.45fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            {messages.faq.title}
          </h2>
          {messages.faq.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              {messages.faq.description}
            </p>
          ) : null}

          <FaqAccordion items={items} className="mt-6" />

          {published.length > 0 ? (
            <FaqViewAllLink label={messages.faq.viewAll} />
          ) : (
            <Link
              href={routes.faq}
              className="mt-5 inline-flex text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
            >
              {messages.faq.viewAll} →
            </Link>
          )}
        </div>

        <aside className="h-fit rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_28px_rgba(23,35,29,0.04)] sm:p-7">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
            <UserIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)]">
            {messages.supportCta.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            {messages.supportCta.description}
          </p>
          <a
            href={siteConfig.phoneHref}
            className="mt-5 inline-flex items-center gap-2 text-base font-bold text-[var(--color-primary-900)]"
          >
            <PhoneIcon className="h-5 w-5" />
            {siteConfig.phoneDisplay}
          </a>
          <Link
            href={routes.contact}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
          >
            {messages.supportCta.contactUs}
            <span aria-hidden>→</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}
