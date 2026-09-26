const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');
const urlList = require('../utils/urlList');

const locators = Object.freeze({
  finishButton: By.id('finish'),
  orderItem: By.css('[data-test="inventory-item"]'),
  productName: By.css('[data-test="inventory-item-name"]'),
  productPrice: By.css('[data-test="inventory-item-price"]'),
  itemTotal: By.css('[data-test="subtotal-label"]'),
  tax: By.css('[data-test="tax-label"]'),
  total: By.css('[data-test="total-label"]'),
});

const parseCurrency = (label) => Number.parseFloat(label.match(/\$([\d.]+)/)[1]);

class CheckoutStepTwoPage extends BasePage {
  async waitForLoaded() {
    await this.driver.wait(until.urlIs(urlList.checkoutStepTwoPageUrl), config.timeouts.explicit);
    await this.waitForVisible(locators.finishButton);
  }

  async getOrderItems() {
    await this.waitForVisible(locators.orderItem);
    const items = await this.driver.findElements(locators.orderItem);
    return Promise.all(items.map(async (item) => ({
      name: await item.findElement(locators.productName).getText(),
      price: await item.findElement(locators.productPrice).getText(),
    })));
  }

  async getOrderTotals() {
    const [itemTotal, tax, total] = await Promise.all([
      this.waitForVisible(locators.itemTotal),
      this.waitForVisible(locators.tax),
      this.waitForVisible(locators.total),
    ]);
    const [itemTotalText, taxText, totalText] = await Promise.all([
      itemTotal.getText(),
      tax.getText(),
      total.getText(),
    ]);
    return {
      itemTotal: parseCurrency(itemTotalText),
      tax: parseCurrency(taxText),
      total: parseCurrency(totalText),
    };
  }

  async finishCheckout() {
    await this.click(locators.finishButton);
  }
}

module.exports = CheckoutStepTwoPage;
