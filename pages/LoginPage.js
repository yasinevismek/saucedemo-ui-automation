const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const urlList = require('../utils/urlList');

const locators = Object.freeze({
  username: By.id('user-name'),
  password: By.id('password'),
  loginButton: By.id('login-button'),
  errorMessage: By.css('[data-test="error"]'),
});

class LoginPage extends BasePage {
  async enterUsername(username) {
    await this.type(locators.username, username);
  }

  async enterPassword(password) {
    await this.type(locators.password, password);
  }

  async clickLogin() {
    await this.click(locators.loginButton);
  }


  async login({ username, password }) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  // Login sayfasını açıp giriş yapar.
  async loginAs(user) {
    await this.open(urlList.loginPageUrl);
    await this.login(user);
  }

  async getErrorMessage() {
    const error = await this.waitForVisible(locators.errorMessage);
    return error.getText();
  }

  async isErrorDisplayed() {
    const error = await this.waitForVisible(locators.errorMessage);
    return error.isDisplayed();
  }

  async isLoaded() {
    await this.waitForVisible(locators.username);
    await this.waitForVisible(locators.password);
    await this.waitForVisible(locators.loginButton);
    return (await this.getCurrentUrl()) === urlList.loginPageUrl;
  }
}

module.exports = LoginPage;
