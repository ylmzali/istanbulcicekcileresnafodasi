type NavChild = { href: string; label: string };

type NavItem = {
  href: string;
  children: readonly NavChild[] | null;
};

/** Section match: `/kurumsal` also matches `/kurumsal/baskanin-mesaji`. */
export function isPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Menu leaf match: only the exact path is active. */
export function isExactPathActive(pathname: string, href: string) {
  return pathname === href;
}

export function isNavItemActive(pathname: string, item: NavItem) {
  if (isPathActive(pathname, item.href)) return true;
  return (
    item.children?.some((child) => isExactPathActive(pathname, child.href)) ??
    false
  );
}
