const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

if (!process.env.BASE_URL) {
  throw new Error('BASE_URL tanımlanmalı. .env.example dosyasını .env olarak kopyalayın.');
}

const baseUrl = new URL(process.env.BASE_URL);
if (!['https:', 'http:'].includes(baseUrl.protocol)) {
  throw new Error('BASE_URL geçerli bir HTTP veya HTTPS adresi olmalıdır.');
}

module.exports = Object.freeze({
  baseUrl: baseUrl.href,
  actionDelayMs: process.env.ACTION_DELAY_MS ? parseInt(process.env.ACTION_DELAY_MS, 10) : 0,
  timeouts: Object.freeze({
    explicit: 15000,
    pageLoad: 30000,
    script: 15000,
    browserStartup: 180000,
    browserShutdown: 30000,
  }),
});
