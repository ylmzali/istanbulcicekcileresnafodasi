/**
 * Canonical app paths — ASCII kebab-case only (see `@/lib/slug`).
 * UI labels stay Turkish; never put display text into path segments.
 */
export const routes = {
  home: "/",
  search: "/arama",
  corporate: {
    root: "/kurumsal",
    presidentMessage: "/kurumsal/baskanin-mesaji",
    board: "/kurumsal/yonetim-kurulu",
    pastPresidents: "/kurumsal/gecmis-donem-baskanlari",
  },
  membership: {
    root: "/uyelik-islemleri",
    apply: "/uyelik-islemleri/basvuru",
  },
  legislation: "/mevzuat",
  trainings: "/egitimler",
  news: {
    root: "/haberler",
    detail: (slug: string) => `/haberler/${slug}`,
  },
  announcements: {
    root: "/duyurular",
    detail: (slug: string) => `/duyurular/${slug}`,
  },
  contact: "/iletisim",
  informationRequest: "/bilgi-edinme",
  complaint: "/dilek-sikayet",
  florists: "/kayitli-cicekciler",
  documentVerification: "/evrak-dogrulama",
  legal: {
    kvkk: "/kvkk",
    privacy: "/gizlilik-politikasi",
    cookies: "/cerez-politikasi",
  },
  member: {
    login: "/uye/giris",
    forgotPassword: "/uye/sifremi-unuttum",
    documentRequest: "/uye/belge-talebi",
    dues: "/uye/aidat",
    appointment: "/uye/randevu",
  },
  admin: {
    root: "/yonetim",
  },
} as const;

/** Short return keys for login — never put encoded paths in the query string. */
export const memberLoginReturnKeys = {
  "belge-talebi": routes.member.documentRequest,
  aidat: routes.member.dues,
  randevu: routes.member.appointment,
} as const;

export type MemberLoginReturnKey = keyof typeof memberLoginReturnKeys;

export function isMemberLoginReturnKey(
  value: string | null | undefined,
): value is MemberLoginReturnKey {
  return Boolean(value && value in memberLoginReturnKeys);
}

export function resolveMemberLoginReturn(
  key: string | null | undefined,
): string | null {
  if (!isMemberLoginReturnKey(key)) return null;
  return memberLoginReturnKeys[key];
}

/** `/uye/giris` or `/uye/giris?return=aidat` */
export function memberLoginHref(returnKey?: MemberLoginReturnKey) {
  if (!returnKey) return routes.member.login;
  return `${routes.member.login}?return=${returnKey}`;
}

export const publicSitemapPaths = [
  routes.home,
  routes.corporate.root,
  routes.membership.root,
  routes.legislation,
  routes.trainings,
  routes.news.root,
  routes.contact,
  routes.florists,
  routes.documentVerification,
  routes.informationRequest,
  routes.complaint,
] as const;
