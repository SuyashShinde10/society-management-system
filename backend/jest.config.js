module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  maxWorkers: 2,
  testTimeout: 60000,
};
