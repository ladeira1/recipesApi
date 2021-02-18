module.exports = {
  bail: true,
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};
