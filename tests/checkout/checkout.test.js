const { expect } = require('chai');
const { standardUser } = require('../../data/users');
const { backpack, bikeLight } = require('../../data/products');
const { validCustomer } = require('../../data/checkout');
const errorMessages = require('../../utils/errorMessages');
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const CartPage = require('../../pages/CartPage');
const CheckoutStepOnePage = require('../../pages/CheckoutStepOnePage');
const CheckoutStepTwoPage = require('../../pages/CheckoutStepTwoPage');
const CheckoutCompletePage = require('../../pages/CheckoutCompletePage');
const urlList = require('../../utils/urlList');

describe('SauceDemo - Checkout', function () {
  const test = new BaseTest();
  test.registerHooks(async function () {
    test.loginPage = new LoginPage(test.driver);
    test.productsPage = new ProductsPage(test.driver);
    test.cartPage = new CartPage(test.driver);
    test.checkoutStepOnePage = new CheckoutStepOnePage(test.driver);
    test.checkoutStepTwoPage = new CheckoutStepTwoPage(test.driver);
    test.checkoutCompletePage = new CheckoutCompletePage(test.driver);
    await test.loginPage.loginAs(standardUser);
    await test.productsPage.waitForLoaded();
  });

  async function startCheckoutWithProducts(selectedProducts = [backpack]) {
    for (const product of selectedProducts) {
      await test.productsPage.addProductToCart(product.id);
    }
    await test.cartPage.waitForItemCount(selectedProducts.length);
    await test.cartPage.openCart();
    await test.cartPage.waitForLoaded();
    await test.cartPage.startCheckout();
    await test.checkoutStepOnePage.waitForLoaded();
  }

  async function openCheckoutOverview(selectedProducts = [backpack]) {
    await startCheckoutWithProducts(selectedProducts);
    await test.checkoutStepOnePage.submitCustomerInformation(validCustomer);
    await test.checkoutStepTwoPage.waitForLoaded();
  }

  it('CHECKOUT-001: Sepetteki ürünlerle checkout başlatılması', async function () {
    await startCheckoutWithProducts();

    expect(await test.checkoutStepOnePage.getCurrentUrl(), errorMessages.urlNotMatch).to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-002: Geçerli customer bilgileri girilmesi', async function () {
    await openCheckoutOverview();

    expect(await test.checkoutStepTwoPage.getCurrentUrl(), errorMessages.urlNotMatch).to.equal(urlList.checkoutStepTwoPageUrl);
  });

  it('CHECKOUT-003: Checkout summary bilgilerinin doğrulanması', async function () {
    await openCheckoutOverview();

    expect(await test.checkoutStepTwoPage.getOrderItems(), errorMessages.orderItemsNotMatch).to.deep.include({ name: backpack.name, price: backpack.price });
  });

  it('CHECKOUT-004: ürün fiyatlarının ve toplam tutarın doğrulanması', async function () {
    await openCheckoutOverview();

    const { itemTotal, tax, total } = await test.checkoutStepTwoPage.getOrderTotals();
    expect(itemTotal, errorMessages.textNotMatch).to.equal(Number.parseFloat(backpack.price.slice(1)));
    expect(tax, errorMessages.textNotMatch).to.be.greaterThan(0);
    expect(total, errorMessages.textNotMatch).to.equal(Number((itemTotal + tax).toFixed(2)));
  });

  it('CHECKOUT-005: Siparişin tamamlanması ve başarılı sipariş mesajının doğrulanması', async function () {
    await openCheckoutOverview();
    await test.checkoutStepTwoPage.finishCheckout();
    await test.checkoutCompletePage.waitForLoaded();

    expect(await test.checkoutCompletePage.getConfirmationMessage(), errorMessages.textNotMatch)
      .to.equal('Thank you for your order!');
  });

  it('CHECKOUT-006: Zorunlu alanların boş bırakılması First Name', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.submitCustomerInformation({ ...validCustomer, firstName: '' });

    expect(await test.checkoutStepOnePage.getErrorMessage(), errorMessages.textNotMatch)
      .to.equal(errorMessages.checkoutFirstNameRequired);
    expect(await test.checkoutStepOnePage.getCurrentUrl(), errorMessages.urlNotMatch)
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-007: Zorunlu alanların boş bırakılması Last Name', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.submitCustomerInformation({ ...validCustomer, lastName: '' });

    expect(await test.checkoutStepOnePage.getErrorMessage(), errorMessages.textNotMatch)
      .to.equal(errorMessages.checkoutLastNameRequired);
    expect(await test.checkoutStepOnePage.getCurrentUrl(), errorMessages.urlNotMatch)
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-008: Zorunlu alanların boş bırakılması Postal Code', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.submitCustomerInformation({ ...validCustomer, postalCode: '' });

    expect(await test.checkoutStepOnePage.getErrorMessage(), errorMessages.textNotMatch)
      .to.equal(errorMessages.checkoutPostalCodeRequired);
    expect(await test.checkoutStepOnePage.getCurrentUrl(), errorMessages.urlNotMatch)
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-009: Checkout iptal edildiğinde sepetin görüntülenmesi', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.cancel();
    await test.cartPage.waitForLoaded();

    expect(await test.cartPage.getCartItems(), errorMessages.textNotMatch)
      .to.deep.include({ name: backpack.name, price: backpack.price });
  });

  it('CHECKOUT-010: Checkout overview sayfasının doğru görüntülenmesi', async function () {
    await openCheckoutOverview([backpack, bikeLight]);

    const orderItems = await test.checkoutStepTwoPage.getOrderItems();
    expect(orderItems, errorMessages.textNotMatch)
      .to.deep.include({ name: backpack.name, price: backpack.price });
    expect(orderItems, errorMessages.textNotMatch)
      .to.deep.include({ name: bikeLight.name, price: bikeLight.price });
  });
});
