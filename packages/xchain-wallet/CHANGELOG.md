# Changelog

## 1.1.0

### Minor Changes

- d2877b3: Estimate gas limit for EVM clients

## 1.0.12

### Patch Changes

- 33bfa40: Rollup update to latest version.
- Updated dependencies [3e16734]
- Updated dependencies [33bfa40]
  - @xchainjs/xchain-radix@1.1.4
  - @xchainjs/xchain-mayachain@2.0.7
  - @xchainjs/xchain-thorchain@2.0.8
  - @xchainjs/xchain-client@1.0.6
  - @xchainjs/xchain-util@1.0.5
  - @xchainjs/xchain-utxo@1.0.6
  - @xchainjs/xchain-evm@1.0.10

## 1.0.11

### Patch Changes

- Updated dependencies [73b68ed]
  - @xchainjs/xchain-util@1.0.4
  - @xchainjs/xchain-client@1.0.5
  - @xchainjs/xchain-evm@1.0.9
  - @xchainjs/xchain-mayachain@2.0.6
  - @xchainjs/xchain-radix@1.1.3
  - @xchainjs/xchain-thorchain@2.0.7
  - @xchainjs/xchain-utxo@1.0.5

## 1.0.10

### Patch Changes

- Updated dependencies [c81e34d]
  - @xchainjs/xchain-radix@1.1.2

## 1.0.9

### Patch Changes

- Updated dependencies [f90c0d8]
- Updated dependencies [b9c2491]
  - @xchainjs/xchain-util@1.0.3
  - @xchainjs/xchain-mayachain@2.0.5
  - @xchainjs/xchain-thorchain@2.0.6
  - @xchainjs/xchain-client@1.0.4
  - @xchainjs/xchain-evm@1.0.8
  - @xchainjs/xchain-radix@1.1.1
  - @xchainjs/xchain-utxo@1.0.4

## 1.0.8

### Patch Changes

- @xchainjs/xchain-evm@1.0.7

## 1.0.7

### Patch Changes

- ccde096: The `transfer` method has been updated to work with `RadixTxParams` parameters.
- ccde096: The `estimateTransferFees` method has been updated to work with `RadixTxParams` parameters.
- Updated dependencies [ccde096]
- Updated dependencies [ccde096]
- Updated dependencies [ccde096]
- Updated dependencies [ccde096]
- Updated dependencies [ccde096]
- Updated dependencies [b4327b9]
- Updated dependencies [ccde096]
- Updated dependencies [ccde096]
  - @xchainjs/xchain-radix@1.1.0
  - @xchainjs/xchain-evm@1.0.6
  - @xchainjs/xchain-mayachain@2.0.4
  - @xchainjs/xchain-thorchain@2.0.5

## 1.0.6

### Patch Changes

- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2
  - @xchainjs/xchain-client@1.0.3
  - @xchainjs/xchain-evm@1.0.5
  - @xchainjs/xchain-mayachain@2.0.3
  - @xchainjs/xchain-thorchain@2.0.4
  - @xchainjs/xchain-utxo@1.0.3

## 1.0.5

### Patch Changes

- Updated dependencies [d78a201]
  - @xchainjs/xchain-thorchain@2.0.3

## 1.0.4

### Patch Changes

- b07b69a: Add function `awaitTxConfirmed` which waits until the approval is confirmed
- Updated dependencies [b07b69a]
- Updated dependencies [b07b69a]
  - @xchainjs/xchain-evm@1.0.4
  - @xchainjs/xchain-util@1.0.1
  - @xchainjs/xchain-client@1.0.2
  - @xchainjs/xchain-mayachain@2.0.2
  - @xchainjs/xchain-thorchain@2.0.2
  - @xchainjs/xchain-utxo@1.0.2

## 1.0.3

### Patch Changes

- Updated dependencies [0bf8f3e]
  - @xchainjs/xchain-evm@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [4d96d34]
  - @xchainjs/xchain-evm@1.0.2

## 1.0.1

### Patch Changes

- be1c45f: Add CosmosTxParams to estimateTransferFees
- Updated dependencies [837e3e7]
- Updated dependencies [323cbea]
  - @xchainjs/xchain-mayachain@2.0.1
  - @xchainjs/xchain-thorchain@2.0.1
  - @xchainjs/xchain-client@1.0.1
  - @xchainjs/xchain-evm@1.0.1
  - @xchainjs/xchain-utxo@1.0.1

## 1.0.0

### Major Changes

- c74614f: New type `CosmosTxParams` for Cosmos transfers.

### Patch Changes

- Updated dependencies [c74614f]
  - @xchainjs/xchain-util@1.0.0
  - @xchainjs/xchain-mayachain@2.0.0
  - @xchainjs/xchain-thorchain@2.0.0
  - @xchainjs/xchain-client@1.0.0
  - @xchainjs/xchain-evm@1.0.0
  - @xchainjs/xchain-utxo@1.0.0

## 0.1.19

### Patch Changes

- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-client@0.16.8
  - @xchainjs/xchain-evm@0.6.4
  - @xchainjs/xchain-mayachain@1.0.11
  - @xchainjs/xchain-thorchain@1.1.1
  - @xchainjs/xchain-utxo@0.1.10

## 0.1.18

### Patch Changes

- Updated dependencies [9d4c162]
  - @xchainjs/xchain-mayachain@1.0.10

## 0.1.17

### Patch Changes

- 3863979: The parameters and the return type of the method `getBalances` have been updated. Although the parameter `assets` remains optional, it is now a dictionary where the keys are the chains and the values are the assets of the chain. The response has also been updated, and although it remains as a dictionary where the keys are the chains, the value has a property to let the user if the balances of a chain could be retrieved or not.
- Updated dependencies [f29a7ad]
- Updated dependencies [a9fd322]
  - @xchainjs/xchain-thorchain@1.1.0
  - @xchainjs/xchain-mayachain@1.0.9

## 0.1.16

### Patch Changes

- @xchainjs/xchain-mayachain@1.0.8
- @xchainjs/xchain-thorchain@1.0.11

## 0.1.15

### Patch Changes

- Updated dependencies [540326d]
  - @xchainjs/xchain-evm@0.6.3

## 0.1.14

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7
  - @xchainjs/xchain-evm@0.6.2
  - @xchainjs/xchain-mayachain@1.0.7
  - @xchainjs/xchain-thorchain@1.0.10
  - @xchainjs/xchain-utxo@0.1.9

## 0.1.13

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-evm@0.6.1
  - @xchainjs/xchain-mayachain@1.0.6
  - @xchainjs/xchain-thorchain@1.0.9
  - @xchainjs/xchain-util@0.13.6
  - @xchainjs/xchain-utxo@0.1.8

## 0.1.12

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [dd3b45d]
- Updated dependencies [3ed8127]
- Updated dependencies [582d682]
- Updated dependencies [54ba9c2]
- Updated dependencies [3ed8127]
  - @xchainjs/xchain-mayachain@1.0.5
  - @xchainjs/xchain-evm@0.6.0
  - @xchainjs/xchain-thorchain@1.0.8
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-util@0.13.5
  - @xchainjs/xchain-utxo@0.1.7

## 0.1.11

### Patch Changes

- Updated dependencies [b379aeb]
  - @xchainjs/xchain-mayachain@1.0.4
  - @xchainjs/xchain-thorchain@1.0.7

## 0.1.10

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-mayachain@1.0.3
  - @xchainjs/xchain-thorchain@1.0.6
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-util@0.13.4
  - @xchainjs/xchain-utxo@0.1.6
  - @xchainjs/xchain-evm@0.5.1

## 0.1.9

### Patch Changes

- 448c29f: Method `getChainWallet` removed
- 448c29f: New optional parameter `isMemoEncoded` to avoid memo encoding before transfer
- 448c29f: New method `getAssetInfo` for retrieving the native asset of a chain
- f432295: `approve` return type updated from `ethers.providers.TransactionResponse` to `string`
- Updated dependencies [f432295]
- Updated dependencies [448c29f]
- Updated dependencies [448c29f]
- Updated dependencies [f432295]
  - @xchainjs/xchain-evm@0.5.0
  - @xchainjs/xchain-client@0.16.3
  - @xchainjs/xchain-mayachain@1.0.2
  - @xchainjs/xchain-thorchain@1.0.5
  - @xchainjs/xchain-utxo@0.1.5

## 0.1.8

### Patch Changes

- 85fefc5: Xchain wallet `estimateTransferFees` new method
- 09f8125: New mandatory parameter `chain` for `deposit` method

## 0.1.7

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-evm@0.4.5
  - @xchainjs/xchain-mayachain@1.0.1
  - @xchainjs/xchain-thorchain@1.0.4
  - @xchainjs/xchain-utxo@0.1.4

## 0.1.6

### Patch Changes

- 5efae97: Bug fixes
- 0e42643: New method `getFeeRates` for returning the fee rates in the selected chain. It throws an error if the chain does not support the method
- 0e42643: `estimateGasPrices` method deprecated in favor of `getFeeRates` method
- 0e42643: `transfer` method support `feeRate` parameter for UTXO clients and `gasPrice` parameter for EVM clients
- Updated dependencies [0e42643]
  - @xchainjs/xchain-utxo@0.1.3

## 0.1.5

### Patch Changes

- Updated dependencies [ef2d8e2]
- Updated dependencies [ef2d8e2]
  - @xchainjs/xchain-thorchain@1.0.3
  - @xchainjs/xchain-mayachain@1.0.0

## 0.1.4

### Patch Changes

- Updated dependencies [e1ec010]
  - @xchainjs/xchain-thorchain@1.0.2

## 0.1.3

### Patch Changes

- Updated dependencies [bfa655b]
  - @xchainjs/xchain-thorchain@1.0.1

## 0.1.2

### Patch Changes

- Updated dependencies [754fe1a]
- Updated dependencies [754fe1a]
  - @xchainjs/xchain-thorchain@1.0.0

## 0.1.1

### Patch Changes

- 0f92b8c: Approve method

## 0.1.0

### Minor Changes

- 7e2261b: XChain wallet package first release

### Patch Changes

- @xchainjs/xchain-client@0.16.1
- @xchainjs/xchain-evm@0.4.4
