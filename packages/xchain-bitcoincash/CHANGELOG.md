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
