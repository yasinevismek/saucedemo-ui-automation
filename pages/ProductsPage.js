const { By, until, Select } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');
const urlList = require('../utils/urlList');

const locators = Object.freeze({
  title: By.css('[data-test="title"]'),
  inventoryList: By.css('[data-test="inventory-list"]'),
  inventoryItem: By.css('[data-test="inventory-item"]'),
  productName: By.css('[data-test="inventory-item-name"]'),
  productPrice: By.css('[data-test="inventory-item-price"]'),
  backpackTitleLink: By.id('item_4_title_link'),
  sortDropdown: By.css('[data-test="product-sort-container"]'),
});

class ProductsPage extends BasePage {
  async waitForLoaded() {
    await this.driver.wait(until.urlIs(urlList.productsPageUrl), config.timeouts.explicit);
    await this.waitForVisible(locators.title);
    await this.waitForVisible(locators.inventoryList);
    await this.waitForVisible(locators.inventoryItem);
  }

  async getProductsTitle() {
    const title = await this.waitForVisible(locators.title);
    return title.getText();
  }

  async isInventoryVisible() {
    const inventory = await this.waitForVisible(locators.inventoryList);
    return inventory.isDisplayed();
  }

  async isLoaded() {
    await this.waitForLoaded();
    return (await this.getProductsTitle()) === 'Products';
  }

  async getProductsItems() {
    const items = await this.driver.findElements(locators.inventoryItem);
    return items;
  }

  async getProductsVisibilityStates() {
    const items = await this.getProductsItems(); 
    const visibilityStates = await Promise.all(items.map(async (item) => {
      const isVisible = await item.isDisplayed();
      return isVisible;
    }));
    return visibilityStates;
  }

  async getProductNames() {
    const items = await this.getProductsItems();
    const names = await Promise.all(items.map(async(item) =>{
      const name = await item.findElement(locators.productName).getText();
      return name;
    }));
    return names;
  }
  async getProductPrices() {
    const items = await this.getProductsItems();
    const prices = await Promise.all(items.map(async(item) =>{
      const price = await item.findElement(locators.productPrice).getText();
      return price;
    }));
    return prices;
  }

  async getProductPriceValues() {
    const prices = await this.getProductPrices();
    return prices.map((price) => Number.parseFloat(price.replace(/[^0-9.]/g, '')));
  }

  async getBackpackName() {
    const backpackItem = await this.waitForVisible(locators.backpackTitleLink);
    const name = await backpackItem.getText();
    return name;
  }

  async openBackpackDetails() {
    await this.click(locators.backpackTitleLink);
  }

  async sortProducts(sortValue){
    const sortDropdown = await this.waitForVisible(locators.sortDropdown);
    const sortSelect = new Select(sortDropdown);
    await sortSelect.selectByValue(sortValue);
  }
}

module.exports = ProductsPage;
