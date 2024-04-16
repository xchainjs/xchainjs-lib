# Changelog

## 0.7.13

### Patch Changes

- 8e82dc3: Refactored package to include LedgerClient

## 0.7.12

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-utxo@0.1.4
  - @xchainjs/xchain-utxo-providers@0.2.12

## 0.7.11

### Patch Changes

- Updated dependencies [0e42643]
  - @xchainjs/xchain-utxo@0.1.3

## 0.7.10

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1
  - @xchainjs/xchain-utxo@0.1.2
  - @xchainjs/xchain-utxo-providers@0.2.11

## v0.7.9 (2023-12-12)

### Update

- Client dependency increased to 0.16.0
- Utxo client dependency increased to 0.1.1
- Utxo providers dependency increased to 0.2.10

## v0.7.8 (2023-12-11)

### Update

- UTXO client package dependency

## v0.7.7 (2023-11-21)

### Update

- Round robin fee strategy
- GetSuggestedFee removed

## v0.7.6 (2023-11-21)

### Update

- BlOCKCYPHER_API_KEY renamed to BLOCKCYPHER_API_KEY

## v0.7.5 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.7.4 (2023-11-10)

### Update

- Utxo-providers package from 0.2.5 to 0.2.6

## v0.7.3 (2023-10-30)

### Update

- DOGE lower fee bound updated

## v0.7.2 (2023-10-26)

### Update

- Refactor transfer method to use prepareTx

## v.0.7.0 (2023-10-25)

- Remove functions `getFee`, `calcFee`, `getDefaultFeesWithRates`, and `getDefaultFees` from utils
- Remove function `getFeesWithMemo` from client
- Support option `sender` in functions `getFeesWithRates` and `getFees`

## v0.6.5 (2023-06-10)

### Update

- Increase fee estimation

## v0.6.4 (2023-10-05)

### Update

- update deps client & util & utxo-providers

## v0.6.3 (2023-09-13)

### Update

- update deps client & util & utxo-providers

## v0.6.2 (2023-07-10)

### Update

- added process.env[apikey] config as default option to provider creation

## v0.6.1 (2023-05-18)

### Add

- New client function getAssetInfo() returns chain, decimals and asset

## v0.6.0 (2023-05-02)

### Update

- update rollup config and axios to the latest
- update `bitcoinjs-lib` to the latest

## v.0.5.13 (2023-04-11)

### Add

- bump deps

## v.0.5.12 (2023-04-05)

### Add

- Add async `broadcastTx()` to client
- bump xchain-client deps

## v.0.5.11 (2023-04-03)

### Fix

- remove references to process.env in runtime code

## v.0.5.10 (2023-03-29)

### Update

- Update deps

## v.0.5.9 (2023-03-21)

### Update

- Update to use `xchain-uxto-providers`

## v.0.5.8 (2023-02-08)

### Update

- add support for sochain v3 API

## v.0.5.7 (2023-01-19)

### Update

- Type safety `DOGEChain`

## v.0.5.6 (2022-12-27)

### Add

- Add `AssetDOGE` and `DOGEChain` definition

### Update

- Bump `xchain-client@13.5.0`

## v.0.5.5 (2022-11-24)

### Update

- Bumped dependencies

## v.0.5.4 (2022-10-14)

### Update

- Set Default network to `Network.Mainnet`

## v.0.5.3 (2022-10-04)

### Update

- Bumped `xchain-utils` & `xchain-client`

## v.0.5.2 (2022-09-29)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.5.1 (2022-09-27)

### Fix

- Increase value for `setMaximumFeeRate` to reflect current fees

## v.0.5.0 (2022-09-05)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.3.0 (2022-07-21)

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

## v.0.2.1 (2022-05-05)

### Update

- Add `deposit` function to Doge `Client`
- Update latest dependencies
- Add tests for `deposit`

### Fix

- Fix import of `xchain-client`

## v.0.2.0 (2022-03-23)

### Update

- Fetch `txHex` optionally by scanning UTXOs #489
- Cache list of `txHex`s in `getTxHexFromCache` to avoid same requests for same data #490
- Export `buildTx` (from `utils`) and `getSendTxUrl` (from `blockcypher-api`)

### Breaking change

- Remove unspecific `AddressParams` type

## v.0.1.2 (2022-02-04)

- Use latest axios@0.25.0
- xchain-client@0.11.1
- @xchainjs/xchain-util@0.5.1

## v.0.1.1 (2022-01-19)

### ADD

- Add `getPrefix` to `utils`

### REMOVE

- Remove `nodeUrl` from Client constructor

## v.0.1.0 (2022-01-15)

First release
