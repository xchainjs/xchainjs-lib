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
