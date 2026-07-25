import { siteConfig } from "@/lib/site";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  description: string;
  updatedLabel: string;
  sections: LegalSection[];
};

const org = siteConfig.name;
const address = siteConfig.address;
const email = siteConfig.email;
const phone = siteConfig.phoneDisplay;

export const kvkkDocument: LegalDocument = {
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla yapılan bilgilendirme.",
  updatedLabel: "Son güncelleme: 25.07.2026",
  sections: [
    {
      heading: "1. Veri sorumlusu",
      paragraphs: [
        `${org} (“Oda”), 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusudur.`,
        `İletişim: ${address} · ${phone} · ${email}`,
      ],
    },
    {
      heading: "2. İşlenen kişisel veriler",
      paragraphs: [
        "Hizmetlerin sunumu kapsamında kimlik, iletişim, üyelik, başvuru, belge talebi, aidat/tahsilat, randevu ve destek taleplerine ilişkin veriler; web sitesi üzerinden iletilen form içerikleri ile teknik log kayıtları işlenebilir.",
      ],
      bullets: [
        "Kimlik ve iletişim bilgileri (ad-soyad, T.C. kimlik no, telefon, e-posta)",
        "Üyelik ve işletme bilgileri",
        "Başvuru, belge ve işlem kayıtları",
        "Aidat ve tahsilat hareketleri",
        "İletişim formu ve destek talebi içerikleri",
        "Çerez ve oturum teknik verileri",
      ],
    },
    {
      heading: "3. İşleme amaçları ve hukuki sebepler",
      paragraphs: [
        "Kişisel veriler; üyelik ve oda işlemlerinin yürütülmesi, yasal yükümlülüklerin yerine getirilmesi, başvuru ve belge süreçlerinin takibi, aidat tahsilatı, randevu ve destek hizmetlerinin sunulması, güvenlik ve denetim ile meşru menfaatler kapsamında işlenir.",
        "Hukuki sebepler: KVKK m.5/2 (kanunlarda açıkça öngörülmesi, sözleşmenin kurulması/ifası, hukuki yükümlülük, meşru menfaat) ve gerektiğinde açık rıza.",
      ],
    },
    {
      heading: "4. Aktarım",
      paragraphs: [
        "Veriler; yasal zorunluluklar, üst kuruluşlar ve yetkili kamu kurumları ile hizmetin gerektirdiği ölçüde, yeterli teknik ve idari tedbirler alınarak paylaşılabilir. Yurt dışına aktarım yalnızca KVKK’daki şartlar sağlandığında yapılır.",
      ],
    },
    {
      heading: "5. Saklama süresi",
      paragraphs: [
        "Veriler, ilgili mevzuatta öngörülen süreler ve işleme amacının gerektirdiği süre boyunca saklanır; süre sonunda silinir, yok edilir veya anonim hale getirilir.",
      ],
    },
    {
      heading: "6. Haklarınız",
      paragraphs: [
        "KVKK m.11 kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme/yok etme, itiraz ve zarar giderimi talep etme haklarına sahipsiniz. Başvurularınızı yazılı olarak veya e-posta yoluyla Oda’ya iletebilirsiniz.",
      ],
    },
  ],
};

export const privacyDocument: LegalDocument = {
  title: "Gizlilik Politikası",
  description:
    "Web sitesi ve üye hizmetleri kapsamında kişisel verilerinizin ve gizliliğinizin nasıl korunduğuna ilişkin bilgilendirme.",
  updatedLabel: "Son güncelleme: 25.07.2026",
  sections: [
    {
      heading: "1. Kapsam",
      paragraphs: [
        `Bu politika, ${org} web sitesini ziyaret edenler ile üye portalı ve iletişim kanallarını kullanan kişilere uygulanır.`,
      ],
    },
    {
      heading: "2. Toplanan bilgiler",
      paragraphs: [
        "Doğrudan sizden alınan form ve üyelik bilgileri; oturum güvenliği için gerekli teknik kayıtlar; zorunlu çerezler ve yalnızca onayınız varsa analitik çerezler işlenebilir.",
      ],
    },
    {
      heading: "3. Kullanım",
      paragraphs: [
        "Bilgiler yalnızca hizmet sunumu, güvenlik, yasal yükümlülükler ve taleplerinizin karşılanması için kullanılır. Pazarlama amaçlı paylaşım yapılmaz.",
      ],
    },
    {
      heading: "4. Güvenlik",
      paragraphs: [
        "Erişim kontrolü, şifreleme, güvenli oturum çerezleri ve yetki ayrımı gibi teknik/idari tedbirler uygulanır. Hassas kimlik bilgileri uygulama seviyesinde korunur; gereksiz yere loglanmaz.",
      ],
    },
    {
      heading: "5. Üçüncü taraflar",
      paragraphs: [
        "Barındırma, e-posta veya ileride açılacak ödeme kuruluşu gibi hizmet sağlayıcılar yalnızca hizmetin gerektirdiği ölçüde ve sözleşmesel güvencelerle yetkilendirilir. Gerçek entegrasyon tamamlanmadan online ödeme veya e-Devlet girişi sunulmaz.",
      ],
    },
    {
      heading: "6. İletişim",
      paragraphs: [
        `Gizlilik sorularınız için: ${email} · ${phone}`,
      ],
    },
  ],
};

export const cookiesDocument: LegalDocument = {
  title: "Çerez Politikası",
  description:
    "Web sitemizde kullanılan çerez türleri, amaçları ve tercihlerinizi nasıl yönetebileceğiniz.",
  updatedLabel: "Son güncelleme: 25.07.2026",
  sections: [
    {
      heading: "1. Çerez nedir?",
      paragraphs: [
        "Çerezler, web sitesinin düzgün çalışması, güvenliğin sağlanması ve (onayınız varsa) kullanım istatistiklerinin ölçülmesi için tarayıcınıza yerleştirilen küçük metin dosyalarıdır.",
      ],
    },
    {
      heading: "2. Zorunlu çerezler",
      paragraphs: [
        "Oturum güvenliği, giriş durumu ve çerez tercihlerinizin hatırlanması için zorunlu çerezler kullanılır. Bu çerezler olmadan üye/yönetim paneli ve form güvenliği çalışmaz; açık rıza aranmaz.",
      ],
      bullets: [
        "Oturum çerezleri (üye / yönetici)",
        "Çerez tercih kaydı",
        "Güvenlik ve rate-limit ile ilişkili teknik kayıtlar",
      ],
    },
    {
      heading: "3. Analitik çerezler",
      paragraphs: [
        "Analitik çerezler yalnızca açık onayınız ile etkinleştirilir. Onay vermezseniz bu çerezler yerleştirilmez. Şu an sitede üçüncü taraf analitik betiği yüklenmemektedir; onay altyapısı gelecekteki ölçüm araçları için hazırlanmıştır.",
      ],
    },
    {
      heading: "4. Tercihlerinizi yönetme",
      paragraphs: [
        "İlk ziyarette görünen çerez bandından analitik çerezleri kabul veya reddedebilirsiniz. Tercihinizi tarayıcı verilerini temizleyerek yeniden görebilirsiniz. Ayrıca tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz.",
      ],
    },
    {
      heading: "5. İletişim",
      paragraphs: [
        `Çerez politikası hakkında sorularınız için: ${email}`,
      ],
    },
  ],
};
