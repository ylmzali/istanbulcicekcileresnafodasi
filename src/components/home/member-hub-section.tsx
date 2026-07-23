import {
  CalendarIcon,
  FileCheckIcon,
  InfoIcon,
  ShieldCheckIcon,
  UserIcon,
  WalletIcon,
} from "@/components/ui/icons";
import { getMessages } from "@/lib/i18n";
import {
  memberLoginHref,
  routes,
  type MemberLoginReturnKey,
} from "@/lib/routes";
import Link from "next/link";
import type { ReactNode } from "react";

const cards: Array<{
  key:
    | "membershipApplication"
    | "documentRequest"
    | "dues"
    | "verification"
    | "appointment"
    | "information";
  href: string;
  loginReturn?: MemberLoginReturnKey;
  icon: ReactNode;
  number: number;
}> = [
  {
    key: "membershipApplication",
    href: routes.membership.apply,
    icon: <UserIcon className="h-5 w-5" />,
    number: 1,
  },
  {
    key: "documentRequest",
    href: routes.member.documentRequest,
    loginReturn: "belge-talebi",
    icon: <FileCheckIcon className="h-5 w-5" />,
    number: 2,
  },
  {
    key: "dues",
    href: routes.member.dues,
    loginReturn: "aidat",
    icon: <WalletIcon className="h-5 w-5" />,
    number: 3,
  },
  {
    key: "verification",
    href: routes.documentVerification,
    icon: <ShieldCheckIcon className="h-5 w-5" />,
    number: 4,
  },
  {
    key: "appointment",
    href: routes.member.appointment,
    loginReturn: "randevu",
    icon: <CalendarIcon className="h-5 w-5" />,
    number: 5,
  },
  {
    key: "information",
    href: routes.informationRequest,
    icon: <InfoIcon className="h-5 w-5" />,
    number: 6,
  },
];

export function MemberHubSection() {
  const messages = getMessages();

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            {messages.memberHub.title}
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Odaya gelmeden işlemlerinizi hızlı ve güvenli şekilde tamamlayın.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-stretch">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {cards.map((card) => {
              const content = messages.memberHub.cards[card.key];
              const href = card.loginReturn
                ? memberLoginHref(card.loginReturn)
                : card.href;

              return (
                <Link
                  key={card.key}
                  href={href}
                  className="group relative flex min-h-[148px] flex-col rounded-[16px] border border-[var(--color-border)] bg-white p-5 shadow-[0_6px_18px_rgba(23,35,29,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,35,29,0.08)]"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
                    {card.icon}
                  </div>
                  <h3 className="pr-6 text-sm font-bold text-[var(--color-text)]">
                    {card.number}. {content.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--color-text-muted)]">
                    {content.description}
                  </p>
                  <span
                    className="absolute right-4 bottom-4 text-[var(--color-primary-700)] transition group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>

          <aside className="flex flex-col rounded-[20px] bg-[var(--color-primary-800)] p-6 text-white shadow-[0_18px_40px_rgba(11,61,40,0.22)] lg:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/12"
                aria-hidden
              >
                🔒
              </span>
              <h3 className="text-lg font-bold">{messages.memberHub.loginTitle}</h3>
            </div>

            <form
              className="flex flex-1 flex-col gap-3.5"
              action={routes.member.login}
              method="get"
            >
              <div>
                <label htmlFor="member-identifier" className="sr-only">
                  {messages.memberHub.identifierLabel}
                </label>
                <input
                  id="member-identifier"
                  name="identifier"
                  autoComplete="username"
                  placeholder={messages.memberHub.identifierLabel}
                  className="h-11 w-full rounded-[10px] border-0 bg-white px-3 text-sm text-[var(--color-text)] outline-none ring-2 ring-transparent placeholder:text-[var(--color-text-muted)] focus:ring-white/50"
                />
              </div>
              <div>
                <label htmlFor="member-password" className="sr-only">
                  {messages.memberHub.passwordLabel}
                </label>
                <input
                  id="member-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Şifreniz"
                  className="h-11 w-full rounded-[10px] border-0 bg-white px-3 text-sm text-[var(--color-text)] outline-none ring-2 ring-transparent placeholder:text-[var(--color-text-muted)] focus:ring-white/50"
                />
              </div>

              <button
                type="submit"
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-white text-sm font-bold text-[var(--color-primary-900)] transition hover:bg-[var(--color-primary-100)]"
              >
                {messages.memberHub.submit}
              </button>

              <Link
                href={routes.member.login}
                className="inline-flex items-center justify-center gap-1 pt-1 text-sm font-medium text-white/90 hover:text-white"
              >
                {messages.memberHub.memberNoLogin}
                <span aria-hidden>→</span>
              </Link>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-xs text-white/80">
                <Link
                  href={routes.member.forgotPassword}
                  className="hover:text-white"
                >
                  {messages.memberHub.forgotPassword}
                </Link>
                <Link href={routes.membership.apply} className="hover:text-white">
                  {messages.memberHub.becomeMember}
                </Link>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
}
