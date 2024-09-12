# Changelog

## 1.0.7

### Patch Changes

- Updated dependencies [c303f02]
  - @xchainjs/xchain-evm-providers@1.0.5

## 1.0.6

### Patch Changes

- b4327b9: Change type in roundRobinGetBalance to TokenAsset
- Updated dependencies [b4327b9]
  - @xchainjs/xchain-evm-providers@1.0.4

## 1.0.5

### Patch Changes

- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2
  - @xchainjs/xchain-client@1.0.3
  - @xchainjs/xchain-evm-providers@1.0.3

## 1.0.4

### Patch Changes

- b07b69a: Add function `awaitTxConfirmed` which waits until the approval is confirmed
- Updated dependencies [b07b69a]
  - @xchainjs/xchain-util@1.0.1
  - @xchainjs/xchain-client@1.0.2
  - @xchainjs/xchain-evm-providers@1.0.2

## 1.0.3

### Patch Changes

- 0bf8f3e: Fix keystore approval for EVM

## 1.0.2

### Patch Changes

- 4d96d34: Fix LedgerSigner

## 1.0.1

### Patch Changes

- 837e3e7: Axios version update to v1.7.4
- Updated dependencies [837e3e7]
- Updated dependencies [323cbea]
  - @xchainjs/xchain-evm-providers@1.0.1
  - @xchainjs/xchain-client@1.0.1

## 1.0.0

### Major Changes

- c74614f: New types `Balance`, `TxFrom`, `TxTo`, `Tx`, `TxsPage` with EVM chain based properties.

### Patch Changes

- Updated dependencies [c74614f]
  - @xchainjs/xchain-util@1.0.0
  - @xchainjs/xchain-evm-providers@1.0.0
  - @xchainjs/xchain-client@1.0.0

## 0.6.4

### Patch Changes

- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-util@0.13.7
  - @xchainjs/xchain-client@0.16.8

## 0.6.3

### Patch Changes

- 540326d: Bug fix related to the nonce at making approve and transfer transactions with Keystore clients

## 0.6.2

### Patch Changes

- Updated dependencies [8d000a2]
  - @xchainjs/xchain-client@0.16.7

## 0.6.1

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-client@0.16.6
  - @xchainjs/xchain-util@0.13.6

## 0.6.0

### Minor Changes

- 3ed8127: EVM Client phrase parameter removed.
- 3ed8127: EVM Client works with signer parameter, which represents an account on the EVM chains. Keystore and Ledger signer are currently supported

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [582d682]
  - @xchainjs/xchain-client@0.16.5
  - @xchainjs/xchain-util@0.13.5

## 0.5.1

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-client@0.16.4
  - @xchainjs/xchain-util@0.13.4

## 0.5.0

### Minor Changes

- f432295: Ledger client

### Patch Changes

- 448c29f: New optional parameter `isMemoEncoded` for `transfer`, `prepareTx` and `estimateGasLimit` methods. If it is set to true, memo will not be encoded by the funcions. False by default
- f432295: `approve` return type updated from `ethers.providers.TransactionResponse` to `string`
- Updated dependencies [448c29f]
  - @xchainjs/xchain-client@0.16.3

## 0.4.5

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2

## 0.4.4

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1

## v0.4.3 (2023-12-12)

### Update

- Client dependency increased to 0.16.0
- Evm providers dependency increased to 0.1.5

## v0.4.2 (2023-12-11)

### Update

- Client package version update
- Evm-providers package version updated

## v0.4.1 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.4.0 (2023-11-15)

### Update

- Default gasPrice in baseAmount unit. Changed from GWei to Wei
- Gas price is retrieved from provider as fallback if the getFeeRates round robin fails

## v0.3.8 (2023-11-10)

### Update

- Routescan provider

## v0.3.7 (2023-11-09)

### Update

- Sender address can be retrieved from signer

## v0.3.6 (2023-11-03)

### Update

- EIP1559 params

## v0.3.5 (2023-11-02)

### Update

- estimateGasPrices can difference between protocols and non-protocol interactions

## v0.3.4 (2023-10-26)

### Update

- Refactor transfer method to use prepareTx

## v0.3.2 (2023-09-14)

### Update

- add getFee() from utils into index.js

## v0.3.1 (2023-09-11)

### Update

- Bumped dependencies for util

## v0.3.0 (2023-08-10)

### Update

- add support for fallback on providers
- Update to use `xchain-evm-providers`

## v0.2.2 (2023-05-18)

### Add

- New client function getAssetInfo() returns chain, decimals and asset

## v0.2.1 (2023-05-09)

### Update

- update ethers dependency

## v0.2.0 (2023-05-02)

### Update

- update rollup config and axios to the latest

## v.0.1.5 (2022-04-04)

### Update

- add `broadcastTx() ` to client
- add `getContract` const to utils

## v.0.1.4 (2022-03-21)

### Update

- Update Explorer provider imports & OnlineDataProviders

## v.0.1.3 (2022-12-27)

### Add

- Add `AssetAVAX` and `AVAXChain` definitions

### Update

- Bump `xchain-client@13.5.0`

## v.0.1.2 (2022-12-17)

### Update

- Added `depositWithExpiry` to `routerABI.json`
- Bumped `xchain-client@0.13.4`

## v.0.1.1 (2022-12-24)

### Update

- Bumped dependencies

## v.0.1.0 (2022-10-13)

### Update

- Set Default network to `Network.Mainnet`

## v.0.1.0-alph4 (2022-xx-xx)

### Update

- Bumped `xchain-utils` & `xchain-client`

## v.0.1.0-alph3 (2022-09-29)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.1.0-alph2 (2020-05-28)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.1.0-alpha (2022-07-28)

First release
