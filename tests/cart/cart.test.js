const { expect } = require('chai');
const { standardUser } = require('../../data/users');
const { backpack, bikeLight } = require('../../data/products');
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const CartPage = require('../../pages/CartPage');
const CartHeader = require('../../components/CartHeader');

describe('SauceDemo - Cart', function () {
  const test = new BaseTest();
  test.registerHooks(async function () {
    test.loginPage = new LoginPage(test.driver);
    test.productsPage = new ProductsPage(test.driver);
    test.cartPage = new CartPage(test.driver);
    test.cartHeader = new CartHeader(test.driver);
    await test.loginPage.loginAs(standardUser);
    await test.productsPage.waitForLoaded();
  });

  it('CART-001: should add a product to the cart', async function () {
    await test.productsPage.addProductToCart(backpack.id);

    expect(await test.cartHeader.waitForItemCount(1), 'Cart badge should show one item').to.equal(1);
  });

  it('CART-002: should add multiple products to the cart', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);

    expect(await test.cartHeader.waitForItemCount(2), 'Cart badge should show two items').to.equal(2);
  });

  it('CART-003: should show the added product information in the cart', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.cartHeader.openCart();

    expect(await test.cartPage.getCartItems(), 'Cart should contain the added product information')
      .to.deep.include({ name: backpack.name, price: backpack.price });
  });

  it('CART-004: should remove a product from the cart', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);
    await test.cartHeader.openCart();
    await test.cartPage.removeProduct(backpack.id);

    const cartItems = await test.cartPage.getCartItems();
    expect(cartItems, 'Cart should no longer contain the removed product')
      .to.not.deep.include({ name: backpack.name, price: backpack.price });
    expect(cartItems, 'Cart should retain products that were not removed')
      .to.deep.include({ name: bikeLight.name, price: bikeLight.price });
  });

  it('CART-005: should empty the cart after removing all products', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);
    await test.cartHeader.openCart();
    await test.cartPage.removeProduct(backpack.id);
    await test.cartPage.removeProduct(bikeLight.id);

    expect(await test.cartPage.getCartItemCount(), 'Cart should contain no items').to.equal(0);
  });

  it('CART-006: should display an empty cart when no products were added', async function () {
    await test.cartHeader.openCart();

    expect(await test.cartPage.getCartItemCount(), 'Cart should be empty').to.equal(0);
  });

  it('CART-007: should update the cart badge after removing a product', async function () {
    await test.productsPage.addProductToCart(backpack.id);
    await test.productsPage.addProductToCart(bikeLight.id);
    await test.cartHeader.openCart();
    await test.cartPage.removeProduct(backpack.id);

    expect(await test.cartHeader.waitForItemCount(1), 'Cart badge should show one remaining item').to.equal(1);
  });
});
