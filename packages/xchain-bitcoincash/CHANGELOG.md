# v.0.15.5 (2022-12-13)

## Update

- reverted `customRequestHeaders` to `BroadcastTxParams` 


# v.0.15.4 (2022-11-24)

## Update

- Added `customRequestHeaders` to `BroadcastTxParams` 
- Bumped `xchain-client`

# v.0.15.3 (2022-10-14)

## Update

- Set Default network to `Network.Mainnet`

# v.0.15.2 (2022-10-04)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v.0.15.1 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.15.0 (2022-09-05)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.14.0 (2022-07-21)

### Breaking change

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

# v.0.13.2 (2022-07-13)

## Fix

- Broadcast same tx several times to Haskoin in case of `500` error (similar to #492, but for BCH)

# v.0.13.1 (2022-05-05)

## Update

- Add `deposit` function to BitcoinCash `Client`
- Update latest dependencies
- Add tests for `deposit`

# v.0.13.0 (2022-03-23)

## Add

- Cache `tx hex`
- Helper `isCashAddress`
- Helper `broadcastTx`

## Breaking change

- Use `haskoin.ninerealms.com` for `haskoinUrl` by default
- Broadcast txs using `haskoin` endpoint
- Remove `nodeUrl` / `nodeAuth` / `setNodeURL` / `getNodeURL` from `Client`
- Remove `node-api` module (incl. types)

## Internal

- Refactor tests to remove `nock` dependencies in favour of `axios-mock-adapter`
- Add more tests

# v.0.12.1 (2022-02-04)

## Update

- Use latest axios@0.25.0
- xchain-client@0.11.1

# v.0.12.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

# v.0.11.10 (2021-11-12)

- updated haskoin api URL

# v.0.11.9 (2021-09-06)

- updated to the latest dependencies

# v.0.11.8 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

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
