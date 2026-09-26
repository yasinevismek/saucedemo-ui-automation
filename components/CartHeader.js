const { By } = require('selenium-webdriver');
const BasePage = require('../pages/BasePage');
const config = require('../config/config');

const locators = Object.freeze({
  cartBadge: By.css('[data-test="shopping-cart-badge"]'),
  cartLink: By.css('[data-test="shopping-cart-link"]'),
});

class CartHeader extends BasePage {
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
}

module.exports = CartHeader;
