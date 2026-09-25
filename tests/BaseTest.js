const { beforeEach, afterEach } = require('mocha');
const config = require('../config/config');
const { createDriver } = require('../utils/driverFactory');

class BaseTest {
  // Her describe bloğu kendi BaseTest nesnesiyle hook'larını kaydeder.
  registerHooks(setup) {
    const baseTest = this;

    beforeEach(async function () {
      this.timeout(config.timeouts.browserStartup);
      await baseTest.beforeEach();
      if (setup) {
        await setup();
      }
    });

    afterEach(async function () {
      this.timeout(config.timeouts.browserShutdown);
      await baseTest.afterEach();
    });
  }

  async beforeEach() {
    this.driver = await createDriver();
    await this.driver.manage().window().maximize();

  }

  async afterEach() {
    try {
      if (this.driver) {
        await this.driver.quit();
      }
    } finally {
      this.driver = undefined;
    }
  }
}

module.exports = BaseTest;
