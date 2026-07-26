# İstanbul Çiçekçiler Esnaf Odası — Yol Haritası

Bu dosya, mevcut kod tabanı taramasına göre ürün kurallarıyla (`AGENTS.md` / `.cursor/rules`) hizalı geliştirme yol haritasını tanımlar.

Son güncelleme: 2026-07-25  
**Aktif faz:** Faz 4 devam — Aidat ters kayıt (makbuz: admin yükleme)

---

## Bugünkü durum (özet)


| Alan                                                   | Durum                     |
| ------------------------------------------------------ | ------------------------- |
| Haber, duyuru, etkinlik, SSS, hero, mevzuat            | Çalışıyor (CMS)           |
| Çiçekçi rehberi                                        | ✅ Ana sayfa haritası + `/kayitli-cicekciler` |
| Yönetim: içerik, üyeler, aidat tahakkuk/tahsilat/muafiyet | Çalışıyor              |
| Yönetici girişi                                        | Çalışıyor (`super_admin` + izin iskeleti) |
| Üye girişi / üye paneli                                | ✅ Faz 1 tamamlandı       |
| Üye aidat defteri                                      | ✅ Defter + admin makbuz yükleme              |
| Üyelik başvurusu                                       | ✅ Faz 2 tamamlandı (e-posta bildirimi sonra) |
| Destek / bilgi edinme                                  | ✅ Faz 6 tamamlandı       |
| İletişim formu, site araması, KVKK metinleri           | ✅ Faz 0 tamamlandı       |
| Roller/yetkiler, audit, otomatik testler, online ödeme | Kısmi / şema              |




### Güçlü taraflar

- Public içerik yayınlama hattı (post, event, FAQ, banner, resource) CMS ile bağlı
- Kayıtlı çiçekçi rehberi: aktif + onay + rehber görünürlüğü filtreleri
- Admin üye yönetimi ve yıllık aidat (dönem → tahakkuk → tahsilat → makbuz → muafiyet / senkron)
- Mevzuat dosyaları private storage + kontrollü indirme route’u



### Ana boşluklar

- Aidat ters kayıt / online ödeme (makbuz: admin yükleme)
- Kritik mutasyon audit’i ve yönetici 2FA eksik
- Test suite yok

---



## Önerilen sıra

```
Faz 1  Üye auth + yetki iskeleti          ✅ tamamlandı
  → Faz 4  Üye aidat defteri (temel)      ✅ tamamlandı
    → Faz 0  Kamu güveni (iletişim, yasal, chrome)  ✅ tamamlandı
      → Faz 2  Üyelik başvurusu  ✅ tamamlandı
        → Faz 6  Destek / bilgi edinme / dilek-şikâyet  ✅ tamamlandı
          → Faz 4 kalan (ters kayıt; makbuz admin yükleme ✅)  ← ŞİMDİ
            → Faz 8  Operasyon, güvenlik, test
```

> Not: Evrak doğrulama, belge talebi, randevu ürün kapsamından çıkarıldı. Rehber geri alındı.

---



## Faz 0 — Hızlı kamu yüzü  ✅ TAMAMLANDI

**Amaç:** “Site bitmemiş” algısını azaltmak; kurumsal güveni artırmak.  
**Durum:** Tamamlandı (2026-07-25)

- [x] Üst iletişim şeridi (telefon, e-posta, Instagram/Facebook)
- [x] `/iletisim` gerçek sayfa: adres, çalışma saatleri, KEP, harita, birimler, form + spam/rate limit
- [x] KVKK, gizlilik ve çerez politikası metinleri
- [x] Çerez banner’ı (zorunlu / analitik ayrımı)
- [x] Footer’da sosyal medya ikonları
- [x] Header dropdown menülerde klavye / ARIA desteği
- [x] Site içi arama (en azından haber, duyuru, SSS)

**İlgili mevcut dosyalar:** `site-header.tsx`, `site-footer.tsx`, `siteConfig`, placeholder sayfalar (`iletisim`, `kvkk`, …)

---



## Faz 1 — Kimlik ve yetki  ✅ TAMAMLANDI

**Amaç:** Üye portalı ve tüm korumalı işlemlerin ön koşulu.  
**Durum:** Tamamlandı (2026-07-25)

### Tamamlananlar

- [x] Üye girişi (T.C. Kimlik No / üye no + şifre)
- [x] Oturum (mevcut `oda_session` + Session tablosu) ve `/uye/*` koruması
- [x] Giriş sonrası `return` anahtarlarıyla güvenli yönlendirme
- [x] Üye oluştururken `member` rolü atama
- [x] T.C. ile giriş için güvenli lookup hash (`identity_no_hash`)
- [x] Ana sayfa hub giriş formunun gerçek Server Action’a bağlanması
- [x] Üye paneli iskeleti (çıkış, oturum bilgisi)
- [x] Brute-force / rate limit (giriş yüzeyi)
- [x] Şifremi unuttum (token üretimi; e-posta altyapısı yoksa güvenli “gönderildi” UX + dev reset linki)
- [x] Proxy cookie kapısı + layout/action’da DB oturum + rol doğrulama (`getAdminSession` / `getMemberSession`)
- [x] Admin roller/izinler iskeleti (`module.action` + `requireAdminPermission`)
- [x] Başarısız / başarılı giriş audit kaydı (`auth.login_*`)

### Bilinçli olarak sonraya bırakılanlar (Faz 8 / güvenlik sertleştirme)

- [ ] Kritik mutasyonlarda audit (üye/aidat/içerik) — genişletme
- [ ] Yönetici 2FA
- [ ] e-Devlet: yalnızca gerçek entegrasyon + sözleşme + production bilgisi varsa; aksi halde gizle veya açıkça “Yakında”

**İlgili mevcut dosyalar:** `src/lib/auth/*`, `src/proxy.ts`, `/uye/giris`, `member-hub-section.tsx`, `src/services/auth.ts`, `src/services/members.ts`

---



## Faz 2 — Üyelik başvurusu  ✅ TAMAMLANDI

**Amaç:** Odaya gelmeden başlatılabilir kayıt süreci.  
**Durum:** Tamamlandı (2026-07-25)

- [x] Public online başvuru formu (`/uyelik-islemleri/basvuru`)
- [x] Belge yükleme, taslak kaydetme, açık rıza / doğruluk beyanı
- [x] Takip numarası üretimi (`BA-YYYYMMDD-XXXXXX`)
- [x] Public takip (`/uyelik-islemleri/basvuru/takip`) + eksik belge yükleme
- [x] Admin `/yonetim/basvurular`: liste, detay, inceleme, eksik belge, onay/ret
- [x] Durum geçmişi zaman çizelgesi + audit
- [ ] Bildirim (e-posta şablonu) — e-posta altyapısı gelince

**Şema:** `MembershipApplication`, `ApplicationDocument`, `ApplicationStatusHistory`, `DocumentType`

---



## Faz 3 — Belge talebi

**Amaç:** Belge süreçlerini dijitalleştirmek.

- [ ] Üye `/uye/belge-talebi` akışı
- [ ] Admin belge talebi kuyruğu
- [ ] `IssuedDocument`: belge no
- [ ] PDF üretimi — elektronik imza yoksa “elektronik imzalıdır” iddiası yok

> Public `/evrak-dogrulama` kapsam dışı bırakıldı.

**Şema (hazır):** `DocumentRequest`, `IssuedDocument`, status history tabloları

---



## Faz 4 — Aidatı tamamla

**Amaç:** Admin tahsilatını üye görünürlüğü ve (ileride) online ödeme ile birleştirmek.  
**Durum:** Üye defteri + admin makbuz/fatura yükleme tamam; ters kayıt / online ödeme bekliyor

### Hazır olanlar (admin)

- [x] Dönem tanımlama, aktif üyelere tahakkuk, manuel tahsilat, makbuz no
- [x] Muafiyet (onaylı) + muafiyet kaldırma
- [x] Dönem düzenleme sonrası açık tahakkuk senkronu (bilinçli, onaylı)
- [x] Üye üzerinde Halkbank Tahsilat ID (`collection_ref`)
- [x] Public `/aidat-sorgulama` ödeme bilgilendirme sayfası
- [x] Para formatı UI: `₺1,234.50` · DB: `DECIMAL(12,2)` / `1234.50`



### Bu sprintte hedeflenenler (üye tarafı)

- [x] `/uye/aidat` gerçek borç / ödeme geçmişi
- [x] Özet: açık borç, vadesi geçen, tahsilat ID ve ödeme bilgisi bağlantısı

### Sonraki alt adımlar

- [x] Makbuz / fatura: admin yükler, üye indirir (sistem PDF üretmez)
- [ ] Ters kayıt / düzeltme hareketi (silme yok)
- [ ] Vade/gecikme kurallarının netleştirilmesi
- [ ] Online ödeme adapter + webhook + idempotency → `feature_flags` arkasında
- [ ] Kart bilgisi uygulama sunucusunda tutulmaz

**İlgili mevcut dosyalar:** `src/services/dues.ts`, `/yonetim/aidat`, `/uye/aidat`

---



## Faz 5 — Online randevu

**Amaç:** Slot bazlı randevu; çift rezervasyon engeli.

- [ ] Hizmet, lokasyon, çalışma saati, kapalı gün yönetimi
- [ ] Slot kapasitesi ve transaction / unique constraint
- [ ] Üye `/uye/randevu` + admin `/yonetim/randevular`
- [ ] Randevu kodu; onay / iptal / no-show
- [ ] Hatırlatma bildirimi

**Şema (hazır):** `Appointment`, `AppointmentService`, `AppointmentSchedule`, `ClosedDay`, …

---



## Faz 6 — Destek ve kamu formları ✅

**Amaç:** Bilgi edinme, dilek/şikâyet ve destek tek merkezden.

- [x] Bilgi edinme formu + takip no (`DST-…`)
- [x] Dilek & şikâyet formu + takip no
- [x] Public takip `/destek/takip` + ek yanıt
- [x] Admin `/yonetim/destek` liste / detay / durum
- [x] İç not / kullanıcıya açık cevap ayrımı
- [x] SLA / hedef cevap tarihi (+15 gün)
- [x] İletişim formu ile tutarlı model (`SupportRequest` / `ContactSubmission`)

---



## Faz 7 — Rehber ve içerik olgunlaştırma

**Amaç:** Rehber deneyimini ve kurumsal CMS kapsamını büyütmek.

- [ ] Admin `/yonetim/rehber` (şu an görünürlük üye formundan yönetiliyor)
- [ ] Haritada işletme pinleri + kümeleme
- [ ] Hizmet / kategori filtresi; liste ↔ harita görünümü
- [ ] Kurumsal sayfaları CMS’e taşı (başkan mesajı, kurullar, raporlar, stratejik plan)
- [ ] Eksik kurumsal route’lar: organizasyon şeması, misyon-vizyon, faaliyet raporları, üst kuruluşlar sayfası
- [ ] Etkinlik kaydı / kontenjan / bekleme listesi
- [ ] Menü, sayfa, site ayarları, yönlendirme (301) yönetimi
- [ ] SEO: Organization / LocalBusiness JSON-LD, içerik OG görselleri, slug değişince redirect
- [ ] Duyuru şeridi: kapatılabilir + acil durum vurgusu
- [ ] Hero: masaüstü/mobil ayrı görsel kullanımı; tecrübe rozeti yılının ayardan hesaplanması

---



## Faz 8 — Operasyon, güvenlik ve kalite

**Amaç:** Production hazırlığı.

- [ ] Audit log’un kritik işlemlerde zorunlu kullanımı + basit rapor UI
- [ ] Bildirim merkezi (uygulama içi + e-posta; isteğe bağlı SMS)
- [ ] Feature flag kullanımı (e-Devlet, online ödeme, analitik)
- [ ] Unit testler (servisler, durum geçişleri) — Vitest/Jest
- [ ] E2E (login, başvuru, belge, aidat, randevu, yayın) — Playwright
- [ ] Yetki testleri (rol bazlı izin/yasak)
- [ ] Güvenlik başlıkları (CSP, HSTS, …), secret tarama
- [ ] Performans: LCP/CLS, cache invalidation, queue (e-posta/SMS/PDF/rapor)
- [ ] Staging kabul checklist’i

---



## Modül skoru (hızlı bakış)


| Modül                                           | Public   | Üye      | Admin          |
| ----------------------------------------------- | -------- | -------- | -------------- |
| İçerik (haber/duyuru/etkinlik/SSS/hero/mevzuat) | ✅        | —        | ✅              |
| Çiçekçi rehberi                                 | 🟡       | —        | 🟡 (üye formu) |
| Üye auth                                        | 🟡 hub   | ✅ giriş+panel | ✅ + izin iskeleti |
| Üyelik başvurusu                                | ✅        | —        | ✅              |
| Belge talebi                                    | —        | ❌        | ❌              |
| Aidat                                           | 🟡 bilgi | ✅ defter     | ✅ manuel       |
| Randevu                                         | —        | ❌        | ❌              |
| Destek / formlar                                | ✅        | —        | ✅              |
| Roller / audit / test                           | —        | —        | 🟡 şema        |


Legend: ✅ hazır · 🟡 kısmi · ❌ yok

---



## Bilinçli olarak ertelenenler / kapsam dışı

Ürün kuralları gereği gerçek entegrasyon olmadan açılmamalı:

- e-Devlet ile giriş
- Online kart/ödeme (PSP + imzalı webhook + idempotency şart)
- “Elektronik imzalı belge” iddiası
- Sahte istatistik / sahte onay rozetleri

Kapsam dışı (kaldırıldı):

- Public evrak doğrulama (`/evrak-dogrulama`)
- ~~Kayıtlı çiçekçi rehberi / harita~~ (geri alındı: ana sayfa + `/kayitli-cicekciler`)
- Belge talepleri (üye + admin)
- Online randevu (üye + admin)

Bunlar `feature_flags` + adapter arkasında beklemelidir (kapsam dışı olanlar hariç).

---



## Sonraki adım (güncel)

1. **Faz 4 devam** — Ters kayıt; (sonra) online ödeme ← sıradaki
2. **Faz 8** — Audit genişletme, 2FA, test suite
3. Online ödeme — yalnızca gerçek PSP + webhook + feature flag ile

Bir faza başlarken bu dosyadaki ilgili checklist maddeleri güncellenmeli; tamamlananlar işaretlenmelidir.
