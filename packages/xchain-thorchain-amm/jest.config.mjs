// xrpl 5 depends on ESM-only @noble/* and @scure/* builds, including copies
// nested under @xrplf/isomorphic. @mysten/sui 2 is .mjs and is bundled to CJS
// by jest-esm-resolver.cjs, because Jest cannot transform .mjs.
// Target ES2020 so TypeScript does not rewrite BigInt exponentiation to Math.pow.
const esmDependencies = ['@noble/hashes', '@noble/curves', '@scure/bip32', '@scure/bip39'].join('|')

const tsJestOptions = {
  diagnostics: {
    exclude: ['**/node_modules/**'],
  },
  tsconfig: {
    allowJs: true,
    esModuleInterop: true,
    module: 'commonjs',
    target: 'ES2020',
  },
}

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/lib'],
  testTimeout: 60000,
  resolver: '<rootDir>/jest-esm-resolver.cjs',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', tsJestOptions],
    [`/node_modules/(?:.*/)?(?:${esmDependencies})/.+\\.(?:cjs|js)$`]: ['ts-jest', tsJestOptions],
  },
  transformIgnorePatterns: [`/node_modules/(?!.*(?:${esmDependencies})(?:/|$))`],
}
