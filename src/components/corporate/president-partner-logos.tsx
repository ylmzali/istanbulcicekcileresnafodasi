import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";

const logoShellClass =
  "inline-flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-[12px] bg-white p-2.5 shadow-[0_6px_16px_rgba(11,61,40,0.08)] ring-1 ring-[var(--color-border)] sm:p-3";

export function PresidentPartnerLogos({
  className,
}: {
  className?: string;
}) {
  const partnerLogos = [
    {
      key: "chamber",
      name: siteConfig.name,
      href: null as string | null,
      src: siteConfig.logo.src,
      alt: siteConfig.logo.alt,
    },
    ...siteConfig.parentOrganizations.map((org) => ({
      key: org.name,
      name: org.name,
      href: org.href,
      src: org.src,
      alt: org.alt,
    })),
  ];

  return (
    <ul
      className={cn(
        "mx-auto grid w-[14rem] shrink-0 grid-cols-2 gap-3 sm:w-[15.5rem] sm:gap-3.5 lg:mx-0",
        className,
      )}
    >
      {partnerLogos.map((org) => {
        const image = (
          <Image
            src={org.src}
            alt={org.alt}
            width={84}
            height={64}
            className="h-[70%] w-[85%] object-contain"
          />
        );

        return (
          <li key={org.key} className="min-w-0">
            {org.href ? (
              <a
                href={org.href}
                target="_blank"
                rel="noopener noreferrer"
                title={org.name}
                className={cn(
                  logoShellClass,
                  "transition hover:ring-[var(--color-primary-100)]",
                )}
              >
                {image}
              </a>
            ) : (
              <span className={logoShellClass} title={org.name}>
                {image}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
