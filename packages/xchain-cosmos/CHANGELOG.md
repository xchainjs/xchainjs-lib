# Changelog

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

- 82a105c: Breaking changes
  - `getSDKClient` removed

### Patch Changes

- Updated dependencies [ef2d8e2]
  - @xchainjs/xchain-cosmos-sdk@0.2.3

## 0.21.10

### Patch Changes

- Updated dependencies [7f7f543]
  - @xchainjs/xchain-crypto@0.3.1
  - @xchainjs/xchain-client@0.16.1

## v0.21.9 (2023-12-12)

### Update

- Client dependency increased to 0.16.0

## v0.21.8 (2023-12-11)

### Update

- Client dependency updated

## v0.21.7 (2023-11-16)

### Update

- Created method getAddressAsync

## v0.21.6 (2023-11-07)

### Fix

- Prepare tx with no initilized addresses

## v0.21.5 (2023-10-26)

### Update

- Refactor transfer method to use prepareTx

## v0.21.3 (2023-09-11)

### Update

- Bumped dependencies for util

## v0.21.2 (2023-07-16)

### Update

- Added type memo:string to rawtxresponse, needed to read memos

## v0.21.1 (2023-05-18)

### Add

- New client function getAssetInfo() returns chain, decimals and asset

## v0.21.0 (2023-05-02)

### Update

- update rollup config and axios to the latest

## v.0.20.9 (2023-04-05)

### Add

- add `broadcastTx()` to client
- bump xchain-client deps

## v.0.20.8 (2023-01-25)

### Update

- Change API to `https://rest.cosmos.directory/cosmoshub`

## v.0.20.7 (2023-01-19)

### Update

- Type safety `GAIAChain`

## v.0.20.6 (2022-12-27)

### Add

- Add `AssetATOM` and `GAIAChain` definition

### Update

- Bump `xchain-client@13.5.0`

## v.0.20.5 (2022-12-13)

### Update

- removed `customRequestHeaders`

## v.0.20.4 (2022-11-22)

### Update

- Added `customRequestHeaders`
- Bumped `xchain-client`

## v.0.20.3 (2022-10-13)

### Update

- Set Default network to `Network.Mainnet`

## v.0.20.2 (2022-xx-xx)

### Update

- Bumped `xchain-utils` & `xchain-client`

## v.0.20.1 (2022-09-29)

### Update

- bumped deps on xchain-utils & xchain-client

## v.0.20.0 (2022-07-20)

### Change

- updated packages xchain-client & xchain-util

## v.0.19.0 (2022-07-01)

### Add

- Helpers `getDefaultRootDerivationPaths`. `getChainId`, `getChainIds`, `protoFee`, `protoMsgSend`, `protoTxBody`, `protoAuthInfo`

### Breaking change

- Helper `getDenom` supports `ATOM` only + returns `null` for all other assets
- Remove `CosmosSDKClient.getUnsignedTxBody`
- Rename `asset` -> `denom` in `TransferParams`
- Change type of `amount` from `string` -> `BaseAmount` in `TransferParams`
- Remove `account` param from `CosmosSDKClient.signAndBroadcast` in favour of `accountNumber`

## v.0.18.0 (2022-06-22)

### Add

- const `DEFAULT_GAS_LIMIT`
- const `DEFAULT_FEE`
- Optional parameter `gasLimit` in `transfer` and `transferOffline`
- Params `clientUrls`, `chainIds` for constructor
- Helper `getDefaultClientUrls`
- Helper `getDefaultChainIds`
- Setter `setNetwork`

### Fix

- `getFees` checks chain fees provided by `inbound_addresses` first, before using `DEFAULT_FEE`
- Initial one instance of `CosmosSDKClient` only depending on network
- Support IBC assets in `getBalances` (#596)
- Get IBC assets from denom in `getAsset`
- Order txs in `getTxsFromHistory` to have latest txs on top
- Fix `RawTxResponse` type

### Update

- Result of `getTxsFromHistory` is filtered by given asset
- Move misc. constants into `const.ts`
- `getTxsFromHistory` checks `MsgSend` txs only and ignores `MsgMultiSend` txs from now
- Latest `@cosmos-client/core@0.45.10`

### Breaking change

- Remove deprecated `AssetMuon`
- Remove deprecated `Client.getMainAsset`
- Remove deprecated `BaseAccountResponse`
- Rename `DECIMAL` -> `COSMOS_DECIMAL`

## v.0.17.0 (2022-03-23)

### Update

- upgraded to "@cosmos-client/core": "0.45.1"
- client now extend BaseXChainClient

### Breaking changes

- Remove `minheight` and `maxheight` params from `CosmosSDKClient.searchTx` (params were removed from the API)

## v.0.16.1 (2022-02-04)

- Use latest axios@0.25.0
- xchain-client@0.11.1
- @xchainjs/xchain-util@0.5.1

## v.0.16.0 (2022-02-02)

### Breaking change

- Remove `from_balance` from `TxOfflineParams`

### Update

- Use @xchainjs/xchain-util@0.5.0

## v.0.15.0 (2021-12-29)

### Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

## v.0.14.0 (2021-12-15)

#### Update

- [CosmosSDKClient] revert Extract `sign` and `broadcast` from `signAndBroadcast`
- extract public part into `unsignedStdTxGet` to use it in `transfer` and `transferSignedOffline`

#### Add

- `TxOfflineParams` types
- `transferSignedOffline` functions

## v.0.13.9 (2021-11-30)

#### Update

- [CosmosSDKClient] Extract `sign` and `broadcast` from `signAndBroadcast`

## v.0.13.8 (2021-10-31)

#### Update

- Use `sync` instead of `block` mode for broadcasting txs

## v.0.13.7 (2021-07-20)

- cosmos 0.42.x has too many breaking changes that wren't caught in the last version, downgrade "cosmos-client": "0.39.2"

## v.0.13.6 (2021-07-18)

- upgraded "cosmos-client": "0.42.7"

## v.0.13.5 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

## v.0.13.4 (2021-07-05)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

## v.0.13.3 (2021-06-29)

#### Fix

- Stick with `cosmos-client@0.39.2`

## v.0.13.1 (2021-06-01)

- updated peer deps

## v.0.13.0 (2021-05-17)

#### Breaking change

- added support for HD wallets

## v.0.12.0 (2021-05-05)

#### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

## v.0.11.0 (2021-03-02)

#### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0

## v.0.10.0 (2021-02-24)

#### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0
- Update `getBalance`

## v.0.9.0 (2021-02-19)

#### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0

#### Update

- Update @xchainjs/xchain-client package to 0.5.0
- Add `Service Providers` section in README.md

#### Fix

- Fix `peerDependencies`

## v.0.8.1 (2021-02-05)

#### Update

- Add transfer.sender, transfer.recipient option for transaction search.

#### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Update @xchainjs/xchain-util package to 0.2.2

## v.0.8.0 (2021-02-03)

#### Update

- Add `searchTxFromRPC` : search transactions using tendermint rpc.

## v.0.7.1 (2021-01-30)

- Clear lib folder on build

## v.0.7.0 (2021-01-15)

#### Update

- Update comments for documentation
- Add `getPrefix`

#### Breaking change

- Remove `deposit`

## v.0.6.0 (2020-12-28)

#### Breaking change

- Extract `getDefaultFees` from `Client` to `utils` #157
- Remove `validateAddress` from `CosmosClient`

## v.0.5.1 (2020-12-16)

#### Update

- Extract `signAndBroadcast` from `transfer`

## v.0.5.0 (2020-12-11)

#### Update

- Update dependencies
- Move `cosmos-client` to `dependencies`
- Add `getDefaultFees`

## v.0.4.2 (2020-11-23)

#### Fix imports

- Fix imports of `cosmos/codec`

## v.0.4.1 (2020-11-23)

#### Update

- Update to latest `@xchainjs/*` packages and other dependencies

## v.0.4.0 (2020-11-20)

#### Breaking change

- Update @xchainjs/xchain-crypto package to 0.2.0, deprecating old keystores
