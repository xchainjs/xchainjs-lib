# v.0.4.2 (2021-04-19)

### Fix

- export Utils.`calFee`

# v.0.4.1 (2021-03-14)

### Fix

- export Utils.`validateAddress`
- Fix default mainnet url


# v.0.4.0 (2021-03-02)

### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0
  
# v.0.3.0 (2021-02-25)

### Breaking change

- Refactored Client.transfer to call node's JSON rpc

### Update

- Updated LitecoinClientParams to provide optional nodeUrl and nodeAuth parameters

# v.0.2.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0

### Update

- Uses Bitaps to submit transactions instead of Sochain

### Fix

- Fix `getExplorerUrl` to bitaps.

# v.0.1.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Update parameters of Sochain APIs ...
- Update `getSuggestedFee`
- Make `feeRate` optional in `transfer()`, default is `fast`
- Update README.md

### Update

- Define / Export `LTC_DECIMAL`
- Add `Service Providers` section in README.md
- Update litecoin address prefix

### Fix

- Fix derivation path
- Fix `peerDependencies`

# v.0.0.2 (2021-01-30)

- Clear lib folder on build

# v.0.0.1 (2021-01-29)

First release
