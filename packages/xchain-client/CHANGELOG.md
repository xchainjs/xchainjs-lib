# Changelog

## 1.0.7

### Patch Changes

- 0cf33cf: Rollup configuration. Interop option set to 'auto' for CommoJS output
- Updated dependencies [0cf33cf]
  - @xchainjs/xchain-crypto@0.3.6
  - @xchainjs/xchain-util@1.0.6

## 1.0.6

### Patch Changes

- 33bfa40: Rollup update to latest version.
- Updated dependencies [33bfa40]
  - @xchainjs/xchain-crypto@0.3.5
  - @xchainjs/xchain-util@1.0.5

## 1.0.5

### Patch Changes

- Updated dependencies [73b68ed]
  - @xchainjs/xchain-util@1.0.4

## 1.0.4

### Patch Changes

- Updated dependencies [f90c0d8]
  - @xchainjs/xchain-util@1.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [dec3ba3]
  - @xchainjs/xchain-util@1.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [b07b69a]
  - @xchainjs/xchain-util@1.0.1

## 1.0.1

### Patch Changes

- 837e3e7: Axios version update to v1.7.4
- 323cbea: Add info types for assets

## 1.0.0

### Major Changes

- c74614f: Types and interfaces updated with `AnyAsset`.
- c74614f: `OnlineDataProvider`, `EvmOnlineDataProvider`, `OnlineDataProviders` and `EvmOnlineDataProviders` removed.

### Patch Changes

- Updated dependencies [c74614f]
  - @xchainjs/xchain-util@1.0.0

## 0.16.8

### Patch Changes

- Updated dependencies [6fe2b21]
  - @xchainjs/xchain-util@0.13.7

## 0.16.7

### Patch Changes

- 8d000a2: Package.json publish config

## 0.16.6

### Patch Changes

- 15181f4: Release fix
- Updated dependencies [15181f4]
  - @xchainjs/xchain-crypto@0.3.4
  - @xchainjs/xchain-util@0.13.6

## 0.16.5

### Patch Changes

- 582d682: Internal dependencies updated to use workspace nomenclature
- Updated dependencies [582d682]
  - @xchainjs/xchain-crypto@0.3.3
  - @xchainjs/xchain-util@0.13.5

## 0.16.4

### Patch Changes

- b93add9: Dependecies as external at building process
- Updated dependencies [b93add9]
  - @xchainjs/xchain-crypto@0.3.2
  - @xchainjs/xchain-util@0.13.4

## 0.16.3

### Patch Changes

- 448c29f: Method `getAssetInfo` for `XChainClient` interface

## 0.16.2

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3

## 0.16.1

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1

## v0.16.0 (2023-12-12)

### Update

- CalcFee and CalcFeeAsync removed

## v0.15.6 (2023-12-11)

### Update

- UTXO client removed

## v0.15.5 (2023-12-06)

### Add

- Expose Ledger implementation for Bitcoin

## v0.15.4 (2023-11-21)

### Update

- Get fee rates for UTXO data providers and round robin strategy
- Get suggested fee rate removed for UTXO clients

## v0.15.3 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.15.2 (2023-11-02)

### Update

- EVMOnlineDataProvider interface

## v0.15.1 (2023-10-26)

### Update

- prepareTx transaction

## v.0.15.0 (2023-10-25)

- Remove function `getFeesWithMemo` from UTXOClient
- Update signature (support option `sender`) in functions `getFeesWithRates` and `getFees` from UTXOClient

## v0.14.2 (2023-09-11)

### Update

- Bumped dependencies for util

## v0.14.1 (2023-05-18)

### Add

- Abstract function getAssetInfo()

## v0.14.0 (2023-05-02)

### Update

- update rollup config and axios to the latest

## v.0.13.7 (2023-04-05)

### Add

- add `broadcastTx()` to `BaseXChainClient` & `UTXOClient`

## v.0.13.6 (2023-03-23)

### Add

- add OnlineDataProvider, UtxoOnlineDataProvider, ExplorerProvider

## v.0.13.5 (2022-12-27)

### Update

- Bump `xchain-util@0.12.0`

## v.0.13.4 (2022-12-13)

### Update

- removed `customRequestHeaders` from BaseXChainClient

## v.0.13.3 (2022-11-24)

### Update

- added `customRequestHeaders` to BaseXChainClient

## v.0.13.2 (2022-xx-xx)

### Update

- Bumped `xchain-utils`

## v.0.13.1 (2022-09-29)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.13.0 (2022-09-05)

#### Breaking change

- moved isAssetRuneNative(), strip0x(), strip0x() from other libs into client

## v.0.12.0 (2022-07-20)

#### Breaking change

- DepositParams type removed, all thorchain deposits were moved to xchain-thorchain-amm

## v.0.11.3 (2022-05-24)

### Update

- Add tx fee bounds b76d430

## v.0.11.2 (2022-05-05)

### Update

- Add `DepositParams` type to `types.ts`

## v.0.11.1 (2022-02-04)

#### Update

- Use latest `@xchainjs/xchain-util@0.5.1`
- made walletIndex optional in BaseXChainClient.getAddress(walletIndex?: number)
- Use latest axios@0.25.0
- change TxFrom/TxTo to have optional Asset, to support Terra's multiple native asset types (UST, KRT, LUNA, etc)

## v.0.11.0 (2021-12-29)

#### Breaking change

- Expand `Network` enum type to include stagenet and introduce stagenet environment variables to `BaseXChainClient` for thorchain.

## v.0.10.3 (2021-09-02)

- updated to the latest dependencies

## v.0.10.2 (2021-07-18)

- optimized BaseXchainClient to skip creating an addres that just gets thown away in the constructor

## v.0.10.1 (2021-07-07)

#### Update

- Use latest `@xchainjs/xchain-util@0.3.0`

## v.0.10.0 (2021-07-07)

#### Breaking change

- Introduce `Network`, `TxType`, `FeeOption` enums

#### Add

- Introduce `UTXOClient`
- Add fee rate helpers `singleFeeRate`, `standardFeeRates`
- Add fee helpers `singleFee`, `standardFees`, `calcFee`, `calcFeesAsync`

## v.0.9.4 (2021-06-25)

- added BaseXChainClient
- added support for fetch gas fees from thorchain

## v.0.9.3 (2021-06-01)

- updated peer deps

## v.0.9.2 (2021-06-02)

#### Update

- Make `walletIndex` optional in `getAddress`

## v.0.9.1 (2021-05-21)

- No changes, just a bump to next minor version by an accident

## v.0.9.0 (2021-05-17)

#### Breaking change

- added support for HD wallets

## v.0.8.0 (2021-05-05)

#### Breaking change

- Update @xchainjs/xchain-util package to 0.2.7

## v.0.7.0 (2021-03-02)

#### Breaking change

- Add optional parameter for `getTransactionData`

## v.0.6.0 (2021-02-24)

#### Breaking change

- Update `getBalance`

## v.0.5.0 (2021-02-19)

#### Breaking change

- Add @xchainjs/xchain-util to `peerDependencies`

## v.0.4.0 (2020-01-30)

#### Breaking change

- Update @xchainjs/xchain-util package to 0.2.2

#### Breaking change

- Add optional parameter for `getFees`

## v.0.3.0 (2020-28-12)

#### Breaking change

- Remove `getDefaultFees` #157

## v.0.2.1 (2020-23-12)

#### Update

- Add `validateAddress` #149

## v.0.2.0 (2020-12-11)

#### Update

- Update dependencies
- Add `getDefaultFees`

## v.0.1.0 (2020-11-12)

#### Breaking Change

- Remove 'transfer' | 'freeze' from `type TxType`

## v.0.0.7 (2020-11-09)

#### Changes

- reverted 0.0.6 version
