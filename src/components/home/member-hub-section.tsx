import { MemberLoginForm } from "@/components/member/member-login-form";
import {
  InfoIcon,
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
  key: "membershipApplication" | "dues" | "information";
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
    key: "dues",
    href: routes.membership.dues,
    icon: <WalletIcon className="h-5 w-5" />,
    number: 2,
  },
  {
    key: "information",
    href: routes.informationRequest,
    icon: <InfoIcon className="h-5 w-5" />,
    number: 3,
  },
];

export function MemberHubSection() {
  const messages = getMessages();
  const hub = messages.memberHub;

  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)] py-14">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            {hub.title}
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Odaya gelmeden işlemlerinizi hızlı ve güvenli şekilde tamamlayın.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-stretch">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cards.map((card) => {
              const content = hub.cards[card.key];
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
              <h3 className="text-lg font-bold">{hub.loginTitle}</h3>
            </div>

            <MemberLoginForm
              variant="hub"
              labels={{
                title: hub.loginTitle,
                hint: "",
                identifier: hub.identifierLabel,
                password: hub.passwordLabel,
                rememberMe: hub.rememberMe,
                forgotPassword: hub.forgotPassword,
                submit: hub.submit,
                showPassword: hub.showPassword,
                hidePassword: hub.hidePassword,
              }}
            />

            <div className="mt-3 flex justify-end text-xs text-white/80">
              <Link href={routes.membership.apply} className="hover:text-white">
                {hub.becomeMember}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
