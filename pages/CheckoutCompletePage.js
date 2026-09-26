const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');
const urlList = require('../utils/urlList');

const locators = Object.freeze({
  completeHeader: By.css('[data-test="complete-header"]'),
});

class CheckoutCompletePage extends BasePage {
  async waitForLoaded() {
    await this.driver.wait(until.urlIs(urlList.checkoutCompletePageUrl), config.timeouts.explicit);
    await this.waitForVisible(locators.completeHeader);
  }

  async getConfirmationMessage() {
    const completeHeader = await this.waitForVisible(locators.completeHeader);
    return completeHeader.getText();
  }
}

module.exports = CheckoutCompletePage;
