# Changelog

## 2.0.2

### Patch Changes

- 0479f1b: Update dependencies
- 9370688: More dependency updates
- Updated dependencies [0479f1b]
- Updated dependencies [9370688]
  - @xchainjs/xchain-crypto@1.0.1
  - @xchainjs/xchain-util@2.0.1
  - @xchainjs/xchain-client@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [6b03221]
  - @xchainjs/xchain-client@2.0.1

## 2.0.0

### Major Changes

- 621a7a0: Major optimization

### Patch Changes

- Updated dependencies [621a7a0]
  - @xchainjs/xchain-client@2.0.0
  - @xchainjs/xchain-crypto@1.0.0
  - @xchainjs/xchain-util@2.0.0

## 1.0.12

### Patch Changes

- Updated dependencies [590c8eb]
- Updated dependencies [590c8eb]
  - @xchainjs/xchain-util@1.0.8
  - @xchainjs/xchain-client@1.0.10

## 1.0.11

### Patch Changes

- f45246f: added secured asset types
- Updated dependencies [f45246f]
  - @xchainjs/xchain-util@1.0.7
  - @xchainjs/xchain-client@1.0.9

## 1.0.10

### Patch Changes

- f258497: secp256k1 dependency updated to 5.0.1
- Updated dependencies [6ad44a3]
  - @xchainjs/xchain-crypto@0.3.7
  - @xchainjs/xchain-client@1.0.8

## 1.0.9

### Patch Changes

- 0cf33cf: Rollup configuration. Interop option set to 'auto' for CommoJS output
- Updated dependencies [0cf33cf]
  - @xchainjs/xchain-client@1.0.7
  - @xchainjs/xchain-crypto@0.3.6
  - @xchainjs/xchain-util@1.0.6

## 1.0.8

### Patch Changes

- 54fbdf2: Bug fix with getBalance

## 1.0.7

### Patch Changes

- 33bfa40: Rollup update to latest version.
- Updated dependencies [33bfa40]
  - @xchainjs/xchain-client@1.0.6
  - @xchainjs/xchain-crypto@0.3.5
  - @xchainjs/xchain-util@1.0.5

## 1.0.6

### Patch Changes

- Updated dependencies [73b68ed]
  - @xchainjs/xchain-util@1.0.4
  - @xchainjs/xchain-client@1.0.5

## 1.0.5

### Patch Changes

- b9c2491: Cosmosjs dependencies updated to 0.32.4
- Updated dependencies [f90c0d8]
  - @xchainjs/xchain-util@1.0.3
  - @xchainjs/xchain-client@1.0.4

## 1.0.4

### Patch Changes

- b4327b9: Return balances including native and those that are 0

## 1.0.3

### Patch Changes

- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2
  - @xchainjs/xchain-client@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [b07b69a]
  - @xchainjs/xchain-util@1.0.1
  - @xchainjs/xchain-client@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [837e3e7]
- Updated dependencies [323cbea]
  - @xchainjs/xchain-client@1.0.1

## 1.0.0

### Major Changes

- c74614f: New types `Balance`, `TxFrom`, `TxTo`, `Tx`, `TxsPage` and `TxParams` with Cosmos chain based properties.

### Patch Changes

- Updated dependencies [c74614f]
  - @xchainjs/xchain-util@1.0.0
  - @xchainjs/xchain-client@1.0.0

## 0.2.13

### Patch Changes

- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-client@0.16.8

## 0.2.12

### Patch Changes

- f29a7ad: New protected method `getChainId` to retrieve the network id the client is connected to
- f29a7ad: New protected method `getAccount` to retrieve the account of a given address

## 0.2.11

### Patch Changes

- 1a8f57d: Get transaction data bug fix

## 0.2.10

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7

## 0.2.9

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-crypto@0.3.4
  - @xchainjs/xchain-util@0.13.6

## 0.2.8

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- 54ba9c2: Multiple URL clients support
- Updated dependencies [582d682]
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-crypto@0.3.3
  - @xchainjs/xchain-util@0.13.5

## 0.2.7

### Patch Changes

- b379aeb: Keystore logic move from cosmos-sdk client to chain clients

## 0.2.6

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-crypto@0.3.2
  - @xchainjs/xchain-util@0.13.4

## 0.2.5

### Patch Changes

- Updated dependencies [448c29f]
  - @xchainjs/xchain-client@0.16.3

## 0.2.4

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2

## 0.2.3

### Patch Changes

- ef2d8e2: getAssetDecimals abstract function

## 0.2.2

### Patch Changes

- ae35c36: GetTransactionData for non native asset transactions

## 0.2.1

### Patch Changes

- bfa655b: getPrefix abstract function
- bfa655b: setNetwork function bug fix

## 0.2.0

### Minor Changes

- 754fe1a: New util functions: makeClientPath, bech32toBase64 format and base64ToBech32
- 754fe1a: New constructor parameter 'registry' to allow the client to work with custom message types.

### Patch Changes

- 754fe1a: Broadcast bug fix
- 6e86d90: Native asset for fee in transfer method

## 0.1.6

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1

## v0.1.5 (2023-12-12)

### Update

- Client dependency increased to 0.16.0

## v0.1.4 (2023-12-11)

### Update

- Client dependency updated

## v0.1.3 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.1.2 (2023-10-26)

### Update

- Refactor transfer method to use prepareTx

## v.0.1.0 (2023-09-19)

First release
