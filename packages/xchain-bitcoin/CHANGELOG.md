# Changelog

## 0.23.13

### Patch Changes

- 0e07692: Ledger client method `getAddressAsync` with verify parameter

## 0.23.12

### Patch Changes

- Updated dependencies [c71952d]
  - @xchainjs/xchain-util@0.13.3
  - @xchainjs/xchain-client@0.16.2
  - @xchainjs/xchain-utxo@0.1.4
  - @xchainjs/xchain-utxo-providers@0.2.12

## 0.23.11

### Patch Changes

- Updated dependencies [0e42643]
  - @xchainjs/xchain-utxo@0.1.3

## 0.23.10

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1
  - @xchainjs/xchain-utxo@0.1.2
  - @xchainjs/xchain-utxo-providers@0.2.11

## v0.23.9 (2023-12-12)

### Update

- Client dependency increased to 0.16.0
- Utxo client dependency increased to 0.1.1
- Utxo providers dependency increased to 0.2.10

## v0.23.8 (2023-12-11)

### Update

- UTXO client package dependency

## v0.23.7 (2023-12-06)

### Add

- Expose Ledger implementation

## v0.23.6 (2023-11-21)

### Update

- Round robin fee strategy
- Upper fee bound updated
- GetSuggestedFee removed

## v0.23.5 (2023-11-21)

### Update

- BlOCKCYPHER_API_KEY renamed to BLOCKCYPHER_API_KEY

## v0.23.4 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.23.3 (2023-11-10)

### Update

- Utxo-providers package from 0.2.5 to 0.2.6

## v0.23.2 (2023-10-26)

### Update

- Refactor transfer method to use prepareTx

## v.0.23.0 (2023-10-25)

- Remove functions `getFee`, `calcFee`, `getDefaultFeesWithRates`, and `getDefaultFees` from utils
- Remove function `getFeesWithMemo` from client
- Support option `sender` in functions `getFeesWithRates` and `getFees`

## v0.22.4 (2023-10-05)

### Update

- Spend pending UTXO by default

## v0.22.3 (2023-09-11)

### Update

- Bumped dependencies util & utxo Providers

## v0.22.2 (2023-07-10)

### Update

- added process.env[apikey] config as default option to provider creation

## v0.22.1 (2023-05-18)

### Add

- New client function getAssetInfo() returns chain, decimals and asset

- renamed defaultBTCParams to defaultBtcParams to be more consistent with CamelCase

## v0.22.0 (2023-05-02)

### Update

- update rollup config and axios to the latest

## v.0.21.4 (2023-04-11)

### Add

- bump deps

## v.0.21.3 (2023-04-05)

### Add

- Add async `broadcastTx()` to client
- bump xchain-client deps

## v.0.21.2 (2023-04-03)

### Fix

- remove references to process.env in runtime code

## v.0.21.1 (2023-03-29)

### Fix

- make `buildtx` public again

## v.0.21.0 (2023-03-21)

### Update

- add support for BlockCypher
- Update to use `xchain-uxto-providers`

## v.0.20.9 (2023-02-08)

### Update

- add support for sochain v3 API

## v.0.20.8 (2023-01-19)

### Update

- Type safety `BTCChain`

## v.0.20.7 (2022-12-27)

### Add

- Add `AssetBTC` and `BTCChain` definition

### Update

- Bump `xchain-client@13.5.0`

## v.0.20.6 (2022-11-24)

### Update

- reverted `customRequestHeaders` to `BroadcastTxParams`

## v.0.20.5 (2022-11-24)

### Update

- Added `customRequestHeaders` to `BroadcastTxParams`
- Bumped `xchain-client`

## v.0.20.4 (2022-10-14)

### Update

- Set Default network to `Network.Mainnet`

## v.0.20.3 (2022-10-04)

### Update

- Bumped `xchain-utils` & `xchain-client`

## v.0.20.2 (2022-09-30)

### Update

- changed default haskoin url to point to ninerealms

## v.0.20.1 (2022-09-29)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.20.0 (2022-09-05)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.19.0 (2022-07-21)

#### Breaking change

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

## v.0.18.4 (2022-05-17)

### Update

- throw error if memo is longer than 80 chars

## v.0.18.3 (2022-05-08)

### Fix

- Add improvement to error message on utxo pending

## v.0.18.2 (2022-05-05)

### Update

- Add `deposit` function to Bitcoin `Client`
- Update latest dependencies
- Add tests for `deposit`

## v.0.18.1 (2022-03-15)

### Fix

- [Bug] Incorrect fee estimation by rounding down #503

## v.0.18.0 (2022-03-08)

### Update

- Fetch `txHex` optionally by scanning UTXOs #489
- Cache list of `txHex`s in `getTxHexFromCache` to avoid same requests for same data #490
- Cache `confirmed` status in `getConfirmedUnspentTxs` to avoid same requests for same data #490
- Return `inputs` UTXOs from `buildTx` #489
- Extract `Haskoin` types #490

### Fix

- Broadcast same tx several times to Haskoin in case of `500` error #492

### Breaking change

- Add `confirmedOnly` param to `Client.getBalance` and to misc. `balance*` helpers #490
- Broadcast txs via `Haskoin` #490
- Remove `blockstream` as API dependency #490
- Remove deprecated Ledger files (\*\*/\*\*/ledger.ts) #490

## v.0.17.1 (2022-02-04)

### Update

- xchain-util@0.5.1
- xchain-client@0.11.1

## v.0.17.0 (2022-01-05)

### Breaking change

- Make `haskoinUrl` configurable (change default haskoin url back to `https://api.haskoin.com/btc`)
- `haskoinUrl` needs to be passed as parameter into misc. `utils` functions

## v.0.16.0 (2021-12-29)

### Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

## v.0.15.13 (2021-11-12)

- updated haskoin api URL

## v.0.15.12 (2021-09-03)

- updated to the latest dependencies

## v.0.15.11 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

## v.0.15.10 (2021-07-03)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

## v.0.15.9 (2021-06-29)

- added support for pulling fees from thornode.

## v.0.15.8 (2021-06-18)

- changed rollupjs to treat axios as external lib

## v.0.15.7 (2021-06-10)

##### Fix

- [haskoin] Fix `getBalance` (incl. test)

## v.0.15.6 (2021-06-09)

- ???

## v.0.15.5 (2021-06-08)

#### BREAKING CHANGE

##### Issue

[Sochain API](https://sochain.com/) is out of sync and it's reported to be fixed in a few days.
Report from Sochain: "WARNING: DATA SHOWN FOR BITCOIN NETWORK MAY BE OUTDATED
We are working to resolve the issue in the next few days."

##### Fix

- Replace `getBalance` and `getUnspentTxs` apis from sochain to haskoin for temporary purpose.
- Update `Utils.scanUTXOs` method using haskoin api
- Skip unit test for `utils` (it will be reverted after `sochain` api is recovered)

## v.0.15.4 (2021-06-01)

- updating peer deps

## v.0.15.3 (2021-05-31)

- refactor utils.buildTx() to include the memo for calculating inputs with accumulate() but re-adds it into outputs using `psbt.addOutput` to avoid dust attack error

## v.0.15.2 (2021-05-31)

- don't add memo output to `coinselect/accumulative`
- add memo output by using `psbt.addOutput`

## v.0.15.0 (2021-05-28)

#### Breaking change

- prevent spending unconfirmed UTXOs
- update `client.transfer()` to pass `spendPendingUTXO` param to the `Utils.buildTx()`
- update `Utils.buildTx()` to spend only confirmed UTXO if memo exists
- update `Utils.buildTx()` to build `psbt` using `accumulative` lib
- add `getIsTxConfirmed`, `getConfirmedUnspentTxs` sochain api
- add unit test for sochain apis
- add unit test for both success and failed cases of `client.transfer()` to prevent spending unconfirmed UTXOs
- add `coinselect/accumulative` to devDependency and peerDependency, to select which utxos to use as inputs for transfer
- add recursive call to https://sochain.com/api#get-unspent-tx to make sure we fetch ALL utxos
- Merged updates from PR [#324](https://github.com/xchainjs/xchainjs-lib/issues/322) to fix Issue [#322](https://github.com/xchainjs/xchainjs-lib/issues/322)

## v.0.14.0 (2021-05-17)

#### Breaking change

- added support for HD wallets

## v.0.13.0 (2021-05-05)

#### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

## v.0.12.2 (2021-04-19)

#### Update

- Export `calFee`

## v.0.12.1 (2021-03-02)

#### Update

- Export `validateAddress`

## v.0.12.0 (2021-03-02)

#### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0

## v.0.11.1 (2021-02-26)

#### Update

- Export `scanUTXOs` + `buildTx`

## v.0.11.0 (2021-02-24)

#### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0

## v.0.10.1 (2021-02-22)

#### Update

- Uses BlockStream to submit transactions instead of Sochain

## v.0.10.0 (2021-02-19)

#### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0
- Make `feeRate` optional in `transfer()`, default is `fast`

#### Update

- Update README.md

#### Fix

- Fix `peerDependencies`

## v.0.9.0

#### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Change `blockchair` to `sochain`
- Update `getSuggestedFee`

#### Update

- Add `Service Providers` section in README.md

## v.0.8.2 (2021-01-30)

- Clear lib folder on build

## v.0.8.1 (2021-01-15)

#### Change

- Export `getPrefix`

## v.0.8.0 (2021-01-15)

#### Breaking change

- Move `getPrefix` to util

## v.0.7.1 (2021-01-12)

#### Update

- Update `getBalance` to check api key #180
- Update comments for documentation

## v.0.7.0 (2020-12-28)

#### Update

- Add `getDefaultFeesWithRates` to `utils` #157

#### Breaking change

- Extract `getDefaultFees`, `calcFee` from `Client` to `utils` #157
- Remove `validateAddress` from `BitcoinClient`

## v.0.6.0 (2020-12-11)

#### Update

- Update dependencies
- Add `getDefaultFees`
- Add `createTxInfo` to support transactions using Ledger
- Add `getDerivePath` helper

#### Breaking changes

- Remove deprecated stuff of `electrs`
- Extract constants to `src/const`
- Extract common types to `types/common`

#### Fix

- Update exports

## v.0.5.1 (2020-11-20)

#### Update

- Use `getSeed` of `xchain-crypto`
- Remove `bip39` from dependencies
- Use latest `xchain-crypto@0.2.1`

## v.0.5.0 (2020-11-20)

#### Breaking change

- Update @xchainjs/xchain-crypto package to 0.2.0, deprecating old keystores

## v.0.4.4 (2020-12-11)

#### Fix:

- Use latest `xchain-client@0.1.0`

## v.0.4.3 (2020-11-11)

#### Fix

- replaced functions properties to the arrow functions at the `Client`

## v.0.4.1 (2020-10-11)

#### Fix:

- Use latest `xchain-client@0.0.7`

## v.0.4.0 (2020-09-11)

#### Breaking changes:

- Remove usage of a phrase for `BIP39.mnemonicToSeedSync`
- Ignore transactions in `getTransactions` typed as 'nulldata' by Blockchair

## v.0.1.0 (2020-05-11)

First release
