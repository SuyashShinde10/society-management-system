module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  maxWorkers: process.env.CI ? 1 : 2,
  testTimeout: 180000,
};
