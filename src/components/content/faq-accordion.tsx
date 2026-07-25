import Link from "next/link";
import { ContentFilterTabs } from "@/components/content/post-list";
import type { PublishedFaq, PublishedFaqGroup } from "@/services/faqs";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

export function FaqAccordion({
  items,
  className,
}: {
  items: Array<{ id?: string; question: string; answer: string }>;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "divide-y divide-[var(--color-border)] rounded-[18px] border border-[var(--color-border)] bg-white",
        className,
      )}
    >
      {items.map((item, index) => (
        <details
          key={item.id ?? `${item.question}-${index}`}
          id={item.id}
          className="group scroll-mt-28 px-5 py-4"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-100)]">
            <span className="flex items-center justify-between gap-4">
              {item.question}
              <span
                aria-hidden
                className="text-lg font-normal text-[var(--color-primary-700)] transition group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 pr-8 text-sm leading-6 text-[var(--color-text-muted)] whitespace-pre-line">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function FaqGroupedList({
  groups,
  uncategorizedLabel,
}: {
  groups: PublishedFaqGroup[];
  uncategorizedLabel: string;
}) {
  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const key = group.category?.id ?? "uncategorized";
        const title = group.category?.name ?? uncategorizedLabel;
        return (
          <section key={key} aria-labelledby={`faq-group-${key}`}>
            <h2
              id={`faq-group-${key}`}
              className="mb-3 text-lg font-semibold text-[var(--color-primary-900)]"
            >
              {title}
            </h2>
            <FaqAccordion items={group.items} />
          </section>
        );
      })}
    </div>
  );
}

export function FaqCategoryTabs({
  categories,
  activeSlug,
  allLabel,
  allHref = routes.faq,
}: {
  categories: Array<{ name: string; slug: string; count: number }>;
  activeSlug?: string | null;
  allLabel: string;
  allHref?: string;
}) {
  if (categories.length === 0) return null;

  const activeHref = activeSlug
    ? `${routes.faq}?kategori=${activeSlug}`
    : allHref;

  return (
    <ContentFilterTabs
      activeHref={activeHref}
      items={[
        {
          href: allHref,
          label: allLabel,
        },
        ...categories.map((category) => ({
          href: `${routes.faq}?kategori=${category.slug}`,
          label: category.name,
        })),
      ]}
    />
  );
}

export function FaqEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] px-6 py-10 text-center">
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function faqPageJsonLd(items: PublishedFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function FaqViewAllLink({
  href = routes.faq,
  label,
}: {
  href?: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="mt-5 inline-flex text-sm font-semibold text-[var(--color-primary-800)] hover:underline"
    >
      {label} →
    </Link>
  );
}
