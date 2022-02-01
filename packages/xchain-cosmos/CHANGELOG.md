# v.0.15.2 (2022-01-10)

- upgrade axios dependency to latest

# v.0.15.1 (2022-01-28)

## Update

- Use @xchainjs/xchain-util@0.5.0

# v.0.15.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

# v.0.14.0 (2021-12-15)

### Update

- [CosmosSDKClient] revert Extract `sign` and `broadcast` from `signAndBroadcast`
- extract public part into `unsignedStdTxGet` to use it in `transfer` and `transferSignedOffline`

### Add

- `TxOfflineParams` types
- `transferSignedOffline` functions

# v.0.13.9 (2021-11-30)

### Update

- [CosmosSDKClient] Extract `sign` and `broadcast` from `signAndBroadcast`

# v.0.13.8 (2021-10-31)

### Update

- Use `sync` instead of `block` mode for broadcasting txs

# v.0.13.7 (2021-07-20)

- cosmos 0.42.x has too many breaking changes that wren't caught in the last version, downgrade "cosmos-client": "0.39.2"

# v.0.13.6 (2021-07-18)

- upgraded "cosmos-client": "0.42.7"

# v.0.13.5 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

# v.0.13.4 (2021-07-05)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

# v.0.13.3 (2021-06-29)

### Fix

- Stick with `cosmos-client@0.39.2`

# v.0.13.1 (2021-06-01)

- updated peer deps

# v.0.13.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.0.12.0 (2021-05-05)

### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

# v.0.11.0 (2021-03-02)

### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0

# v.0.10.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0
- Update `getBalance`

# v.0.9.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0

### Update

- Update @xchainjs/xchain-client package to 0.5.0
- Add `Service Providers` section in README.md

### Fix

- Fix `peerDependencies`

# v.0.8.1 (2021-02-05)

### Update

- Add transfer.sender, transfer.recipient option for transaction search.

### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Update @xchainjs/xchain-util package to 0.2.2

# v.0.8.0 (2021-02-03)

### Update

- Add `searchTxFromRPC` : search transactions using tendermint rpc.

# v.0.7.1 (2021-01-30)

- Clear lib folder on build

# v.0.7.0 (2021-01-15)

### Update

- Update comments for documentation
- Add `getPrefix`

### Breaking change

- Remove `deposit`

# v.0.6.0 (2020-12-28)

### Breaking change

- Extract `getDefaultFees` from `Client` to `utils` #157
- Remove `validateAddress` from `CosmosClient`

# v.0.5.1 (2020-12-16)

### Update

- Extract `signAndBroadcast` from `transfer`

# v.0.5.0 (2020-12-11)

### Update

- Update dependencies
- Move `cosmos-client` to `dependencies`
- Add `getDefaultFees`

# v.0.4.2 (2020-11-23)

### Fix imports

- Fix imports of `cosmos/codec`

# v.0.4.1 (2020-11-23)

### Update

- Update to latest `@xchainjs/*` packages and other dependencies

# v.0.4.0 (2020-11-20)

### Breaking change

- Update @xchainjs/xchain-crypto package to 0.2.0, deprecating old keystores
