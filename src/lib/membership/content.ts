/** Public membership & dues content — sourced from the official chamber pages. */

export const membershipRegistration = {
  title: "Üyelik Koşulları",
  description:
    "Oda kaydı için yasal yükümlülükler, üyelik şartları ve gerekli belgeler.",
  whyJoin: {
    title: "Neden Üye Olmalıyım?",
    paragraphs: [
      "5362 Sayılı Esnaf ve Sanatkârlar Meslek Kuruluşları Kanunu’na göre esnaf ve sanatkârlar, öncelikle esnaf ve sanatkâr siciline kayıt yaptırmak ve ilgili odaya kayıt olmak zorundadır.",
      "5362 Sayılı Kanun’un 68 inci maddesi gereğince esnaf ve sanatkârlar, çalışmaya başladıkları tarihten itibaren durumlarını otuz gün içinde bağlı bulundukları Sicile ve Meslek Odasına tescil ve Sicil Gazetesinde ilan ettirmekle yükümlüdür.",
      "Bu yükümlülüğü yerine getirmediği tespit edilenler birlik tarafından ruhsat vermekle yetkili ilgili kurum ve kuruluşlara bildirilir. İlgili kurum ve kuruluşlar, sicil kaydı yapılana kadar bunların faaliyetlerini durdurur.",
    ],
  },
  conditions: {
    title: "Üyelik Şartları",
    intro: "Oda üyeliği için aşağıdaki şartlar aranır:",
    items: [
      "Türkiye Cumhuriyeti vatandaşı olmak veya yabancı devlet tabiiyetinde bulunmakla beraber Türkiye’de sanat ve ticaret yapıyor olmak.",
      "Medeni hakları kullanma ehliyetine sahip olmak.",
      "Vergi mükellefi olmak ya da vergiden muaf olmak.",
      "Türkiye Odalar ve Borsalar Birliği bünyesindeki odalara kayıtlı olmamak.",
    ],
  },
  process: {
    title: "Kayıt Süreci",
    greeting: "Sayın Esnaf ve Sanatkârlarımız,",
    paragraphs: [
      "Odamıza kayıt işlemlerinin gerçekleştirilebilmesi için öncelikle İstanbul Esnaf ve Sanatkârlar Odaları Birliği (İSTESOB) bünyesinde faaliyet gösteren Esnaf ve Sanatkâr Sicil Müdürlüğü’ne kayıt yaptırılması zorunludur.",
      "Esnaf ve Sanatkâr Sicil Müdürlüğü nezdinde gerçekleştirilecek kayıt işlemlerinde, faaliyet konusuna uygun meslek kolu seçilerek kaydın “İstanbul Çiçekçiler Esnaf Odası” adına oluşturulması gerekmektedir.",
      "Sicil kaydının tamamlanmasının ardından, ilgili mevzuat hükümleri çerçevesinde odamıza üyelik işlemleri gerçekleştirilmektedir.",
    ],
  },
  documents: {
    title: "Gerekli Belgeler",
    intro:
      "Odamıza yapılacak üyelik başvurularında aşağıda belirtilen belgelerin ibraz edilmesi gerekmektedir:",
    items: [
      "T.C. Kimlik Kartı fotokopisi",
      "Vergi levhası",
      "Esnaf ve Sanatkâr Sicil Tasdiknamesi (İSTESOB)",
      "İkametgâh belgesi",
      "2 adet vesikalık fotoğraf",
      "İş yeri açılışına ilişkin belgeler",
    ],
  },
  notice: {
    title: "Önemli Bilgilendirme",
    paragraphs: [
      "Üyelik işlemlerinin tamamlanabilmesi için başvuru sahibinin Esnaf ve Sanatkâr Sicil kaydını yaptırmış olması ve gerekli belgeleri eksiksiz olarak ibraz etmesi zorunludur.",
      "Eksik belge ile yapılan başvurular işleme alınmamaktadır.",
      "Başvuru sürecine ilişkin detaylı bilgi almak ve eksik evrak durumunu teyit etmek için odamız ile iletişime geçebilirsiniz.",
    ],
  },
} as const;

export const duesInquiry = {
  title: "Aidat Sorgulama",
  description:
    "Yıllık aidat borç sorgulama ve ödeme yöntemleri hakkında bilgilendirme.",
  intro:
    "Sayın Üyemiz, odamız nezdinde kayıtlı bulunan yıllık aidat borç bilgilerinize ilişkin sorgulama işlemleri ile ödeme süreçlerine dair bilgilendirme, mesai saatleri içerisinde odamız ile iletişime geçilmesi suretiyle sağlanmaktadır. Yıllık aidat ödemeleri aşağıda belirtilen yöntemler çerçevesinde gerçekleştirilebilmektedir.",
  halkbank: {
    title: "Halkbank Tahsilat Sistemi",
    body: "Halkbank mobil bankacılık veya internet bankacılığı hizmetlerinden yararlanan üyelerimiz, yıllık aidat ödemelerini odamız tarafından kendilerine özel olarak tanımlanan Tahsilat Numarası (Tahsilat ID) ile gerçekleştirebilmektedir. Bu kapsamda ödeme işlemi öncesinde Tahsilat Numarası’nın odamızdan temin edilmesi zorunludur.",
  },
  paymentSteps: {
    title: "Ödeme Adımları",
    intro:
      "Tahsilat numarası temin edildikten sonra ödeme işlemleri aşağıdaki adımlar izlenerek tamamlanmaktadır:",
    path: [
      "Halkbank",
      "Ödemeler",
      "Vergi ve Devlet Ödemeleri",
      "E-Esnaf",
    ],
  },
  transfer: {
    title: "Havale / EFT Yoluyla Ödeme",
    intro:
      "Halkbank müşterisi olmayan üyelerimiz, yıllık aidat ödemelerini aşağıda belirtilen hesap bilgileri üzerinden havale veya EFT yoluyla gerçekleştirebilmektedir:",
    bank: "Türkiye Halk Bankası A.Ş.",
    recipient: "İstanbul Çiçekçiler Esnaf Odası",
    iban: "TR60 0001 2009 7990 0016 0001 29",
    ibanCompact: "TR600001200979900016000129",
    warning:
      "Havale/EFT yoluyla gerçekleştirilen ödemelerin doğru şekilde tespit edilmesi ve kayıt altına alınabilmesi için açıklama kısmına üye adı-soyadı / işletme unvanı bilgilerinin eksiksiz olarak yazılması zorunludur.",
  },
  legal: {
    title: "Oda Aidatlarının Ödenmesine İlişkin Yasal Bilgilendirme",
    body: "5362 sayılı Kanun’un 61 inci maddesi gereğince yıllık aidatlar Nisan ve Ekim aylarında iki eşit taksit halinde ödenir. Süresi içerisinde ödenmeyen aidatlara ilişkin Yönetim Kurulu kararları ilam hükmünde olup icra dairelerince yerine getirilir. Aidat borcu bulunan üyelere, borçları ödeninceye kadar odamız tarafından sunulan hizmetler ile düzenlenecek ve onaylanacak belgeler verilmez.",
  },
  contact: {
    title: "İletişim ve Bilgi",
    body: "Aidat borç sorgulama, Tahsilat Numarası temini ve ödeme süreçlerine ilişkin detaylı bilgi almak için mesai saatleri içerisinde odamız ile iletişime geçebilirsiniz.",
    hours: "Hafta içi mesai saatleri: 09:00 – 17:00",
  },
} as const;
