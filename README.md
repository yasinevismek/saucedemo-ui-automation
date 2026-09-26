# SauceDemo UI Automation

Bu proje SauceDemo uygulaması için hazırlanan UI test otomasyon projesidir. Selenium WebDriver, Mocha ve Chai kullanıldı.

## Kullanılan Teknolojiler

- Node.js 22.12.0+
- JavaScript (CommonJS)
- Selenium WebDriver
- Mocha / Chai
- Google Chrome

## Gereksinimler

- Node.js `22.12.0` veya üzeri
- npm

Node.js yüklü değilse [Node.js indirme sayfasından](https://nodejs.org/en/download) kurulabilir. Kurulumdan sonra sürümleri kontrol edebilirsiniz:

```bash
node --version
npm --version
```

## Kurulum

Projeyi indirdikten sonra aşağıdaki komutları çalıştırmak yeterli:

```bash
npm install
cp .env.example .env
```

Windows PowerShell için:

```powershell
Copy-Item .env.example .env
```

ChromeDriver ayrıca kurulmaz. Selenium Manager gerekli driver'ı otomatik indirir.

## Ayarlar

`.env` dosyasında uygulamanın adresi bulunur:

```dotenv
BASE_URL=https://www.saucedemo.com/
ACTION_DELAY_MS=300
```

`ACTION_DELAY_MS` tarayıcıdaki adımları daha rahat görmek için var. Testler hızlı çalıştırmak istenirse bu değer değiştirilebilir.

## Testleri Çalıştırma

Tüm testler:

```bash
npm test
```

Sadece login veya ürün testleri:

```bash
npm run test:login
npm run test:products
```

Cart ve checkout testleri:

```bash
npm run test:cart
npm run test:checkout
```

HTML rapor oluşturmak için:

```bash
npm run test:report
```

## Test Kapsamı

| Alan | Test Sayısı |
| --- | ---: |
| Login | 9 |
| Products | 9 |
| Cart | 7 |
| Checkout | 10 |
| Toplam | 35 |

Login, ürün listeleme ve sıralama, sepet işlemleri, checkout akışı, toplam hesaplama ve zorunlu alan kontrolleri test edildi.

## Test Stratejisi

Öncelikle kullanıcının satın alma yolculuğuna odaklanıldı login, ürün listeleme, cart ve checkout. Bu alanlar uygulamanın temel iş akışını oluşturduğu için hem pozitif hem de negatif senaryolarla test edildi. Ürünlerde liste, detay, dönüş ve tüm sıralama seçenekleri; cart'ta ekleme, silme ve boş sepet; checkout'ta form doğrulamaları, tutar hesabı ve sipariş tamamlama yer alıyor.

High-risk olarak login, ürün bilgilerinin checkout'a aktarılması ve toplam tutar hesaplaması değerlendirildi. Bu alanlardaki bir hata kullanıcının alışverişi tamamlayamamasına veya yanlış tutar görmesine neden olabilir.

Bu çalışmada hamburger menü, logout, sosyal medya linkleri, responsive görünüm ve her ürünün tüm detay alanları otomatikleştirilmedi. Öncelik, ödev kapsamındaki kritik satın alma akışını tamamlamaktı.

Testlerde SauceDemo'nun demo kullanıcılarının ve ürün bilgilerinin sabit kaldığı varsayıldı. Her test yeni bir browser oturumunda başlar; önceki testten kalan cart veya kullanıcı durumu kullanılmaz. Tutar kontrolünde uygulamanın ekranda gösterdiği vergi değeri kullanılır ve toplamın item total ile verginin toplamı olduğu doğrulanır.

## Yapı ve Kararlar

- Locator ve sayfa işlemleri testlerin içine yazmak yerine Page Object sınıflarında tutuldu.
- Cart ikonu ve badge işlemleri `CartPage` içinde tutuldu.
- Kullanıcı, ürün ve checkout bilgileri `data/` klasöründe tutuluyor.
- Sayfa açılma, URL değişimi ve element görünürlüğü için explicit wait kullanılıyor.

## Raporlama

Günlük çalıştırmalarda Mocha'nın `spec` reporter'ı kullanılıyor. Test sonucu, süre ve hata bilgileri terminalde görülebilir.

`npm run test:report` komutu `reports/ui-test-report.html` ve JSON raporu oluşturur. Başarısız testlerde alınan screenshot'lar `reports/screenshots/` altında saklanır ve rapora eklenir.

## Bilinen Sınırlamalar

- Testler SauceDemo sitesine ve Google Chrome'a bağlı.
- JUnit çıktısı ve trace kaydı henüz eklenmedi.
- Testler görünür Chrome penceresinde çalışıyor.

## Klasör Yapısı

```text
project/
├── config/                 # Ortam ve timeout ayarları
├── data/                   # Kullanıcı, ürün ve checkout test verileri
├── pages/                  # Page Object sınıfları
├── reports/                # HTML/JSON raporlar ve failure screenshot'ları
├── tests/
│   ├── login/
│   ├── products/
│   ├── cart/
│   └── checkout/
├── utils/                  # Driver, URL ve hata mesajı yardımcıları
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```
