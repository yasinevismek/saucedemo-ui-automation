const config = require('../config/config');

const resolveUrl = (path) => new URL(path, config.baseUrl).href;

// Tüm uygulama adresleri .env içindeki BASE_URL üzerinden oluşturulur.
module.exports = Object.freeze({
  loginPageUrl: config.baseUrl,
  productsPageUrl: resolveUrl('/inventory.html'),
  cartPageUrl: resolveUrl('/cart.html'),
  checkoutStepOnePageUrl: resolveUrl('/checkout-step-one.html'),
  checkoutStepTwoPageUrl: resolveUrl('/checkout-step-two.html'),
  checkoutCompletePageUrl: resolveUrl('/checkout-complete.html'),
  productDetailsPageUrl(productId) {
    const url = new URL('/inventory-item.html', config.baseUrl);
    url.searchParams.set('id', productId);
    return url.href;
  },
});
