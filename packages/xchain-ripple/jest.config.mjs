// xrpl.js 5 depends on ESM-only @noble/* and @scure/* builds. Jest must compile those,
// including copies nested under another package's node_modules.
// Target ES2020 so TypeScript does not rewrite BigInt exponentiation to Math.pow.
const esmDependencies = ['@noble/hashes', '@noble/curves', '@scure/bip32', '@scure/bip39'].join('|')

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testTimeout: 30000,
  transform: {
    '^.+\\.[jt]sx?$': [
      'ts-jest',
      {
        diagnostics: {
          exclude: ['**/node_modules/**'],
        },
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          module: 'commonjs',
          target: 'ES2020',
        },
      },
    ],
  },
  transformIgnorePatterns: [`/node_modules/(?!.*(?:${esmDependencies})(?:/|$))`],
}
