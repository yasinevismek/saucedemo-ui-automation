const { expect } = require('chai');
const { standardUser } = require('../../data/users');
const { backpack, bikeLight } = require('../../data/products');
const errorMessages = require('../../utils/errorMessages');
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const CartPage = require('../../pages/CartPage');

describe('SauceDemo - Cart', function () {
  const test = new BaseTest();
  test.registerHooks(async function () {
    test.loginPage = new LoginPage(test.driver);
    test.productsPage = new ProductsPage(test.driver);
    test.cartPage = new CartPage(test.driver);
    await test.loginPage.loginAs(standardUser);
    await test.productsPage.waitForLoaded();
  });

  it('CART-001:  Bir ürünün sepete eklenmesi', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    expect(await test.cartPage.waitForItemCount(1), errorMessages.elementNotVisible).to.equal(1);
  });

  it('CART-002: Birden fazla ürünün sepete eklenmesi ve ürün sayısının doğrulanması', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);

    expect(await test.cartPage.waitForItemCount(2), errorMessages.elementNotVisible).to.equal(2);
  });

  it('CART-003: Sepete eklenen ürün bilgilerinin doğrulanması', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.cartPage.openCart();

    expect(await test.cartPage.getCartItems(), errorMessages.textNotMatch)
      .to.deep.include({ name: backpack.name, price: backpack.price });
  });

  it('CART-004: Ürünün sepetten çıkarılması', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);
    await test.cartPage.openCart();
    await test.cartPage.removeProduct(backpack.id);

    const cartItems = await test.cartPage.getCartItems();
    expect(cartItems, errorMessages.textNotMatch)
      .to.not.deep.include({ name: backpack.name, price: backpack.price });
    expect(cartItems, errorMessages.textNotMatch)
      .to.deep.include({ name: bikeLight.name, price: bikeLight.price });
  });

  it('CART-005: Sepetin tamamen boşaltılması', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);
    await test.cartPage.openCart();
    await test.cartPage.removeProduct(backpack.id);
    await test.cartPage.removeProduct(bikeLight.id);

    expect(await test.cartPage.getCartItemCount(), errorMessages.elementVisible).to.equal(0);
  });

  it('CART-006: Sepette ürün bulunmadığında doğru durumun gösterilmesi', async function () {
    await test.cartPage.openCart();
    expect(await test.cartPage.getCartItemCount(), errorMessages.elementVisible).to.equal(0);
  });
});
