module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  maxWorkers: 2,
  testTimeout: 300000,
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70
    }
  }
};
