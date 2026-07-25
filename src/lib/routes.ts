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
    auditBoard: "/kurumsal/denetim-kurulu",
    pastPresidents: "/kurumsal/gecmis-donem-baskanlari",
  },
  membership: {
    root: "/uyelik-islemleri",
    apply: "/uyelik-islemleri/basvuru",
    applyTrack: "/uyelik-islemleri/basvuru/takip",
    applyTrackQuery: (trackingNo: string) =>
      `/uyelik-islemleri/basvuru/takip?no=${encodeURIComponent(trackingNo)}`,
    dues: "/aidat-sorgulama",
  },
  legislation: "/mevzuat",
  events: {
    root: "/etkinlikler",
    detail: (slug: string) => `/etkinlikler/${slug}`,
  },
  news: {
    root: "/haberler",
    chamber: "/haberler/oda-haberleri",
    sector: "/haberler/sektorden",
    chamberDetail: (slug: string) => `/haberler/oda-haberleri/${slug}`,
    sectorDetail: (slug: string) => `/haberler/sektorden/${slug}`,
  },
  announcements: {
    root: "/duyurular",
    detail: (slug: string) => `/duyurular/${slug}`,
  },
  contact: "/iletisim",
  faq: "/sss",
  informationRequest: "/bilgi-edinme",
  complaint: "/dilek-sikayet",
  supportTrack: "/destek/takip",
  supportTrackQuery: (trackingNo: string) =>
    `/destek/takip?no=${encodeURIComponent(trackingNo)}`,
  legal: {
    kvkk: "/kvkk",
    privacy: "/gizlilik-politikasi",
    cookies: "/cerez-politikasi",
  },
  member: {
    home: "/uye",
    login: "/uye/giris",
    forgotPassword: "/uye/sifremi-unuttum",
    resetPassword: (token: string) => `/uye/sifre-yenile/${token}`,
    dues: "/uye/aidat",
  },
  admin: {
    root: "/yonetim",
    login: "/yonetim/giris",
    posts: "/yonetim/icerik",
    postNew: "/yonetim/icerik/yeni",
    postEdit: (id: string) => `/yonetim/icerik/${id}`,
    events: "/yonetim/etkinlikler",
    eventNew: "/yonetim/etkinlikler/yeni",
    eventEdit: (id: string) => `/yonetim/etkinlikler/${id}`,
    faqs: "/yonetim/sss",
    faqNew: "/yonetim/sss/yeni",
    faqEdit: (id: string) => `/yonetim/sss/${id}`,
    banners: "/yonetim/hero",
    bannerNew: "/yonetim/hero/yeni",
    bannerEdit: (id: string) => `/yonetim/hero/${id}`,
    resources: "/yonetim/mevzuat",
    resourceNew: "/yonetim/mevzuat/yeni",
    resourceEdit: (id: string) => `/yonetim/mevzuat/${id}`,
    members: "/yonetim/uyeler",
    memberNew: "/yonetim/uyeler/yeni",
    memberEdit: (id: string) => `/yonetim/uyeler/${id}`,
    applications: "/yonetim/basvurular",
    applicationDetail: (id: string) => `/yonetim/basvurular/${id}`,
    dues: "/yonetim/aidat",
    duesPeriodNew: "/yonetim/aidat/donem/yeni",
    duesPeriodEdit: (id: string) => `/yonetim/aidat/donem/${id}`,
    duesDetail: (id: string) => `/yonetim/aidat/${id}`,
    support: "/yonetim/destek",
    supportDetail: (id: string) => `/yonetim/destek/${id}`,
    contactSubmissions: "/yonetim/iletisim-mesajlari",
  },
} as const;

/** Short return keys for login — never put encoded paths in the query string. */
export const memberLoginReturnKeys = {
  aidat: routes.member.dues,
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

/** Map a protected /uye path to a short return key for login redirect. */
export function memberReturnKeyFromPath(
  pathname: string,
): MemberLoginReturnKey | null {
  if (pathname.startsWith(routes.member.dues)) return "aidat";
  return null;
}

/** Safe post-login destination (never open redirect). */
export function resolveMemberPostLoginPath(
  returnKey: string | null | undefined,
): string {
  return resolveMemberLoginReturn(returnKey) ?? routes.member.home;
}

export const publicSitemapPaths = [
  routes.home,
  routes.corporate.root,
  routes.corporate.presidentMessage,
  routes.corporate.board,
  routes.corporate.auditBoard,
  routes.corporate.pastPresidents,
  routes.membership.root,
  routes.membership.apply,
  routes.membership.applyTrack,
  routes.membership.dues,
  routes.legislation,
  routes.events.root,
  routes.news.root,
  routes.news.chamber,
  routes.news.sector,
  routes.announcements.root,
  routes.contact,
  routes.faq,
  routes.informationRequest,
  routes.complaint,
  routes.supportTrack,
  routes.search,
  routes.legal.kvkk,
  routes.legal.privacy,
  routes.legal.cookies,
] as const;
