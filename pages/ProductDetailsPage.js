const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');


const locators = Object.freeze({
    backToProductsButton: By.id('back-to-products'),
    productName: By.css('[data-test="inventory-item-name"]'),
});

class ProductDetailsPage extends BasePage {

    async waitForLoaded() {
        await this.waitForVisible(locators.backToProductsButton);
    }
    async getProductName() {
        const nameElement = await this.waitForVisible(locators.productName);
        return nameElement.getText();
    }

    async backToProducts() {
        await this.click(locators.backToProductsButton);
    }
}

module.exports = ProductDetailsPage;
