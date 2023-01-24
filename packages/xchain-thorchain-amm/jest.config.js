module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
}
