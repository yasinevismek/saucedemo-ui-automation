# SauceDemo UI Automation

Node.js, JavaScript (CommonJS), Selenium WebDriver, Mocha, Chai ve dotenv ile
Page Object Model kullanılarak oluşturulmuş UI automation projesidir.
Login kapsamı 7 bağımsız pozitif ve negatif senaryodan oluşur.

## Gereksinimler

- Node.js 22.12.0 veya üzeri ve npm
- Google Chrome
- SauceDemo erişimi ve ilk çalıştırmada driver indirmek için internet bağlantısı

ChromeDriver, [Selenium Manager](https://www.selenium.dev/documentation/selenium_manager/)
tarafından otomatik yönetilir. Ayrı bir chromedriver npm paketi gerekmez.
CommonJS `require` desteği için Chai 4 kullanılır.

## Kurulum

Proje klasöründe çalıştırın:

```bash
npm install
```

`.env` bu çalışma alanında hazırdır. Repository'yi yeni klonladıysanız oluşturun:

```bash
cp .env.example .env
```

Windows PowerShell üzerinde eşdeğeri: `Copy-Item .env.example .env`.

`.env` içeriği:

```dotenv
BASE_URL=https://www.saucedemo.com/
```

`.env` ve `node_modules/` Git kapsamı dışındadır. `.env.example` ve
`package-lock.json` repository'ye eklenmelidir. Kilitli sürümlerle temiz kurulum
için `npm ci` kullanılabilir.

## Test çalıştırma

```bash
npm test
```

Yalnızca login testlerini çalıştırmak için:

```bash
npm run test:login
```

Yalnızca ürün testlerini veya tek bir ürün senaryosunu çalıştırmak için:

```bash
npm run test:products
npm run test:products -- --grep PRODUCT-004
```

Her test görünür ve yeni bir Chrome penceresi açar, SauceDemo'ya gider ve
`data/users.js` içindeki verileri kullanır. Pozitif senaryolarda `ProductsPage`
üzerinden URL, Products başlığı ve ürünlerin görünürlüğü doğrulanır. Negatif
senaryolarda tam hata metni, görünür hata alanı ve login sayfasında kalındığı
doğrulanır. Beklemeler explicit/conditional wait ile yapılır.

## Login Test Coverage

| Senaryo | Beklenen sonuç |
| --- | --- |
| Geçerli kullanıcıyla başarılı login | Inventory açılır; Products başlığı ve ürün listesi görünür. |
| Başarılı login sonrası yönlendirme | Aynı origin üzerinde `/inventory.html` açılır; Products başlığı görünür. |
| Hatalı kullanıcı adı | `Epic sadface: Username and password do not match any user in this service` |
| Hatalı parola | `Epic sadface: Username and password do not match any user in this service` |
| Boş kullanıcı adı | `Epic sadface: Username is required` |
| Boş parola (kullanıcı adı dolu) | `Epic sadface: Password is required` |
| Kilitli kullanıcı | `Epic sadface: Sorry, this user has been locked out.` |

Beş negatif senaryonun tamamında login URL'si ve login formunun görünürlüğü de
kontrol edilir. Böylece inventory sayfasına geçilmediği doğrulanır.
Hata metinleri ve `data-test="error"` locator'ı, geliştirme sırasında
[canlı SauceDemo uygulamasının](https://www.saucedemo.com/) HTML'inin işaret ettiği
JavaScript asset'inden okunmuştur (`assets/index-D3OxT1jE.js`). Formun doğrulama
dalları ve hata bileşeninin eklediği `Epic sadface:` öneki incelenmiştir.
Bu kaynak incelemesi UI testlerinin çalıştırıldığı anlamına gelmez.

`tests/BaseTest.js` içindeki `BaseTest` sınıfı, `beforeEach` ve `afterEach`
işlemlerini tek yerden yönetir. Her test için `beforeEach` yeni bir browser oturumu oluşturur. Test veya assertion
başarısız olsa da `afterEach` oturumu `driver.quit()` ile kapatır. Browser kurulumu
sırasında timeout ayarları başarısız olursa factory de oturumu kapatır.
İlk driver indirmesi için başlangıç hook'una 180 saniye süre tanınır.

Her `describe` bloğunda ayrı bir `BaseTest` nesnesi oluşturun.
`registerHooks(setup)` metoduna verilen async fonksiyon, her testte tarayıcı
oluşturulduktan sonra çalışır. Sayfa nesnelerini bu fonksiyonda `test.driver` ile
oluşturun; `it` içindeki `this`, Mocha bağlamıdır ve `test` nesnesinden farklıdır.
Giriş yapılmış başlaması gereken testlerde kurulum fonksiyonunda
`loginPage.loginAs(standardUser)` ve `productsPage.waitForLoaded()` çağırın.

```javascript
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const urlList = require('../../utils/urlList');

describe('Yeni test grubu', function () {
  const test = new BaseTest();
  test.registerHooks(async function () {
    test.loginPage = new LoginPage(test.driver);
    await test.loginPage.open(urlList.loginPageUrl);
  });

  it('örnek senaryo', async function () {
    // test.loginPage üzerinden senaryo adımlarını uygulayın.
  });
});
```

## Proje yapısı

```text
config/config.js             # dotenv, BASE_URL ve timeout ayarları
data/users.js                # Demo kullanıcı bilgileri
pages/BasePage.js            # Ortak navigasyon, explicit wait ve etkileşimler
pages/LoginPage.js           # Login formu, hata alanı ve login işlemleri
pages/ProductsPage.js        # Inventory URL, başlık ve ürün locator'ları; sayfa beklemeleri
tests/BaseTest.js           # Ortak beforeEach/afterEach ve test kurulum fonksiyonu
tests/login/login.test.js    # 7 bağımsız login senaryosu ve Chai assertion'ları
utils/driverFactory.js       # Chrome oluşturma ve WebDriver ayarları
utils/urlList.js             # BASE_URL üzerinden oluşturulan uygulama adresleri
.env                        # Yerel ortam ayarı (Git dışında)
.env.example                # Repository için ortam şablonu
.gitignore
package.json
package-lock.json
README.md
```

Yeni senaryolar `tests/` altında, yeni sayfalar `pages/` altında genişletilebilir.
Uygulama URL'lerini `utils/urlList.js` içinde yönetin. Sayfa sınıflarında
`const urlList = require('../utils/urlList');` ile içe aktarabilirsiniz.
Örneğin `await page.open(urlList.cartPageUrl)` sepeti açar;
`urlList.productDetailsPageUrl(4)` ise ID'si 4 olan ürünün detay adresini üretir.
Ortamın ana adresi `.env` içindeki `BASE_URL` ile belirlenir.

Locator'lar test dosyalarına taşınmamalıdır. Login locator'ları `LoginPage`,
inventory locator'ları `ProductsPage` içinde `id` veya `data-test` seçicileriyle
tanımlıdır. `LoginPage.login()` formu doldurup gönderir; mevcut `loginAs()`
metodu aynı akışa delegasyon yaparak korunmuştur. `ProductsPage` başarılı
login sonrasındaki sayfanın hazır olmasını bekler; Chai assertion'ları testtedir.
`isLoaded()` ve `isErrorDisplayed()` gibi beklemeli metotlar, beklenen element
görünmezse timeout hatası verir; her durumda `false` dönen anlık sorgular değildir.

Test verisinde standard, locked, invalid username ve invalid password kullanıcıları
vardır. Boş alan senaryolarında standard kullanıcı nesnesinin kopyasında yalnızca
ilgili alan boşaltılır; ortak veri değiştirilmez. Testteki `expectLoginRejected()`
yardımcısı ortak negatif assertion'ları toplar; her senaryo ayrı `it()` bloğudur.
Sabit bekleme (`driver.sleep`) kullanılmaz.

`openBackpackDetails()` metodu ürün listesinden detay sayfasını açtığı için
`ProductsPage` sınıfında tutulur. Bu düzeltme sonrasında `npm run test:products`
çalıştırıldı: 7 ürün testinin tamamı geçti.
