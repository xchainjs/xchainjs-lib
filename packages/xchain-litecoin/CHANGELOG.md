# v.10.7 (2022-12-13)

## Update

- removed `customRequestHeaders` 

# v.10.6 (2022-11-24)

## Update

- Added `customRequestHeaders` to `BroadcastTxParams` & bump dependencies

# v.10.5 (2022-10-27)

## Update

- removed Default username/password in Client constructor
- do not send auth header if undefined

# v.10.4 (2022-10-14)

## Update

- Set Default network to `Network.Mainnet`
- change contructor to accept NodeUrls = Record<Network, string>

# v.0.10.3 (2022-10-04)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v.0.10.2 (2020-09-30)

## Update

- changed default node URL to 'https://litecoin.ninerealms.com'

# v.0.10.1 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.10.0 (2020-09-05)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.9.0 (2022-07-20)

### Breaking change

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

# v.0.8.1

## Update

- Add `deposit` function to Litecoin `Client`
- Update to latest dependencies
- Add tests for `deposit`

# v.0.8.0 (2022-03-08)

## Update

- Fetch `txHex` optionally while scanning UTXOs
- Cache list of `txHex`s in `getTxHexFromCache` to avoid same requests for same data

## Fix

- Change explorers to `blockchair` (mainnet) / `blockexplorer.one` (testnet) to get rid of broken `ltc.bitaps.com`

## Breaking change

- Remove deprecated Ledger files (\*\*/\*\*/ledger.ts)

# v.0.7.2 (2022-02-04)

- Use latest axios@0.25.0
- xchain-client@0.11.1
- @xchainjs/xchain-util@0.5.1

# v.0.7.1 (2021-01-27)

## Update

- Export `buildTx`

# v.0.7.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

# v.0.6.10 (2021-09-06)

- updated to the latest dependencies

# v.0.6.9 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

# v.0.6.8 (2021-07-03)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

# v.0.6.7 (2021-06-29)

- added support for pulling fees from thornode.

# v.0.6.6 (2021-06-19)

- changed rollupjs to treat axios as external lib

# v.0.6.5 (2021-06-02)

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
