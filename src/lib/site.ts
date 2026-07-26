import type { StaticImageData } from "next/image";
import experienceBadgeImage from "../../public/images/hero-experience-badge.png";
import heroFloristImage from "../../public/images/hero-florist.png";
import logoImage from "../../public/images/logo.png";
import istesobLogo from "../../public/images/partners/istesob.png";
import teskLogo from "../../public/images/partners/tesk.jpg";
import ticaretBakanligiLogo from "../../public/images/partners/ticaret-bakanligi.png";

/**
 * Brand images are imported (not plain `/public` URLs) so Next.js embeds a
 * content hash in the served path. Replacing a file with the same name
 * automatically busts browser and image-optimizer caches.
 */
export const siteConfig = {
  name: "İstanbul Çiçekçiler Esnaf Odası",
  shortName: "İÇEO",
  foundedYear: 1956,
  locale: "tr-TR",
  timeZone: "Europe/Istanbul",
  currency: "TRY",
  phoneDisplay: "0212 237 22 50",
  phoneHref: "tel:+902122372250",
  email: "istanbulcicekcilerodasi@gmail.com",
  address: "Tarlabaşı Bulvarı No: 232 K: 1 Beyoğlu / İstanbul",
  workingHours: [
    { days: "Pazartesi – Cuma", hours: "09:00 – 17:00" },
    { days: "Cumartesi", hours: "09:00 – 13:00" },
    { days: "Pazar", hours: "Kapalı" },
  ],
  departments: [
    {
      name: "Üye İşlemleri",
      description: "Üyelik, belge talebi ve kayıt işlemleri",
      phoneDisplay: "0212 237 22 50",
      phoneHref: "tel:+902122372250",
    },
    {
      name: "Muhasebe / Aidat",
      description: "Aidat tahakkuk ve tahsilat bilgilendirmesi",
      phoneDisplay: "0212 237 22 50",
      phoneHref: "tel:+902122372250",
    },
    {
      name: "Genel Sekreterlik",
      description: "Kurumsal yazışma ve resmi bildirimler",
      phoneDisplay: "0212 237 22 50",
      phoneHref: "tel:+902122372250",
    },
  ],
  map: {
    /** Approximate office location for OSM embed (no API key). */
    lat: 41.0369,
    lng: 28.9784,
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Tarlaba%C5%9F%C4%B1+Bulvar%C4%B1+No%3A+232+Beyo%C4%9Flu+%C4%B0stanbul",
  },
  istanbulDistrictCount: 39,
  social: {
    instagram: "https://www.instagram.com/istanbulcicekcileresnafodasi",
    facebook: "https://www.facebook.com/istanbulcicekcileresnafodasi",
  },
  kep: "istanbulcicekcileresnaf@hs01.kep.tr",
  whatsappHref: "https://wa.me/905527347670",
  logo: {
    src: logoImage as StaticImageData,
    alt: "İstanbul Çiçekçiler Esnaf Odası logosu",
  },
  heroImage: {
    src: heroFloristImage as StaticImageData,
    alt: "Çiçekçi tezgâhında çalışan esnaf",
  },
  experienceBadge: {
    src: experienceBadgeImage as StaticImageData,
    alt: "Yıllık tecrübe",
  },
  parentOrganizations: [
    {
      name: "T.C. Ticaret Bakanlığı",
      href: "https://www.ticaret.gov.tr",
      src: ticaretBakanligiLogo as StaticImageData,
      alt: "T.C. Ticaret Bakanlığı logosu",
    },
    {
      name: "TESK",
      href: "https://www.tesk.org.tr",
      src: teskLogo as StaticImageData,
      alt: "Türkiye Esnaf ve Sanatkârları Konfederasyonu logosu",
    },
    {
      name: "İSTESOB",
      href: "https://www.istesob.org.tr",
      src: istesobLogo as StaticImageData,
      alt: "İstanbul Esnaf ve Sanatkarlar Odaları Birliği logosu",
    },
  ],
};

import { routes } from "@/lib/routes";

export const publicNav = [
  { href: routes.home, labelKey: "home" as const, children: null },
  {
    href: routes.corporate.root,
    labelKey: "corporate" as const,
    children: [
      { href: routes.corporate.root, label: "Oda Hakkında" },
      { href: routes.corporate.presidentMessage, label: "Başkanın Mesajı" },
      { href: routes.corporate.board, label: "Yönetim Kurulu" },
      { href: routes.corporate.auditBoard, label: "Denetim Kurulu" },
      { href: routes.corporate.pastPresidents, label: "Geçmiş Dönem Başkanları" },
    ],
  },
  {
    href: routes.membership.root,
    labelKey: "membership" as const,
    children: [
      { href: routes.membership.root, label: "Üyelik Koşulları" },
      { href: routes.membership.apply, label: "Üyelik Başvurusu" },
      { href: routes.membership.dues, label: "Aidat Sorgulama" },
    ],
  },
  {
    href: routes.florists,
    labelKey: "memberList" as const,
    children: null,
  },
  { href: routes.legislation, labelKey: "legislation" as const, children: null },
  { href: routes.events.root, labelKey: "events" as const, children: null },
  { href: routes.news.root, labelKey: "news" as const, children: null },
  { href: routes.contact, labelKey: "contact" as const, children: null },
] as const;
