import config from './jest.config.mjs'

export default {
  ...config,
  testMatch: ['<rootDir>/__e2e__/**/*.[jt]s?(x)'],
  testTimeout: 60000,
}
