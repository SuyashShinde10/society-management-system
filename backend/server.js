// Compatibility bridge for Vercel / CommonJS runners
try {
  module.exports = require('./dist/server');
} catch (e) {
  require('ts-node/register');
  module.exports = require('./server.ts');
}
