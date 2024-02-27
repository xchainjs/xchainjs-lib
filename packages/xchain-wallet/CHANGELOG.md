# Changelog

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
