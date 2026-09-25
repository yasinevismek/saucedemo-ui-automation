const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/config');

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--window-size=1440,1000');
  options.setUserPreferences({
    credentials_enable_service: false,
    'profile.password_manager_enabled': false,
    'profile.password_manager_leak_detection': false,
  });

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.manage().setTimeouts({
      implicit: 0,
      pageLoad: config.timeouts.pageLoad,
      script: config.timeouts.script,
    });
    return driver;
  } catch (error) {
    // Kurulum başarısız olsa da oluşturulan browser oturumunu kapat.
    try {
      await driver.quit();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Browser kurulumu ve kapatılması başarısız.');
    }
    throw error;
  }
}

module.exports = { createDriver };
