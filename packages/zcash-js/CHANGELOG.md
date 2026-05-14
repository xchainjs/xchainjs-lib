# @xchainjs/zcash-js

## 1.1.3

### Patch Changes

- 70acc68: Bump axios from 1.15.0 to 1.15.2 to patch high-severity advisories: GHSA-pmwg-cvhr-8vh7 (NO_PROXY loopback bypass), GHSA-q8qp-cvcw-x6jj (HTTP adapter prototype pollution), GHSA-pf86-5x62-jrwf (response/request prototype pollution gadgets), and GHSA-6chq-wfr3-2hj9 (header injection via prototype pollution).

  Bump protobufjs from 6.11.4 to 7.5.5 in `@xchainjs/xchain-cosmos`, `@xchainjs/xchain-mayachain`, and `@xchainjs/xchain-thorchain` to patch GHSA-xq3m-2v4x-88gg (critical: arbitrary code execution).

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
