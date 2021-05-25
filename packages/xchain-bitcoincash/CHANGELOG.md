# v.0.10.2 (2021-05-25)

- Changed `utils/getPrefix` to return an empty string

# v.0.10.1 (2021-05-24)

- Fixed missed addresses' stripping out for `parseTransaction`

# v.0.10.0 (2021-05-21)

### Breaking change

- Reverts prefix removal and legacy address usage

# v.0.9.0 (2021-05-05)

### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

# v.0.8.0 (2021-04-12)

### Breaking changes

- remove bitcoin cash address prefix. (`bchtest:` & `bitcoincash:`)

# v.0.7.2 (2021-03-15)

### Fix

- Fix default mainnet url

# v.0.7.1 (2021-03-05)

### Update

- Update `getBalance` to include unconfirmed balances.

# v.0.7.0 (2021-03-02)

### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0

# v.0.6.0 (2021-02-26)

### Breaking change

- Change lib to `@psf/bitcoincashjs-lib`

### Fix

- Fix transaction broadcast causing cors error

# v.0.5.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0

# v.0.4.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0

# v.0.3.0 (2021-02-18)

### Breaking change

- Make `feeRate` optional in `transfer()`, default is `fast`

### Fix

- Fix `peerDependencies`

### Update

- Update README.md

# v.0.2.0

### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Update parameters of haskcoin APIs ...

### Update

- Add `Service Providers` section in README.md
- Add `scanUTXOs`, `transfer`, `getFees`
- Update `Service Providers` in Readme.md
- Update API mocked tests

### Fix

- Fix derivation path

# v.0.1.1

- Clear lib folder on build
