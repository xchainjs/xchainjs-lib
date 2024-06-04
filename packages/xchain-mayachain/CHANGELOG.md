# Changelog

## 1.0.11

### Patch Changes

- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-client@0.16.8
  - @xchainjs/xchain-cosmos-sdk@0.2.13

## 1.0.10

### Patch Changes

- 9d4c162: correct default fee from 0.5 to 0.2

## 1.0.9

### Patch Changes

- a9fd322: Synthetic assets decimals bug fix
- Updated dependencies [f29a7ad]
- Updated dependencies [f29a7ad]
  - @xchainjs/xchain-cosmos-sdk@0.2.12

## 1.0.8

### Patch Changes

- Updated dependencies [1a8f57d]
  - @xchainjs/xchain-cosmos-sdk@0.2.11

## 1.0.7

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7
  - @xchainjs/xchain-cosmos-sdk@0.2.10

## 1.0.6

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-cosmos-sdk@0.2.9
  - @xchainjs/xchain-util@0.13.6

## 1.0.5

### Patch Changes

- dd3b45d: Get balance with synth assets bug fix
- 582d682: Internal dependencies updated to use workspace nomenclature
- 54ba9c2: Multiple URL clients support
- Updated dependencies [582d682]
- Updated dependencies [54ba9c2]
  - @xchainjs/xchain-cosmos-sdk@0.2.8
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-util@0.13.5

## 1.0.4

### Patch Changes

- b379aeb: Keystore logic move from cosmos-sdk client to chain clients
- Updated dependencies [b379aeb]
  - @xchainjs/xchain-cosmos-sdk@0.2.7

## 1.0.3

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-cosmos-sdk@0.2.6
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-util@0.13.4

## 1.0.2

### Patch Changes

- Updated dependencies [448c29f]
  - @xchainjs/xchain-client@0.16.3
  - @xchainjs/xchain-cosmos-sdk@0.2.5

## 1.0.1

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-cosmos-sdk@0.2.4

## 1.0.0

### Major Changes

- ef2d8e2: Breaking changes
  - `getPrivateKey` is now async and response is Uint8Array type
  - `getPubKey` is now async and response is Uint8Array type
  - `getDepositTransaction` is deprecated in favour of `getTransactionData`
  - `fetchTransaction` removed
  - `setClientUrl` removed
  - `getClientUrl` removed
  - `setExplorerUrls` removed
  - `getCosmosClient` removed
  - `setChainId` removed
  - `getChainId` removed

### Patch Changes

- Updated dependencies [ef2d8e2]
  - @xchainjs/xchain-cosmos-sdk@0.2.3

## 0.2.16

### Patch Changes

- bb51e47: Mayascan as explorer

## 0.2.15

### Patch Changes

- 273da94: Maya synths return with 1e8 instead of 1e10

## 0.2.14

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1
  - @xchainjs/xchain-cosmos@0.21.10

## v0.2.13 (2023-12-12)

### Update

- Client dependency increased to 0.16.0
- Cosmos dependency increased to 0.21.9

## v0.2.12 (2023-12-11)

### Update

- Client and Cosmos client dependency updated

## v0.2.11 (2023-11-27)

### Update

- changed endpoint for fetchin native tx fees & changed defaultFee

## v0.2.10 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.2.9 (2023-11-07)

### Fix

- Prepare tx with no initilized addresses

## v0.2.8 (2023-10-26)

### Update

- Refactor transfer method to use prepareTx

## v0.2.6 (2023-10-11)

### Update

- Fix transfer sync and fee estimation decimals

## v0.2.5 (2023-07-29)

### Update

- udpate spelling error in client

## v0.2.4 (2023-07-11)

### Update

- Removed all instances of 'thorchain' from comments and some urls

## v0.2.3 (2023-06-02)

### Add

- Support to account for `maya` denom when using `getBalance` from client

## v0.2.2 (2023-05-31)

### Update

- Update CACAO_DECIMAL from 8 to 10

### Add

- New asset for $MAYA
- MAYA_DECIMAL constant

## v0.2.1 (2023-05-18)

### Add

- New client function getAssetInfo() returns chain, decimals and asset & rename DECIMAL - CACAO_DECIMAL

## v0.2.0 (2023-05-02)

### Update

- update rollup config and axios to the latest
- update `@types/big.js`

## v0.1.2 (2023-04-04)

### add

- add `broadcastTx()` to client
- bump `xchain-evm` dep

## v0.1.1 (2023-01-19)

### Update

- Type safety `MAYAChain`

### Module Created

## v0.1.0 (2023-01-06)

### Module Created
