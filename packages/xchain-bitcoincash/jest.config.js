module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
}
