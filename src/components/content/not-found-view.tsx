import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function NotFoundView() {
  const messages = getMessages();

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-surface-soft)]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-sm font-bold tracking-[0.16em] text-[var(--color-primary-700)] uppercase">
          {messages.notFound.code}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
          {messages.notFound.title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-muted)]">
          {messages.notFound.description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={routes.home}
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-800)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            {messages.notFound.home}
          </Link>
          <Link
            href={routes.contact}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary-100)]"
          >
            {messages.notFound.contact}
          </Link>
          <Link
            href={routes.search}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary-100)]"
          >
            {messages.notFound.search}
          </Link>
        </div>
      </div>
    </div>
  );
}
