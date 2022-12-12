# v.0.27.5 (2022-12-12)

## Update

- Add optional `sequence` to `transfer` and `deposit` to override `sequence`
- Add helpers `getAccount` and `getSequence` to `utils`

# v.0.27.4 (2022-11-??)

# v.0.27.3 (2022-11-24)

## Update

- Added `customRequestHeaders` to `BroadcastTxParams`
- Bump `xchain-client`

# v.0.27.2 (2022-11-08)

## Update

- changed chain-id-stagenet to `thorchain-stagenet-v2`

# v.0.27.1 (2022-10-13)

- added default `chainIds` in constructor
- added default `explorerUrls` in constructor
- Set Default network to `Network.Mainnet`

## Update

- Bumped `xchain-utils` & `xchain-client`

# v0.27.0 (2022-10-07)

## Breaking Changes

- Removed `getDefaultClientUrl`
- Removed `getChainIds`
- Update `ThorchainClientParams` to make clientUrl required (not optional)

# v.0.26.2 (2022-10-06)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v.0.26.1 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.26.0 (2022-07-20)

## Change

- updated packages xchain-client & xchain-util

# v0.25.3 (2022-07-01)

## Update

- Latest "xchain-cosmos@0.19.0"

# v0.25.2 (2022-06-22)

## Update

- Latest `@cosmos-client/core@0.45.10`
- Latest "xchain-cosmos@0.18.0"

## Fix

- Fix `setNetwork` to create new instance of SDK client

# v0.25.1 (2022-06-17)

## Fix

- Remove estimation of gas in `transfer` and `deposit` (introduced by #564) in favour of using `DEFAULT_GAS_LIMIT_VALUE` or `DEPOSIT_GAS_LIMIT_VALUE` (both can be overridden by users in `transfer` or `deposit`)
- Increase `DEPOSIT_GAS_LIMIT_VALUE` to `600000000` (before `500000000`)

# v0.25.0 (2022-06-16)

## Fix

- Before sending a transaction, gas limits are estimated
- Helper `getEstimatedGas`

## Breaking changes

- Client's `transferOffline` requires `fromAccountNumber` and `fromSequence`
- Rename parameters in `transferOffline` to keep names in camel case (not snake case)
- Rename `DEFAULT_GAS_VALUE` to `DEFAULT_GAS_LIMIT_VALUE`
- Rename `DEPOSIT_GAS_VALUE` to `DEPOSIT_GAS_LIMIT_VALUE`

# v0.24.1 (2022-04-23)

## Fix

- Increase `DEFAULT_GAS_VALUE` to `4000000` (before `3000000`)

# v0.24.0 (2022-03-23)

## Update

- upgraded to "@cosmos-client/core": "0.45.1"
- client now extend BaseXChainClient

## Breaking Changes

- `buildDepositTx` now returns `proto.cosmos.tx.v1beta1.TxBody` from `@cosmos-client/core`

# v0.23.0 (2022-03-08)

## Add

- Helpers `getChainId` + `getChainIds`

## Breaking change

- `chainIds: ChainIds` is required to initialize `Client`

## Fix

- Request fees from THORChain and use `defaultFees` in case of server errors only
- Fix `defaultFees` to be 0.02 RUNE

# v0.22.2 (2022-02-17)

## Fix

- Request fees from THORChain and use `defaultFees` in case of server errors only
- Fix `defaultFees` to be 0.02 RUNE

# v0.22.1 (2022-02-16)

## Fix

- Increase limit for `DEFAULT_GAS_VALUE` from 2000000 to 3000000 to accommodate recent increases in gas used that go above the old limit

# v0.22.0 (2022-02-06)

## Add

- Option to pass `ChainIds` into constructor
- getter / setter for `chainId` in `Client`

## Breaking change

- `buildDepositTx` needs `chainId` to be passed - all params are set as object
- Remove `enum ChainId` + `getChainId` + `isChainId` from `utils`

# v0.21.2 (2022-02-04)

## Fix

- Use latest axios@0.25.0
- xchain-client@0.11.1
- @xchainjs/xchain-util@0.5.1
- @xchainjs/xchain-cosmos@0.16.1

# v.0.21.1 (2022-02-04)

## Fix

- Fix chain id for `testnet` #477

## Add

- Helper `isChainId`
- `enum ChainId`

# v.0.21.0 (2022-02-02)

## Breaking change

- Remove `getDenomWithChain`
- Rename `getAsset` -> `assetFromDenom` (incl. fix to get synth asset properly)

## Update

- xchain-util@0.5.0
- xchain-cosmos@0.16.0

## Add

- `isAssetNativeRune` helper
- Add `TxOfflineParams` type

## Fix

- Fix synth notation in `transfer|transferOffline|deposit` #473

# v0.20.1 (2022-01-11)

## Fix

- Get chain ID from THORNode before posting to deposit handler.

# v.0.20.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` to client

# v.0.19.5 (2021-11-22)

## Add

- Provide `transferOffline` method

# v.0.19.4 (2021-11-22)

## Add

- Provide `getPubKey` method to access public key

## Change

- Make `getPrivKey` method `public` to access private key

# v.0.19.3 (2021-10-31)

## Update

- Use latest `xchain-cosmos@0.13.8` to use `sync` mode for broadcasting txs

# v.0.19.2 (2021-09-27)

## Fix

- Increase `gas` to `500,000,000` (five hundred million)

# v.0.19.1 (2021-09-26)

## Fix

- Increase `gas` to `30,000,000` (thirty million)

# v.0.19.0 (2021-09-10)

## Breaking change

- Extract `buildDepositTx` from `Client` into `utils`

## Add

- Add `getBalance` to `utils`

# v.0.18.0 (2021-09-08)

## Add

- Make `buildDepositTx` public and overrides its fee
- Add `DEPOSIT_GAS_VALUE`

## Breaking change

- Remove `AssetRune` in favour of using `AssetRuneNative` of `xchain-util` only
- Extract `getChainId` into `util` module

# v.0.17.7 (2021-07-20)

## Fix

- cosmos 0.42.x has too many breaking changes that wren't caught in the last version, downgrade "cosmos-client": "0.39.2"

# v.0.17.6 (2021-07-19)

## Update

- bumping peer dependency "cosmos-client": "0.39.2" -> "cosmos-client": "^0.42.7"

# v.0.17.5 (2021-07-18)

## Update

- Updated rollupjs to include axios to enlable usage on node

# v.0.17.4 (2021-07-14)

### Fix

- Bump `fee.gas to `25000000` (twenty five million) to try to avoid failing withdraw txs

# v.0.17.3 (2021-07-07)

## Update

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

# v.0.17.2 (2021-07-05)

## Fix

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

# v.0.17.1 (2021-06-29)

### Fix

- Stick with `cosmos-client@0.39.2`

### Add

- Add examples to README

# v.0.17.0 (2021-06-21)

### Fix

- Fix `to` / `from` addresses by parsing tx data from event logs

### Breaking change

- Remove deprecated `getTxDataFromResponse` helper

# v.0.16.1 (2021-06-14)

### Fix

- Double `fee.gas to `20000000` (twenty million) to avoid failing withdraw transactions

# v.0.16.0 (2021-06-08)

### Breaking change

- Use `viewblock` as default explorer
- [types] Refactored structure of explorer urls (via `type ExplorerUrls`)
- [types] Refactored `ExplorerUrl`
- [client] Constructor accepts `ExplorerUrls`
- [client] Removed `getExplorerNodeUrl` (use `getExplorerAddressUrl` instead)
- [client] Extract `getDefaultClientUrl` into `utils`
- [utils] Renamed `getDefaultExplorerUrlByNetwork` -> `getDefaultExplorerUrl`
- [utils] Removed `getDefaultExplorerAddressUrl`, `getDefaultExplorerNodeUrl`, `getDefaultExplorerTxUrl`
- [utils] Added `getExplorerTxUrl`, `getExplorerAddressUrl`, `getExplorerUrl` helpers

# v.0.15.2 (2021-06-01)

### Update

- updated peer deps

# v.0.15.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.0.14.0 (2021-05-05)

### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

# v.0.13.7 (2021-04-21)

### Update

- Export `MSG_SEND` `MSG_DEPOSIT` `MAX_COUNT`
- Added `getCosmosClient()`
- Extend `getTransactions` parameters with an optional `filterFn`

# v.0.13.6 (2021-04-16)

### Update

- Set `fee.gas` to `10000000` (ten million) in `deposit` due to failing withdraw transactions

# v.0.13.5 (2021-04-16)

### Update

- Set `fee.gas` to `1000000` (one million) in `deposit`

# v.0.13.4 (2021-04-16)

### Update

- Set `fee.gas` to `auto` in `deposit`
- Try sending `deposit` tx up to 3x
- Updates `DEFAULT_GAS_VALUE` to `2000000`

# v.0.13.3 (2021-04-12)

### Breaking changes

- Change `/addresses` to `/address` for explorer url.

### Update

- Add util helpers for explorer urls.

# v.0.13.2 (2021-04-01)

### Update

- Updates `getDefaultClientUrl` to use new mainnet endpoints

# v.0.13.1 (2021-03-18)

### Fix

- Changed `getDefaultExplorerUrl` to return valid urls

# v.0.13.0 (2021-03-02)

### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0
- Update @xchainjs/xchain-cosmos package to 0.11.0

# v.0.12.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0
- Update @xchainjs/xchain-cosmos package to 0.10.0
- Update `getBalance`

# v.0.11.1 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-cosmos package to 0.9.0

### Fix

- Fix `getTransactions` - sort transactions from latest
- Fix `DECIMAL`

# v.0.11.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0

### Update

- Add `Service Providers` section in README.md

### Fix

- Fix `peerDependencies`

# v.0.10.1 (2021-02-05)

### Update

- Update `getTransactions` to support incoming transactions

### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3

# v.0.10.0 (2021-02-03)

### Breaking changes

- Change `getTransactions` to use tendermint rpc. (transaction query from the latest ones.)

# v.0.9.3 (2021-02-02)

### Update

- Add `getExplorerNodeUrl`

# v.0.9.2 (2021-01-30)

- Clear lib folder on build

# v.0.9.1 (2021-01-26)

### Fix

- Fix `deposit`. Use `/thorchain/deposit` to build a deposit transaction.

# v.0.9.0 (2021-01-15)

### Breaking change

- Move `getPrefix` to util

# v.0.8.0 (2021-01-13)

### Breaking change

- change MsgNativeTx.fromJson

# v.0.7.1 (2021-01-06)

### Fix

- Fix getTransactions pagination issue #168

### Update

- Update comments for documentation

# v.0.7.0 (2020-12-28)

### Breaking change

- Extract `getDefaultFees` from `Client` to `utils` #157

# v.0.6.2 (2020-12-23)

### Update

- Use latest xchain-client@0.2.1

### Fix

- Fix invalid assets comparison #151

### Breaking change

- Remove `validateAddress` from `ThorchainClient` #149

# v.0.6.1 (2020-12-18)

### Update

- Add `setClientUrl`
- Add `getDefaultClientUrl`
- Add `getClientUrlByNetwork`

### Fix

- Fix client url for multichain testnet (`https://testnet.thornode.thorchain.info`)

# v.0.6.0 (2020-12-16)

### Update

- Set the latest multi-chain node
- Update `getTransactionData`, `getTransactions`
- Update `transfer` (for `MsgSend`)
- Update `deposit` (for `MsgNativeTx`)

# v.0.5.0 (2020-12-11)

### Update

- Update dependencies
- Add `getDefaultFees`

# v.0.4.2 (2020-11-23)

### Fix

- Fix import of `cosmos/codec`

### Update

- Use latest `@xchainjs/cosmos@0.4.2`

# v.0.4.1 (2020-11-23)

### Update

- Update to latest `@xchainjs/*` packages and other dependencies

# v.0.4.0 (2020-11-20)

### Breaking change

- Update @xchainjs/xchain-crypto package to 0.2.0, deprecating old keystores
