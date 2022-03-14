module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testMatch: ['<rootDir>/__e2e__/**/*.[jt]s?(x)'],
  maxConcurrency: 1,
  setupFilesAfterEnv: ['./jest.setup.js'],
}
