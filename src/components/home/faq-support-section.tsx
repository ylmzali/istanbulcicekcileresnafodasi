import { PhoneIcon, UserIcon } from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

export function FaqSupportSection() {
  const messages = getMessages();

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] py-14">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.45fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            {messages.faq.title}
          </h2>
          <div className="mt-6 divide-y divide-[var(--color-border)] rounded-[18px] border border-[var(--color-border)] bg-white">
            {messages.faq.items.map((item) => (
              <details
                key={item.question}
                className="group px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-text)]">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span className="text-lg font-normal text-[var(--color-primary-700)] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 pr-8 text-sm leading-6 text-[var(--color-text-muted)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_28px_rgba(23,35,29,0.04)] sm:p-7">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
            <UserIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text)]">
            {messages.supportCta.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            Uzman ekibimiz size yardımcı olmak için hazır.
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
