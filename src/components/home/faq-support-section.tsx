import Link from "next/link";
import {
  FaqAccordion,
  FaqViewAllLink,
} from "@/components/content/faq-accordion";
import { FaqIllustration } from "@/components/home/faq-illustration";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
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
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:gap-12">
        <div className="order-2 mx-auto w-full max-w-[360px] lg:order-1 lg:max-w-none">
          <FaqIllustration
            className="h-auto w-full"
            title={messages.faq.title}
          />
        </div>

        <div className="order-1 min-w-0 lg:order-2">
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
      </div>
    </section>
  );
}
