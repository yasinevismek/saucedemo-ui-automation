const { beforeEach, afterEach } = require('mocha');
const fs = require('node:fs/promises');
const path = require('node:path');
const addContext = require('mochawesome/addContext');
const config = require('../config/config');
const { createDriver } = require('../utils/driverFactory');

const screenshotsDirectory = path.resolve(__dirname, '../reports/screenshots');

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
      await baseTest.afterEach(this);
    });
  }

  async beforeEach() {
    this.driver = await createDriver();
    await this.driver.manage().window().maximize();

  }

  async afterEach(testContext) {
    try {
      if (this.driver) {
        await this.captureFailureScreenshot(testContext);
        await this.driver.quit();
      }
    } finally {
      this.driver = undefined;
    }
  }

  async captureFailureScreenshot(testContext) {
    if (testContext.currentTest?.state !== 'failed') {
      return;
    }

    try {
      await fs.mkdir(screenshotsDirectory, { recursive: true });
      const testName = testContext.currentTest.fullTitle()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
      const filename = `${testName}-${Date.now()}.png`;
      const screenshot = await this.driver.takeScreenshot();
      await fs.writeFile(path.join(screenshotsDirectory, filename), screenshot, 'base64');
      addContext(testContext, `screenshots/${filename}`);
    } catch (error) {
      console.error(`Failed to capture screenshot: ${error.message}`);
    }
  }
}

module.exports = BaseTest;
