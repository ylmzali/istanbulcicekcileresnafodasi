import { redirect } from "next/navigation";
import { MemberPortalShell } from "@/components/member/member-portal-shell";
import { getMemberSession } from "@/lib/auth/session";
import { routes } from "@/lib/routes";

export default async function MemberPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getMemberSession();
  if (!session) {
    redirect(routes.member.login);
  }

  return <MemberPortalShell session={session}>{children}</MemberPortalShell>;
}
