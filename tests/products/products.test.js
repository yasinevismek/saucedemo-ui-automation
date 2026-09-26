const { expect } = require('chai');
const urlList = require('../../utils/urlList');
const { standardUser } = require('../../data/users');
const BaseTest = require('../BaseTest');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const ProductDetailsPage = require('../../pages/ProductDetailsPage');

describe('SauceDemo - Products', function () {
  const test = new BaseTest();
  test.registerHooks(async function () {
    test.loginPage = new LoginPage(test.driver);
    test.productsPage = new ProductsPage(test.driver);
    test.productDetailsPage = new ProductDetailsPage(test.driver);
    await test.loginPage.loginAs(standardUser);
    await test.productsPage.waitForLoaded();
  });

    it('PRODUCT-001: should display a non-empty product list with all items visible', async function () {
      const items = await test.productsPage.getProductsItems();
      expect(items.length, 'There should be at least one product item').to.be.greaterThan(0);

      const visibilityStates = await test.productsPage.getProductsVisibilityStates();
      expect(visibilityStates.every((isVisible) => isVisible), 'All product items should be visible').to.equal(true);
    });

    it('PRODUCT-002: should display a non-empty name for every product', async function () { 
        const names = await test.productsPage.getProductNames();
        expect(names.length, 'There should be at least one product name').to.be.greaterThan(0);
        expect(names.every((name) => name.trim().length > 0), 'All product names should be non-empty').to.equal(true); 
    });

    it('PRODUCT-003: should display a non-empty price for every product', async function () {
        const prices = await test.productsPage.getProductPrices();
        expect(prices.length, 'There should be at least one product price').to.be.greaterThan(0);
        expect(prices.every((price) => price.trim().length > 0), 'All product prices should be non-empty').to.equal(true); 
    });

    it('PRODUCT-004: should display the selected product details', async function () {
        const backpackName = await test.productsPage.getBackpackName();
        await test.productsPage.openBackpackDetails();
        await test.productDetailsPage.waitForLoaded();
        const productName = await test.productDetailsPage.getProductName();
        expect(productName, 'Product name on details page should match the selected product').to.equal(backpackName);
    });

    it('PRODUCT-005: should return to the product list from product details', async function () {
        await test.productsPage.openBackpackDetails();
        await test.productDetailsPage.waitForLoaded();
        await test.productDetailsPage.backToProducts();
        await test.productsPage.waitForLoaded();
        expect(await test.productsPage.getCurrentUrl(), 'Inventory URL').to.equal(
            urlList.productsPageUrl,
        );
        expect(
            await test.productsPage.isInventoryVisible(),
            'Inventory list should be visible after returning from product details',
        ).to.equal(true);
          const items = await test.productsPage.getProductsItems();
        expect(
            items.length,
            'There should be at least one product after returning from product details',
        ).to.be.greaterThan(0);
    });

    it('PRODUCT-006: should sort products by name from A to Z', async function () {
        await test.productsPage.sortProducts('za');
        await test.productsPage.sortProducts('az');
        const actualNames = await test.productsPage.getProductNames();
        const sortedNames = [...actualNames].sort((a, b) => a.localeCompare(b));
        expect(actualNames, 'Products should be sorted by name from A to Z').to.deep.equal(sortedNames);
    });

    it('PRODUCT-007: should sort products by name from Z to A', async function () {
        await test.productsPage.sortProducts('az');
        await test.productsPage.sortProducts('za');
        const actualNames = await test.productsPage.getProductNames();
        const sortedNames = [...actualNames].sort((a, b) => b.localeCompare(a));
        expect(actualNames, 'Products should be sorted by name from Z to A').to.deep.equal(sortedNames);
    });

    it('PRODUCT-008: should sort products by price from low to high', async function () {
        await test.productsPage.sortProducts('lohi');
        const actualPrices = await test.productsPage.getProductPriceValues();
        const sortedPrices = [...actualPrices].sort((a, b) => a - b);
        expect(actualPrices, 'Products should be sorted by price from low to high').to.deep.equal(sortedPrices);
    });

    it('PRODUCT-009: should sort products by price from high to low', async function () {
        await test.productsPage.sortProducts('lohi');
        await test.productsPage.sortProducts('hilo');
        const actualPrices = await test.productsPage.getProductPriceValues();
        const sortedPrices = [...actualPrices].sort((a, b) => b - a);
        expect(actualPrices, 'Products should be sorted by price from high to low').to.deep.equal(sortedPrices);
    });
});
