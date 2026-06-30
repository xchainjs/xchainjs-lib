# Changelog

## 3.0.9

### Patch Changes

- Updated dependencies [4ec2e3e]
  - @xchainjs/xchain-crypto@1.0.8
  - @xchainjs/xchain-client@2.0.16

## 3.0.8

### Patch Changes

- Updated dependencies [dbdfc76]
  - @xchainjs/xchain-crypto@1.0.7
  - @xchainjs/xchain-client@2.0.15

## 3.0.7

### Patch Changes

- Updated dependencies [51569ce]
  - @xchainjs/xchain-client@2.0.14

## 3.0.6

### Patch Changes

- Updated dependencies [70acc68]
- Updated dependencies [5f92a68]
  - @xchainjs/xchain-client@2.0.13

## 3.0.5

### Patch Changes

- Updated dependencies [0246a01]
- Updated dependencies [c4682c4]
  - @xchainjs/xchain-client@2.0.12
  - @xchainjs/xchain-util@2.0.7

## 3.0.4

### Patch Changes

- Updated dependencies [3dd82dd]
  - @xchainjs/xchain-util@2.0.6
  - @xchainjs/xchain-client@2.0.11

## 3.0.3

### Patch Changes

- 2ffbecd: Fix TRON transaction error handling - properly check result field from sendRawTransaction and decode hex error messages

## 3.0.2

### Patch Changes

- Updated dependencies [3ea213e]
  - @xchainjs/xchain-client@2.0.10

## 3.0.1

### Patch Changes

- f9f62d2: Fix token balance metadata error

## 3.0.0

### Major Changes

- 11a8634: add tron ledger client

## 2.0.0

### Major Changes

- 713ba6f: Initial release of @xchainjs/xchain-tron package

  - Add Tron blockchain support to XChainJS ecosystem
  - Implement TronClient with keystore and basic functionality
  - Add TronGrid integration for blockchain data access
  - Support for TRX transfers and TRC20 token operations
  - Include comprehensive TypeScript definitions
  - Add e2e tests for client functionality
  - Support for address validation and transaction building

## 1.0.0

### Major Changes

- 7d24360: Initial release of @xchainjs/xchain-tron package

  - Add Tron blockchain support to XChainJS ecosystem
  - Implement TronClient with keystore and basic functionality
  - Add TronGrid integration for blockchain data access
  - Support for TRX transfers and TRC20 token operations
  - Include comprehensive TypeScript definitions
  - Add e2e tests for client functionality
  - Support for address validation and transaction building

### Dependencies

- @xchainjs/xchain-client@^2.0.9
- @xchainjs/xchain-crypto@^1.0.6
- @xchainjs/xchain-util@^2.0.5
- tronweb@^6.0.4
