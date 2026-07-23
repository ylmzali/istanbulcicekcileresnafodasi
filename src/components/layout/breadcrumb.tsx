import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const homeLabel = getMessages().nav.home;
  const trail: BreadcrumbItem[] = [
    { label: homeLabel, href: routes.home },
    ...items,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? {
            item:
              item.href.startsWith("http")
                ? item.href
                : undefined,
          }
        : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Sayfa konumu" className={cn("mb-6", className)}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[var(--color-text-muted)]">
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <span
                    aria-hidden
                    className="mx-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary-700)]"
                  />
                ) : null}
                {isLast || !item.href ? (
                  <span
                    className={cn(
                      isLast && "font-medium text-[var(--color-text)]",
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[var(--color-primary-800)]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
