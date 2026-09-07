export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib', '<rootDir>/__e2e__'],
  moduleNameMapper: {
    // Keep mocks outside `__mocks__/` so Jest does not auto-apply them to e2e.
    '^near-api-js$': '<rootDir>/test/mocks/near-api-js.ts',
    '^near-api-js/tokens$': '<rootDir>/test/mocks/near-api-js-tokens.ts',
  },
  testTimeout: 60000,
}
