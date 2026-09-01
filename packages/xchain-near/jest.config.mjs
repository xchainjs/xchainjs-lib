export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  moduleNameMapper: {
    '^near-api-js$': '<rootDir>/__mocks__/near-api-js.ts',
  },
  testTimeout: 60000,
}
