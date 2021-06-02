# v.0.6.4 (2021-05-31)

- fix adding duplicated memo output in the `Utils.buildTx()`
  
# v.0.6.4 (2021-05-31)

- refactor utils.buildTx() to include the memo for calculating inputs with accumulate() but re-adds it into outputs using `psbt.addOutput` to avoid dust attack error

# v.0.6.3 (2021-05-31)

### Breaking change

- don't add memo output to `coinselect/accumulative`
- add memo output by using `psbt.addOutput`

# v.0.6.1 (2021-05-30)

- add unit test for sochain apis
- add `coinselect/accumulative` to devDependency and peerDependency, to select which utxos to use as inputs for transfer
- add recursive call to https://sochain.com/api#get-unspent-tx to make sure we fetch ALL utxos

# v.0.6.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.0.5.0 (2021-05-05)

### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

# v.0.4.2 (2021-04-19)

### Update

- export Utils.`calFee`

# v.0.4.1 (2021-03-14)

### Update

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
