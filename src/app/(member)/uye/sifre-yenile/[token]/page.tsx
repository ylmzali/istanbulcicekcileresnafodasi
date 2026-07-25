import { MemberResetPasswordForm } from "@/components/member/member-reset-password-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { routes } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şifre Yenile",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Breadcrumb
        items={[
          { label: "Üye Girişi", href: routes.member.login },
          { label: "Şifre Yenile" },
        ]}
      />
      <div className="mt-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <MemberResetPasswordForm
          token={token}
          labels={{
            title: "Yeni şifre belirleyin",
            hint: "En az 8 karakterlik yeni bir şifre girin.",
            password: "Yeni şifre",
            passwordConfirm: "Yeni şifre (tekrar)",
            submit: "Şifreyi güncelle",
          }}
        />
      </div>
    </div>
  );
}
