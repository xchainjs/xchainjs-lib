# @xchainjs/zcash-js

## 1.1.2

### Patch Changes

- 0246a01: Update axios 1.13.5 → 1.15.0 to fix critical SSRF and header injection vulnerabilities. Update lodash to ^4.18.0 in zcash-js to fix code injection via \_.template. Update bignumber.js ^10.0.1 → ^11.0.0.

## 1.1.1

### Patch Changes

- 5b56da3: Fix memo fee double-counting in buildTx/prepareMaxTx and bypass in buildMaxTx by standardizing all codepaths to use getFee as the single source of truth for memo output slot calculation

## 1.1.0

### Minor Changes

- a047560: Add buildMaxTx function for sweep/max-send transactions that use all UTXOs with no change output. Also fixes browser compatibility by replacing Buffer.writeBigInt64LE with a browser-compatible helper function.

## 1.0.1

### Patch Changes

- 3ea213e: Upgrade axios to 1.13.5 to fix security vulnerability (GHSA-43fc-jf86-j433)
