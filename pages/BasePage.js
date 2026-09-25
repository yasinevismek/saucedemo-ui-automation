const { until } = require('selenium-webdriver');
const config = require('../config/config');
const urlList = require('../utils/urlList');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async open(path) {
    await this.driver.get(new URL(path).href);
  }

  async pauseForObservation() {
    if (config.actionDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, config.actionDelayMs));
    }
  }

  async waitForVisible(locator) {
    const element = await this.driver.wait(until.elementLocated(locator), config.timeouts.explicit);
    await this.driver.wait(until.elementIsVisible(element), config.timeouts.explicit);
    return element;
  }

async type(locator, value) {
  const element = await this.waitForVisible(locator);
  await this.driver.wait(
    until.elementIsEnabled(element),
    config.timeouts.explicit,
  );
  await element.clear();
  await element.sendKeys(value);
  await this.pauseForObservation();
}

async click(locator) {
  const element = await this.waitForVisible(locator);
  await this.driver.wait(
    until.elementIsEnabled(element),
    config.timeouts.explicit,
  );
  await element.click();
  await this.pauseForObservation();
}

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }
}

module.exports = BasePage;
