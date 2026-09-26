const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');
const urlList = require('../utils/urlList');

const locators = Object.freeze({
  cartList: By.css('[data-test="cart-list"]'),
  cartItem: By.css('[data-test="inventory-item"]'),
  productName: By.css('[data-test="inventory-item-name"]'),
  productPrice: By.css('[data-test="inventory-item-price"]'),
  cartBadge: By.css('[data-test="shopping-cart-badge"]'),
  cartLink: By.css('[data-test="shopping-cart-link"]'),
  checkoutButton: By.id('checkout'),
  removeButton(productId) {
    return By.id(`remove-${productId}`);
  },
});

class CartPage extends BasePage {
  async openCart() {
    await this.click(locators.cartLink);
  }

  async waitForItemCount(expectedCount) {
    await this.driver.wait(async () => {
      const badges = await this.driver.findElements(locators.cartBadge);
      if (expectedCount === 0) {
        return badges.length === 0;
      }
      if (badges.length === 0) {
        return false;
      }
      return Number.parseInt(await badges[0].getText(), 10) === expectedCount;
    }, config.timeouts.explicit);
    return expectedCount;
  }

  async waitForLoaded() {
    await this.driver.wait(until.urlIs(urlList.cartPageUrl), config.timeouts.explicit);
    await this.waitForVisible(locators.cartList);
  }

  async getCartItems() {
    await this.waitForLoaded();
    const items = await this.driver.findElements(locators.cartItem);
    return Promise.all(items.map(async (item) => ({
      name: await item.findElement(locators.productName).getText(),
      price: await item.findElement(locators.productPrice).getText(),
    })));
  }

  async getCartItemCount() {
    await this.waitForLoaded();
    return (await this.driver.findElements(locators.cartItem)).length;
  }

  async removeProduct(productId) {
    await this.click(locators.removeButton(productId));
    await this.driver.wait(
      async () => (await this.driver.findElements(locators.removeButton(productId))).length === 0,
      config.timeouts.explicit,
    );
  }

  async startCheckout() {
    await this.click(locators.checkoutButton);
  }
}

module.exports = CartPage;
