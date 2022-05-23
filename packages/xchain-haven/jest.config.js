module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['node_modules/(?!mnemonicconverter)'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  silent: true,
}
