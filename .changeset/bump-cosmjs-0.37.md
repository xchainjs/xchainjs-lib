---
'@xchainjs/xchain-cosmos-sdk': minor
'@xchainjs/xchain-cosmos': minor
'@xchainjs/xchain-thorchain': minor
'@xchainjs/xchain-mayachain': minor
'@xchainjs/xchain-kujira': minor
---

Bump all `@cosmjs/*` packages from 0.34.0 to 0.37.0 (and `cosmjs-types` 0.9.0 → 0.10.1) across cosmos-sdk, cosmos, thorchain, mayachain, and kujira.

Also pin matching versions via root yarn resolutions so a single copy of each CosmJS package is used (avoids duplicate `Registry` type mismatches), pin `@scure/base` to 1.1.5 for CJS/Jest compatibility (CosmJS 0.37 pulls ESM-only `@scure/base@2` by default), and set TypeScript `moduleResolution` to `bundler` so CosmJS 0.37's `exports`-only package.json is resolvable.
