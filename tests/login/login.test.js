const { expect } = require('chai');
const urlList = require('../../utils/urlList');
const { standardUser, lockedUser, invalidUsernameUser, invalidPasswordUser } = require('../../data/users');
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');

// Canlı uygulamanın login hata bileşenindeki tam metinler (Epic sadface öneki dahil).
const errorMessages = Object.freeze({
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  lockedUser: 'Epic sadface: Sorry, this user has been locked out.',
});

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

  it('LOGIN-001: should login successfully with valid credentials', async function () {
    await test.loginPage.loginAs(standardUser);
    expect(await test.productsPage.isLoaded(), 'Products page should load').to.equal(true);

    expect(await test.productsPage.getCurrentUrl(), 'Inventory URL').to.equal(
      urlList.productsPageUrl,
    );
    expect(await test.productsPage.getProductsTitle(), 'Products page title').to.equal('Products');
    expect(await test.productsPage.isInventoryVisible(), 'Inventory list should be visible').to.equal(true);
  });

  it('LOGIN-002: should redirect to inventory page after successful login', async function () {
    await test.loginPage.login(standardUser);
    await test.productsPage.waitForLoaded();

    const currentUrl = new URL(await test.productsPage.getCurrentUrl());
    expect(currentUrl.origin, 'Redirect should stay on the configured site').to.equal(new URL(urlList.productsPageUrl).origin);
    expect(currentUrl.pathname, 'Inventory path').to.equal(new URL(urlList.productsPageUrl).pathname);
    expect(await test.productsPage.getProductsTitle(), 'Destination page title').to.equal('Products');
  });

  it('LOGIN-003: should show an error for invalid username', async function () {
    await test.loginPage.login(invalidUsernameUser);
    await expectLoginRejected(errorMessages.invalidCredentials);
  });

  it('LOGIN-004: should show an error for invalid password', async function () {
    await test.loginPage.login(invalidPasswordUser);
    await expectLoginRejected(errorMessages.invalidCredentials);
  });

  it('LOGIN-005: should show username required error when username is empty', async function () {
    await test.loginPage.login({ ...standardUser, username: '' });
    await expectLoginRejected(errorMessages.usernameRequired);
  });

  it('LOGIN-006: should show password required error when password is empty', async function () {
    await test.loginPage.login({ ...standardUser, password: '' });
    await expectLoginRejected(errorMessages.passwordRequired);
  });

  it('LOGIN-007: should prevent login for locked out user', async function () {
    await test.loginPage.login(lockedUser);
    await expectLoginRejected(errorMessages.lockedUser);
  });

  //kullanıcı adı ve parola alanlarının boş bırakılması durumunda önce kullanıcı adı zorunluluğu
  it('LOGIN-008: should show username required error when both fields are empty', async function () {
    await test.loginPage.login({ ...standardUser, username: '', password: '' });
    await expectLoginRejected(errorMessages.usernameRequired);
  });

  //hatalı girişten sonra doğru giriş yapılabilmesi
  it('LOGIN-009: should allow login after a failed attempt', async function () {
    await test.loginPage.login(invalidPasswordUser);
    await expectLoginRejected(errorMessages.invalidCredentials);

    await test.loginPage.login(standardUser);
    await test.productsPage.waitForLoaded();

    const currentUrl = new URL(await test.productsPage.getCurrentUrl());
    expect(currentUrl.origin, 'Redirect should stay on the configured site').to.equal(new URL(urlList.productsPageUrl).origin);
    expect(currentUrl.pathname, 'Inventory path').to.equal(new URL(urlList.productsPageUrl).pathname);
    expect(await test.productsPage.getProductsTitle(), 'Destination page title').to.equal('Products');
  });
});
