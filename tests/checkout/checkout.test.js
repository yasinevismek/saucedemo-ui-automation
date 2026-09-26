const { expect } = require('chai');
const { standardUser } = require('../../data/users');
const { backpack, bikeLight } = require('../../data/products');
const { validCustomer } = require('../../data/checkout');
const errorMessages = require('../../utils/errorMessages');
const BaseTest = require('../BaseTest');
const CartHeader = require('../../components/CartHeader');
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
    test.cartHeader = new CartHeader(test.driver);
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
    await test.cartHeader.waitForItemCount(selectedProducts.length);
    await test.cartHeader.openCart();
    await test.cartPage.waitForLoaded();
    await test.cartPage.startCheckout();
    await test.checkoutStepOnePage.waitForLoaded();
  }

  async function openCheckoutOverview(selectedProducts = [backpack]) {
    await startCheckoutWithProducts(selectedProducts);
    await test.checkoutStepOnePage.submitCustomerInformation(validCustomer);
    await test.checkoutStepTwoPage.waitForLoaded();
  }

  it('CHECKOUT-001: should start checkout with products in the cart', async function () {
    await startCheckoutWithProducts();

    expect(await test.checkoutStepOnePage.getCurrentUrl(), 'Checkout information URL')
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-002: should continue checkout with valid customer information', async function () {
    await openCheckoutOverview();

    expect(await test.checkoutStepTwoPage.getCurrentUrl(), 'Checkout overview URL')
      .to.equal(urlList.checkoutStepTwoPageUrl);
  });

  it('CHECKOUT-003: should show the selected product in the checkout overview', async function () {
    await openCheckoutOverview();

    expect(await test.checkoutStepTwoPage.getOrderItems(), 'Checkout overview should contain the selected product')
      .to.deep.include({ name: backpack.name, price: backpack.price });
  });

  it('CHECKOUT-004: should calculate the checkout total correctly', async function () {
    await openCheckoutOverview();

    const { itemTotal, tax, total } = await test.checkoutStepTwoPage.getOrderTotals();
    expect(itemTotal, 'Item total should equal the selected product price')
      .to.equal(Number.parseFloat(backpack.price.slice(1)));
    expect(tax, 'Tax should be applied to the order').to.be.greaterThan(0);
    expect(total, 'Total should equal item total plus tax').to.equal(Number((itemTotal + tax).toFixed(2)));
  });

  it('CHECKOUT-005: should complete the checkout and show a success message', async function () {
    await openCheckoutOverview();
    await test.checkoutStepTwoPage.finishCheckout();
    await test.checkoutCompletePage.waitForLoaded();

    expect(await test.checkoutCompletePage.getConfirmationMessage(), 'Order confirmation message')
      .to.equal('Thank you for your order!');
  });

  it('CHECKOUT-006: should show an error when first name is empty', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.submitCustomerInformation({ ...validCustomer, firstName: '' });

    expect(await test.checkoutStepOnePage.getErrorMessage(), 'First name validation message')
      .to.equal(errorMessages.checkoutFirstNameRequired);
    expect(await test.checkoutStepOnePage.getCurrentUrl(), 'Checkout information URL')
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-007: should show an error when last name is empty', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.submitCustomerInformation({ ...validCustomer, lastName: '' });

    expect(await test.checkoutStepOnePage.getErrorMessage(), 'Last name validation message')
      .to.equal(errorMessages.checkoutLastNameRequired);
    expect(await test.checkoutStepOnePage.getCurrentUrl(), 'Checkout information URL')
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-008: should show an error when postal code is empty', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.submitCustomerInformation({ ...validCustomer, postalCode: '' });

    expect(await test.checkoutStepOnePage.getErrorMessage(), 'Postal code validation message')
      .to.equal(errorMessages.checkoutPostalCodeRequired);
    expect(await test.checkoutStepOnePage.getCurrentUrl(), 'Checkout information URL')
      .to.equal(urlList.checkoutStepOnePageUrl);
  });

  it('CHECKOUT-009: should return to the cart when checkout is cancelled', async function () {
    await startCheckoutWithProducts();
    await test.checkoutStepOnePage.cancel();
    await test.cartPage.waitForLoaded();

    expect(await test.cartPage.getCartItems(), 'Cart should retain its product after cancelling checkout')
      .to.deep.include({ name: backpack.name, price: backpack.price });
  });

  it('CHECKOUT-010: should show all selected products in the checkout overview', async function () {
    await openCheckoutOverview([backpack, bikeLight]);

    const orderItems = await test.checkoutStepTwoPage.getOrderItems();
    expect(orderItems, 'Checkout overview should contain Backpack')
      .to.deep.include({ name: backpack.name, price: backpack.price });
    expect(orderItems, 'Checkout overview should contain Bike Light')
      .to.deep.include({ name: bikeLight.name, price: bikeLight.price });
  });
});
