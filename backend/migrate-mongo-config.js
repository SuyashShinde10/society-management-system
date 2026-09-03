const dotenv = require('dotenv');
dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017',
    databaseName: process.env.MONGO_DB_NAME || 'society-management',
    options: {}
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

module.exports = config;
