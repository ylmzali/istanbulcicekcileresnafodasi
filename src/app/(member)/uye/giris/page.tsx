import { MemberLoginForm } from "@/components/member/member-login-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getMemberSession } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import {
  resolveMemberPostLoginPath,
  routes,
} from "@/lib/routes";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Üye Girişi",
  robots: { index: false, follow: false },
};

type MemberLoginPageProps = {
  searchParams: Promise<{ return?: string }>;
};

export default async function MemberLoginPage({
  searchParams,
}: MemberLoginPageProps) {
  const { return: returnKey } = await searchParams;
  const session = await getMemberSession();
  if (session) {
    redirect(resolveMemberPostLoginPath(returnKey));
  }

  const hub = getMessages().memberHub;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Breadcrumb items={[{ label: "Üye Girişi" }]} />
      <div className="mt-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <MemberLoginForm
          returnKey={returnKey}
          labels={{
            title: hub.loginTitle,
            hint: "T.C. kimlik numaranız veya üye no ile giriş yapın.",
            identifier: hub.identifierLabel,
            password: hub.passwordLabel,
            rememberMe: hub.rememberMe,
            forgotPassword: hub.forgotPassword,
            submit: hub.submit,
            showPassword: hub.showPassword,
            hidePassword: hub.hidePassword,
          }}
        />
      </div>
      <Link
        href={routes.home}
        className="mt-6 text-sm font-medium text-[var(--color-primary-800)] hover:underline"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
