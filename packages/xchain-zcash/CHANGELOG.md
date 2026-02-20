# @xchainjs/xchain-zcash

## 1.3.0

### Minor Changes

- 1c73ad6: Add coin control support to all UTXO chains

  - Add public `getUTXOs()` method to base UTXO client for listing unspent outputs
  - Add optional `selectedUtxos` parameter to `transfer`, `transferMax`, `prepareTxEnhanced`, `prepareMaxTx`, and related methods across all UTXO chain clients
  - When `selectedUtxos` is provided, the specified UTXOs are used directly instead of fetching from chain, enabling manual coin selection
  - Add Coin Control UI component in xchain-suite for browsing and selecting UTXOs

### Patch Changes

- Updated dependencies [1c73ad6]
  - @xchainjs/xchain-utxo@2.2.0

## 1.2.0

### Minor Changes

- a047560: Add buildMaxTx function for sweep/max-send transactions that use all UTXOs with no change output. Also fixes browser compatibility by replacing Buffer.writeBigInt64LE with a browser-compatible helper function.
- 267a677: Update to utxo selection algorithm & add prepareTxEnhanced

### Patch Changes

- Updated dependencies [a047560]
- Updated dependencies [267a677]
- Updated dependencies [83f553b]
  - @xchainjs/zcash-js@1.1.0
  - @xchainjs/xchain-utxo@2.1.0

## 1.1.1

### Patch Changes

- 3ea213e: Upgrade axios to 1.13.5 to fix security vulnerability (GHSA-43fc-jf86-j433)
- Updated dependencies [3ea213e]
  - @xchainjs/xchain-client@2.0.10
  - @xchainjs/xchain-utxo-providers@2.0.10
  - @xchainjs/zcash-js@1.0.1
  - @xchainjs/xchain-utxo@2.0.10

## 1.1.0

### Minor Changes

- 080e2f2: Update xchain-zcash to use @xchainjs/zcash-js with NU6.1 consensus branch ID support

  - Changed dependency from @mayaprotocol/zcash-js to @xchainjs/zcash-js
  - NU6.1 consensus branch ID (0x4DEC4DF0) fixes transaction broadcasting since Nov 24, 2025
  - Browser-compatible: replaced blake2b-wasm with @noble/hashes

  Note: @xchainjs/zcash-js is a new package (1.0.0) and will be published alongside this update.

  Fixes GitHub issue #1592

## 1.0.10

### Patch Changes

- Updated dependencies [b1c99c8]
- Updated dependencies [63ec81f]
  - @xchainjs/xchain-client@2.0.9
  - @xchainjs/xchain-utxo@2.0.9
  - @xchainjs/xchain-util@2.0.5
  - @xchainjs/xchain-utxo-providers@2.0.9

## 1.0.9

### Patch Changes

- Updated dependencies [cfd0dc7]
  - @xchainjs/xchain-crypto@1.0.6
  - @xchainjs/xchain-client@2.0.8
  - @xchainjs/xchain-utxo@2.0.8
  - @xchainjs/xchain-utxo-providers@2.0.8

## 1.0.8

### Patch Changes

- Updated dependencies [33b3ca5]
  - @xchainjs/xchain-crypto@1.0.5
  - @xchainjs/xchain-client@2.0.7
  - @xchainjs/xchain-utxo@2.0.7
  - @xchainjs/xchain-utxo-providers@2.0.7

## 1.0.7

### Patch Changes

- 59a4a07: Fix vulnerability form-data
- Updated dependencies [59a4a07]
  - @xchainjs/xchain-client@2.0.6
  - @xchainjs/xchain-crypto@1.0.4
  - @xchainjs/xchain-util@2.0.4
  - @xchainjs/xchain-utxo@2.0.6
  - @xchainjs/xchain-utxo-providers@2.0.6

## 1.0.6

### Patch Changes

- Updated dependencies [ba9247b]
- Updated dependencies [e7bc97f]
  - @xchainjs/xchain-utxo-providers@2.0.5
  - @xchainjs/xchain-client@2.0.5
  - @xchainjs/xchain-crypto@1.0.3
  - @xchainjs/xchain-utxo@2.0.5

## 1.0.5

### Patch Changes

- 4ff6d9a: updates and jest config changes
- 2a9674b: fix typescript config
- Updated dependencies [16de875]
- Updated dependencies [c612862]
- Updated dependencies [4ff6d9a]
- Updated dependencies [2a9674b]
  - @xchainjs/xchain-crypto@1.0.2
  - @xchainjs/xchain-utxo-providers@2.0.4
  - @xchainjs/xchain-utxo@2.0.4
  - @xchainjs/xchain-client@2.0.4
  - @xchainjs/xchain-util@2.0.3

## 1.0.4

### Patch Changes

- Updated dependencies [4012c06]
  - @xchainjs/xchain-util@2.0.2
  - @xchainjs/xchain-client@2.0.3
  - @xchainjs/xchain-utxo@2.0.3
  - @xchainjs/xchain-utxo-providers@2.0.3

## 1.0.3

### Patch Changes

- 9370688: More dependency updates
- Updated dependencies [0479f1b]
- Updated dependencies [9370688]
  - @xchainjs/xchain-utxo-providers@2.0.2
  - @xchainjs/xchain-crypto@1.0.1
  - @xchainjs/xchain-util@2.0.1
  - @xchainjs/xchain-utxo@2.0.2
  - @xchainjs/xchain-client@2.0.2

## 1.0.0

### Major Changes

- 621a7a0: Major optimization

### Patch Changes

- Updated dependencies [621a7a0]
  - @xchainjs/xchain-utxo-providers@2.0.0
  - @xchainjs/xchain-client@2.0.0
  - @xchainjs/xchain-crypto@1.0.0
  - @xchainjs/xchain-util@2.0.0
  - @xchainjs/xchain-utxo@2.0.0

## 0.0.1

### Patch Changes

- 153dead: Create zcash client
- Updated dependencies [153dead]
  - @xchainjs/xchain-utxo-providers@1.0.11
  - @xchainjs/xchain-utxo@1.0.11
