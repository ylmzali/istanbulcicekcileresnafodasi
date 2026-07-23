import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect(routes.admin.login);
  }

  const a = getMessages().admin;
  const navItems = [
    { href: routes.admin.root, label: a.dashboard },
    { href: routes.admin.posts, label: a.posts },
    { href: routes.admin.events, label: a.events },
    { href: routes.admin.faqs, label: a.faqs },
    { href: routes.admin.members, label: a.members },
    { href: routes.admin.applications, label: a.applications },
    { href: routes.admin.documentRequests, label: a.documentRequests },
    { href: routes.admin.dues, label: a.dues },
    { href: routes.admin.appointments, label: a.appointments },
    { href: routes.admin.support, label: a.support },
    { href: routes.admin.florists, label: a.florists },
  ];

  return (
    <AdminShell
      username={session.username}
      labels={{ brand: a.brand, logout: a.logout }}
      navItems={navItems}
    >
      {children}
    </AdminShell>
  );
}
