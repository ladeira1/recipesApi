module.exports = {
  bail: true,
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
