import type { Metadata } from "next";
import {
  FaqAccordion,
  FaqCategoryTabs,
  FaqEmptyState,
  FaqGroupedList,
  faqPageJsonLd,
} from "@/components/content/faq-accordion";
import { ContentPageHeader } from "@/components/content/post-list";
import { PhoneIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import { listPublishedFaqGroups, listPublishedFaqs } from "@/services/faqs";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ kategori?: string }>;
};

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Üyelik, belge, aidat ve randevu hakkında İstanbul Çiçekçiler Esnaf Odası sık sorulan sorular.",
};

export default async function FaqsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const messages = getMessages();
  const categorySlug = params.kategori?.trim() || null;

  const [{ categories }, filteredItems, allGroups] = await Promise.all([
    listPublishedFaqGroups(),
    categorySlug
      ? listPublishedFaqs({ categorySlug, limit: 100 })
      : Promise.resolve(null),
    categorySlug ? Promise.resolve(null) : listPublishedFaqGroups(),
  ]);

  const items = filteredItems ?? allGroups?.items ?? [];
  const groups = allGroups?.groups ?? [];
  const hasDbContent = categories.length > 0 || items.length > 0;

  const displayItems =
    hasDbContent || categorySlug
      ? items
      : messages.faq.items.map((item, index) => ({
          id: `fallback-${index}`,
          question: item.question,
          answer: item.answer,
          sortOrder: index,
          category: null,
        }));

  const jsonLdItems = hasDbContent ? items : displayItems;

  return (
    <div className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12">
        <ContentPageHeader
          title={messages.faq.title}
          description={messages.faq.description}
          breadcrumbs={[
            { label: messages.nav.home, href: routes.home },
            { label: messages.nav.faq },
          ]}
        />

        {categories.length > 0 ? (
          <div className="mb-8">
            <FaqCategoryTabs
              categories={categories}
              activeSlug={categorySlug}
              allLabel={messages.faq.allCategories}
            />
          </div>
        ) : null}

        {displayItems.length === 0 ? (
          <FaqEmptyState
            title={messages.faq.emptyTitle}
            description={messages.faq.emptyDescription}
          />
        ) : categorySlug || !hasDbContent ? (
          <FaqAccordion items={displayItems} />
        ) : (
          <FaqGroupedList
            groups={groups}
            uncategorizedLabel={messages.faq.uncategorized}
          />
        )}

        <aside className="mt-10 flex flex-col gap-4 rounded-[18px] border border-[var(--color-border)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              {messages.supportCta.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {messages.supportCta.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-4 text-sm font-semibold text-white"
            >
              <PhoneIcon className="h-4 w-4" />
              {siteConfig.phoneDisplay}
            </a>
            <Link
              href={routes.contact}
              className="inline-flex h-11 items-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text)]"
            >
              {messages.supportCta.contactUs}
            </Link>
          </div>
        </aside>

        {jsonLdItems.length > 0 ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqPageJsonLd(jsonLdItems)),
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
