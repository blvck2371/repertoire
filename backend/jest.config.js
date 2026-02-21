module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/vault-loader.js'
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
  }
};
