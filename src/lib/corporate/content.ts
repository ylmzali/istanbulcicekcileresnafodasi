export type BoardRole =
  | "president"
  | "vice_president"
  | "member"
  | "audit_chair"
  | "audit_member";

export type BoardMember = {
  id: string;
  name: string;
  role: BoardRole;
  title: string;
  imageSrc?: string;
};

/** Current board — sourced from the official chamber pages (2026 term). */
export const managementBoard: BoardMember[] = [
  {
    id: "selcuk-kosedagi",
    name: "Selçuk Kösedağı",
    role: "president",
    title: "İstanbul Çiçekçiler Esnaf Odası Başkanı",
    imageSrc: "/images/board/selcuk-kosedagi.jpg",
  },
  {
    id: "nihat-ozturk",
    name: "Nihat Öztürk",
    role: "vice_president",
    title: "Başkan Vekili",
  },
  {
    id: "nahit-talayhan",
    name: "Nahit Talayhan",
    role: "member",
    title: "Yönetim Kurulu Asil Üyesi",
  },
  {
    id: "ibrahim-erol",
    name: "İbrahim Erol",
    role: "member",
    title: "Yönetim Kurulu Asil Üyesi",
  },
  {
    id: "kemal-talayhan",
    name: "Kemal Talayhan",
    role: "member",
    title: "Yönetim Kurulu Asil Üyesi",
  },
  {
    id: "hakan-kavak",
    name: "Hakan Kavak",
    role: "member",
    title: "Yönetim Kurulu Asil Üyesi",
  },
  {
    id: "behzat-murat-koc",
    name: "Behzat Murat Koç",
    role: "member",
    title: "Yönetim Kurulu Asil Üyesi",
    imageSrc: "/images/board/behzat-murat-koc.jpg",
  },
];

export const auditBoard: BoardMember[] = [
  {
    id: "serdar-koras",
    name: "Serdar Koraş",
    role: "audit_chair",
    title: "Denetim Kurulu Başkanı",
  },
  {
    id: "bayram-unal",
    name: "Bayram Ünal",
    role: "audit_member",
    title: "Denetim Kurulu Asil Üyesi",
  },
  {
    id: "anil-citlak",
    name: "Anıl Çıtlak",
    role: "audit_member",
    title: "Denetim Kurulu Asil Üyesi",
  },
];

export type PastPresident = {
  id: string;
  name: string;
  fromYear: number;
  toYear: number;
  imageSrc?: string;
};

/** Past presidents — sourced from the official chamber page. */
export const pastPresidents: PastPresident[] = [
  {
    id: "huseyin-gulerler",
    name: "Hüseyin Gülerler",
    fromYear: 1956,
    toYear: 1984,
    imageSrc: "/images/past-presidents/huseyin-gulerler.jpg",
  },
  {
    id: "ahmet-nadir-yuksel",
    name: "Ahmet Nadir Yüksel",
    fromYear: 1984,
    toYear: 2005,
    imageSrc: "/images/past-presidents/ahmet-nadir-yuksel.jpg",
  },
  {
    id: "muammer-erdem",
    name: "Muammer Erdem",
    fromYear: 2005,
    toYear: 2010,
    imageSrc: "/images/past-presidents/muammer-erdem.jpg",
  },
  {
    id: "yunis-erdogan",
    name: "Yunis Erdoğan",
    fromYear: 2010,
    toYear: 2012,
    imageSrc: "/images/past-presidents/yunis-erdogan.jpg",
  },
  {
    id: "sunay-calisir",
    name: "Sunay Çalışır",
    fromYear: 2012,
    toYear: 2026,
    imageSrc: "/images/past-presidents/sunay-calisir.jpg",
  },
];

export const chamberHistory = {
  scope:
    "İstanbul Çiçekçiler Esnaf Odası’nın ihtisas alanı; çiçek, bitki ve tohum ticareti, peyzaj ve çiçekçilik faaliyetleri ile akvaryum, evcil hayvan ve bunlara ilişkin ürünlerin imalatı ve ticaretini kapsamaktadır.",
  paragraphs: [
    "Çiçekçilik mesleğinin modern anlamda gelişimi, 1900’lü yılların başında Amerika, Çin, Japonya ve İtalya’da başlamış; kısa sürede tüm dünyaya yayılarak uluslararası ölçekte önemli bir meslek dalı haline gelmiştir.",
    "Osmanlı döneminde ise çiçekçilik; bahçe düzenlemeleri ve süs bitkileri yetiştiriciliği kapsamında çok daha eski tarihlere dayanmaktadır. Tezkire-i Şükufeciyan, Revnâk’ul-Ezhâr ve Şükûfenâme gibi eserlerde bu alana ilişkin önemli kayıtlar yer almakta olup, 1689 yılında yaşamış Übeydullah Efendi tarafından kaleme alınan Tezkire-i Şükufeciyan adlı eser, çiçek yetiştiriciliğini teşvik eden ve dönemin yetiştiricilerini kayıt altına alan önemli bir kaynak niteliğindedir.",
    "Türk çiçekçilik tarihi üzerine araştırmaları bulunan Turhan Baytop’a göre, Osmanlı’da “Lale-i Rûmî” olarak adlandırılan lale türünün Kefe’den getirilen soğanlardan elde edildiği değerlendirilmektedir. Bu durum, çiçekçiliğin tarihsel köklerinin ne denli derin ve köklü olduğunu açıkça ortaya koymaktadır.",
    "Yüzyıllar boyunca estetik, kültürel ve ekonomik değer taşıyan çiçekçilik; günümüzde de bireysel ve ticari yaşamın vazgeçilmez bir unsuru olmayı sürdürmekte, aynı zamanda geniş bir istihdam alanı oluşturmaktadır.",
    "İstanbul Çiçekçiler Esnaf Odası’nın temelleri, 1956 yılında Hüseyin Gülerler, Ahmet Nadir Yüksel ve Dikran Şehbaz öncülüğünde Eminönü Çiçek Pazarı’nda atılmıştır. 1984 yılına kadar Hüseyin Gülerler yönetiminde “İstanbul Çiçekçiler Esnaf Derneği” adıyla faaliyet göstermiştir.",
    "17.05.1991 tarih ve 20874 sayılı Resmî Gazete’de yayımlanan düzenleme ile dernek statüsü sona erdirilerek “Esnaf Odası” statüsüne geçilmiştir.",
    "11.03.1984 tarihinde gerçekleştirilen Genel Kurul’da Ahmet Nadir Yüksel başkanlığa seçilmiş ve 2005 yılına kadar görev yapmıştır. 2005 yılında Muammer Erdem başkanlığa getirilmiş, 14.03.2010 tarihine kadar görevini sürdürmüştür. 14.03.2010 tarihinde yapılan Genel Kurul’da Yunis Erdoğan başkan seçilmiş; 2012 yılında vefatı üzerine başkan vekili Sunay Çalışır görevi devralmıştır. 24.01.2026 tarihinde gerçekleştirilen Genel Kurul’da Selçuk Kösedağı başkanlığa seçilmiş olup, görevini sürdürmektedir.",
    "İstanbul Çiçekçiler Esnaf Odası, 2026 yılı itibarıyla Selçuk Kösedağı başkanlığında faaliyetlerini sürdürmektedir.",
    "Odamız, Kalyoncu Kulluğu Mahallesi Tarlabaşı Caddesi No: 232/1 Beyoğlu / İstanbul adresinde bulunan mülkiyetine ait hizmet binasında üyelerine hizmet vermeye devam etmektedir.",
  ],
  foundedYear: 1956,
} as const;
