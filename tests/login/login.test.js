const { expect } = require('chai');
const urlList = require('../../utils/urlList');
const errorMessages = require('../../utils/errorMessages');
const { standardUser, lockedUser, invalidUsernameUser, invalidPasswordUser } = require('../../data/users');
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');

describe('SauceDemo - Login', function () {
  const test = new BaseTest();
  test.registerHooks(async function () {
    test.loginPage = new LoginPage(test.driver);
    test.productsPage = new ProductsPage(test.driver);
    await test.loginPage.open(urlList.loginPageUrl);
  });

  async function expectLoginRejected(expectedMessage) {
    expect(await test.loginPage.isErrorDisplayed(), 'Login error should be visible').to.equal(true);
    expect(await test.loginPage.getErrorMessage(), 'Login error text').to.equal(expectedMessage);
    expect(await test.loginPage.isLoaded(), 'Login form should remain visible at the login URL').to.equal(true);
    expect(await test.loginPage.getCurrentUrl(), 'Rejected login must not reach inventory').to.equal(urlList.loginPageUrl);
  }

  it('LOGIN-001: Geçerli kullanıcı bilgileri ile başarılı login', async function () {
    await test.loginPage.loginAs(standardUser);
    expect(await test.productsPage.isLoaded(), errorMessages.productPageNotLoaded).to.equal(true);

    expect(await test.productsPage.getCurrentUrl(), errorMessages.urlNotMatch).to.equal(
      urlList.productsPageUrl,
    );
    expect(await test.productsPage.getProductsTitle(), errorMessages.textNotMatch).to.equal('Products');
    expect(await test.productsPage.isInventoryVisible(), errorMessages.elementNotVisible).to.equal(true);
  });

  it('LOGIN-002: Login sonrasında doğru sayfaya yönlendirildiğinin doğrulanması', async function () {
    await test.loginPage.login(standardUser);
    await test.productsPage.waitForLoaded();

    const currentUrl = new URL(await test.productsPage.getCurrentUrl());
    expect(currentUrl.origin, errorMessages.urlNotMatch).to.equal(new URL(urlList.productsPageUrl).origin);
    expect(currentUrl.pathname, errorMessages.urlNotMatch).to.equal(new URL(urlList.productsPageUrl).pathname);
    expect(await test.productsPage.getProductsTitle(), errorMessages.textNotMatch).to.equal('Products');
  });

  it('LOGIN-003: Hatalı kullanıcı adı', async function () {
    await test.loginPage.login(invalidUsernameUser);
    await expectLoginRejected(errorMessages.invalidCredentials);
  });

  it('LOGIN-004: Hatalı password', async function () {
    await test.loginPage.login(invalidPasswordUser);
    await expectLoginRejected(errorMessages.invalidCredentials);
  });

  it('LOGIN-005: Boş kullanıcı adı', async function () {
    await test.loginPage.login({ ...standardUser, username: '' });
    await expectLoginRejected(errorMessages.usernameRequired);
  });

  it('LOGIN-006: Boş password', async function () {
    await test.loginPage.login({ ...standardUser, password: '' });
    await expectLoginRejected(errorMessages.passwordRequired);
  });

  it('LOGIN-007: Locked user ile login', async function () {
    await test.loginPage.login(lockedUser);
    await expectLoginRejected(errorMessages.lockedUser);
  });

  it('LOGIN-008: Kullanıcı adı ve parola boş bırakıldığında hata mesajı gösterilmesi', async function () {
    await test.loginPage.login({ ...standardUser, username: '', password: '' });
    await expectLoginRejected(errorMessages.usernameRequired);
  });

  it('LOGIN-009: Başarılı bir giriş sonrasında tekrar giriş yapılabilmesi', async function () {
    await test.loginPage.login(invalidPasswordUser);
    await expectLoginRejected(errorMessages.invalidCredentials);

    await test.loginPage.login(standardUser);
    await test.productsPage.waitForLoaded();

    const currentUrl = new URL(await test.productsPage.getCurrentUrl());
    expect(currentUrl.origin, errorMessages.urlNotMatch).to.equal(new URL(urlList.productsPageUrl).origin);
    expect(currentUrl.pathname, errorMessages.urlNotMatch).to.equal(new URL(urlList.productsPageUrl).pathname);
    expect(await test.productsPage.getProductsTitle(), errorMessages.textNotMatch).to.equal('Products');
  });
});
