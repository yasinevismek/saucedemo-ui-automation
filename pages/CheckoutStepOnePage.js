const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../config/config');
const urlList = require('../utils/urlList');

const locators = Object.freeze({
  firstName: By.id('first-name'),
  lastName: By.id('last-name'),
  postalCode: By.id('postal-code'),
  continueButton: By.id('continue'),
  cancelButton: By.id('cancel'),
  errorMessage: By.css('[data-test="error"]'),
});

class CheckoutStepOnePage extends BasePage {
  async waitForLoaded() {
    await this.driver.wait(until.urlIs(urlList.checkoutStepOnePageUrl), config.timeouts.explicit);
    await this.waitForVisible(locators.firstName);
    await this.waitForVisible(locators.lastName);
    await this.waitForVisible(locators.postalCode);
  }

  async enterCustomerInformation({ firstName, lastName, postalCode }) {
    await this.type(locators.firstName, firstName);
    await this.type(locators.lastName, lastName);
    await this.type(locators.postalCode, postalCode);
  }

  async continue() {
    await this.click(locators.continueButton);
  }

  async cancel() {
    await this.click(locators.cancelButton);
  }

  async submitCustomerInformation(customer) {
    await this.enterCustomerInformation(customer);
    await this.continue();
  }

  async getErrorMessage() {
    const errorMessage = await this.waitForVisible(locators.errorMessage);
    return errorMessage.getText();
  }
}

module.exports = CheckoutStepOnePage;
