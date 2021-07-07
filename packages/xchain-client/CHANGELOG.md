# v.0.10.0 (2021-07-07)

### Breaking change

- Introduce `Network`, `TxType`, `FeeOption` enums
- added support for fetch gas fees from thorchain

### Add

- Introduce `UTXOClient`
- Add fee rate helpers `singleFeeRate`, `standardFeeRates`
- Add fee helpers `singleFee`, `standardFees`, `calcFee`, `calcFeesAsync`

# v.0.9.4 (2021-06-25)

- added BaseXChainClient
- added support for fetch gas fees from thorchain

# v.0.9.3 (2021-06-01)

- updated peer deps

# v.0.9.2 (2021-06-02)

### Update

- Make `walletIndex` optional in `getAddress`

# v.0.9.1 (2021-05-21)

- No changes, just a bump to next minor version by an accident

# v.0.9.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.0.8.0 (2021-05-05)

### Breaking change

- Update @xchainjs/xchain-util package to 0.2.7

# v.0.7.0 (2021-03-02)

### Breaking change

- Add optional parameter for `getTransactionData`

# v.0.6.0 (2021-02-24)

### Breaking change

- Update `getBalance`

# v.0.5.0 (2021-02-19)

### Breaking change

- Add @xchainjs/xchain-util to `peerDependencies`

# v.0.4.0 (2020-01-30)

### Breaking change

- Update @xchainjs/xchain-util package to 0.2.2

### Breaking change

- Add optional parameter for `getFees`

# v.0.3.0 (2020-28-12)

### Breaking change

- Remove `getDefaultFees` #157

# v.0.2.1 (2020-23-12)

### Update

- Add `validateAddress` #149

# v.0.2.0 (2020-12-11)

### Update

- Update dependencies
- Add `getDefaultFees`

# v.0.1.0 (2020-11-12)

### Breaking Change

- Remove 'transfer' | 'freeze' from `type TxType`

# v.0.0.7 (2020-11-09)

### Changes

- reverted 0.0.6 version
