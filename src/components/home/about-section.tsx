import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";

export function AboutSection() {
  const messages = getMessages();

  return (
    <section className="border-b border-[var(--color-border)] bg-white py-14">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-900)] sm:text-3xl">
            {messages.about.title}
          </h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            {messages.about.description}
          </p>
          <ul className="mt-6 space-y-3">
            {messages.about.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm text-[var(--color-text)]"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-800)] text-[11px] font-bold text-white">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={routes.corporate.root}
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white hover:bg-[var(--color-primary-700)]"
          >
            {messages.about.cta}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[22px] shadow-[0_18px_40px_rgba(23,35,29,0.08)]">
          <Image
            src={siteConfig.heroImage.src}
            alt="Oda faaliyetlerinden bir görünüm"
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
