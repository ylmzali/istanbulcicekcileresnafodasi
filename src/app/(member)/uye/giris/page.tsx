import { Breadcrumb } from "@/components/layout/breadcrumb";
import { resolveMemberLoginReturn, routes } from "@/lib/routes";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Üye Girişi",
};

type MemberLoginPageProps = {
  searchParams: Promise<{ return?: string }>;
};

export default async function MemberLoginPage({
  searchParams,
}: MemberLoginPageProps) {
  const { return: returnKey } = await searchParams;
  const returnPath = resolveMemberLoginReturn(returnKey);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Breadcrumb items={[{ label: "Üye Girişi" }]} />
      <h1 className="text-2xl font-semibold text-[var(--color-text)]">
        Üye Girişi
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Kimlik doğrulama altyapısı sonraki fazda bağlanacaktır.
      </p>
      {returnPath ? (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Giriş sonrası yönlendirileceğiniz sayfa:{" "}
          <span className="font-medium text-[var(--color-text)]">
            {returnPath}
          </span>
        </p>
      ) : null}
      <Link
        href={routes.home}
        className="mt-6 text-sm font-medium text-[var(--color-primary-800)] hover:underline"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
