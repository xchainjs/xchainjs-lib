# v.0.11.7 (2021-06-29)

- accepting legacy BCH addresses
- added support for pulling fees from thornode.

# v.0.11.6 (2021-06-19)

- changed rollupjs to treat axios as external lib

# v.0.11.5 (2021-06-01)

- update peer deps
- refactor BCH utils.buildTx() to remove extra code

# v.0.11.4 (2021-05-31)

- refactor utils.buildTx() to include the memo for calculating inputs with accumulate() but re-adds it into outputs using `psbt.addOutput` to avoid dust attack error

# v.0.11.3 (2021-05-31)

### Breaking Change

- remove adding memo to targetOutputs for `coinselect/accumulative`
- add memo output by using `transactionBuilder`

# v.0.11.1 (2021-05-30)

- add `coinselect/accumulative` to devDependency and peerDependency, to select which utxos to use as inputs for transfer

# v.0.11.0 (2021-05-17)

### Breaking change

- added support for HD wallets

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
