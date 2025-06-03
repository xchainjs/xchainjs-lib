module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testMatch: ['<rootDir>/__e2e__/**/*.[jt]s?(x)'],
  testTimeout: 30000,
}
