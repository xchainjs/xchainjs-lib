# v.0.8.0 (2021-2-3)

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
