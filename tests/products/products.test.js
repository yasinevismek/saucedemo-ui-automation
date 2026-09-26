const { expect } = require('chai');
const urlList = require('../../utils/urlList');
const errorMessages = require('../../utils/errorMessages');
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

    it('PRODUCT-001: Ürün listesinin görüntülenmesi', async function () {
      const items = await test.productsPage.getProductsItems();
      expect(items.length, errorMessages.elementNotVisible).to.be.greaterThan(0);

      const visibilityStates = await test.productsPage.getProductsVisibilityStates();
      expect(visibilityStates.every((isVisible) => isVisible), errorMessages.elementNotVisible).to.equal(true);
    });

    it('PRODUCT-002: Ürün isimlerinin görüntülenmesi', async function () { 
        const names = await test.productsPage.getProductNames();
        expect(names.length, errorMessages.elementNotVisible).to.be.greaterThan(0);
        expect(names.every((name) => name.trim().length > 0), errorMessages.textNotMatch).to.equal(true); 
    });

    it('PRODUCT-003: Ürün fiyatlarının görüntülenmesi', async function () {
        const prices = await test.productsPage.getProductPrices();
        expect(prices.length, errorMessages.elementNotVisible).to.be.greaterThan(0);
        expect(prices.every((price) => price.trim().length > 0), errorMessages.textNotMatch).to.equal(true); 
    });

    it('PRODUCT-004: Ürün detay sayfasına gidilmesi', async function () {
        const backpackName = await test.productsPage.getBackpackName();
        await test.productsPage.openBackpackDetails();
        await test.productDetailsPage.waitForLoaded();
        const productName = await test.productDetailsPage.getProductName();
        expect(productName, errorMessages.textNotMatch).to.equal(backpackName);
    });

    it('PRODUCT-005: Ürün detayından ürün listesine geri dönülmesi', async function () {
        await test.productsPage.openBackpackDetails();
        await test.productDetailsPage.waitForLoaded();
        await test.productDetailsPage.backToProducts();
        await test.productsPage.waitForLoaded();
        expect(await test.productsPage.getCurrentUrl(), errorMessages.urlNotMatch).to.equal(
            urlList.productsPageUrl,
        );
        expect(await test.productsPage.isInventoryVisible(),errorMessages.elementNotVisible).to.equal(true);
        const items = await test.productsPage.getProductsItems();
        expect(items.length,errorMessages.elementNotVisible).to.be.greaterThan(0);
    });

    it('PRODUCT-006: Ürünlerin farklı sorting seçenekleri ile sıralanması A to Z', async function () {
        await test.productsPage.sortProducts('za');
        await test.productsPage.sortProducts('az');
        const actualNames = await test.productsPage.getProductNames();
        const sortedNames = [...actualNames].sort((a, b) => a.localeCompare(b));
        expect(actualNames, errorMessages.textNotMatch).to.deep.equal(sortedNames);
    });

    it('PRODUCT-007: Ürünlerin farklı sorting seçenekleri ile sıralanması Z to A', async function () {
        await test.productsPage.sortProducts('az');
        await test.productsPage.sortProducts('za');
        const actualNames = await test.productsPage.getProductNames();
        const sortedNames = [...actualNames].sort((a, b) => b.localeCompare(a));
        expect(actualNames, errorMessages.textNotMatch).to.deep.equal(sortedNames);
    });

    it('PRODUCT-008: Ürünlerin farklı sorting seçenekleri ile sıralanması, fiyata göre düşükten yükseğe', async function () {
        await test.productsPage.sortProducts('lohi');
        const actualPrices = await test.productsPage.getProductPriceValues();
        const sortedPrices = [...actualPrices].sort((a, b) => a - b);
        expect(actualPrices, errorMessages.textNotMatch).to.deep.equal(sortedPrices);
    });

    it('PRODUCT-009: Ürünlerin farklı sorting seçenekleri ile sıralanması, fiyata göre yüksektenden düşüğe', async function () {
        await test.productsPage.sortProducts('lohi');
        await test.productsPage.sortProducts('hilo');
        const actualPrices = await test.productsPage.getProductPriceValues();
        const sortedPrices = [...actualPrices].sort((a, b) => b - a);
        expect(actualPrices, errorMessages.textNotMatch).to.deep.equal(sortedPrices);
    });
});
