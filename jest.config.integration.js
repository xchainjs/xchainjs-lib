module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testMatch: ['<rootDir>/__integration_tests__/**/*.[jt]s?(x)'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
