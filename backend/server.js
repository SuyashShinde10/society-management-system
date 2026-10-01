// Compatibility bridge for Vercel / CommonJS runners
let appModule;
try {
  appModule = require('./dist/server');
} catch (e) {
  try {
    require('ts-node/register');
    appModule = require('./server.ts');
  } catch (tsErr) {
    appModule = require('./dist/server');
  }
}
const app = appModule && appModule.default ? appModule.default : appModule;
module.exports = app;
module.exports.default = app;
