# v0.30.3 (2023-09-15)

## Update

-  Updated creation of the testnet provider to match -[ethers docs]- ( https://docs.ethers.org/v5/api/providers/api-providers/#EtherscanProvider)

# v0.30.2 (2023-09-14)

## Update

- bump xchain-evm dep

# v0.30.1 (2023-09-11)

## Update

- Bumped dependencies for util

# v0.30.0 (2023-08-10)

## Update

- add support for fallback on providers
- Update to use `xchain-evm-providers`

# v0.29.0 (2023-05-31)

## Refactor

- use xchain-evm

# v0.28.2 (2023-05-18)

## Add

- New client function getAssetInfo() returns chain, decimals and asset

# v0.28.1 (2023-05-09)

## Update

- update ethers dependency

# v0.28.0 (2023-05-02)

## Update

- update rollup config and axios to the latest

# v.0.27.8 (2023-04-04)

## Add

- add `broadcastTx()` to client
- Bump `xchain-client` in dependencies
- Remove `@xchainjs/xchain-litecoin": "^0.10.7` package from devDependencies

# v.0.27.7 (2023-01-19)

## Update

- Type safety `ETHChain`

# v.0.27.6 (2022-12-27)

## Add

- Add `AssetETH` and `ETHChain` definition

## Update

- Bump `xchain-client@13.5.0`

# v.0.27.5 (2022-12-17)

## Update

- Added `depositWithExpiry` to `routerABI.json`
- Bumped `xchain-client@0.13.4`

# v.0.27.4 (2022-11-24)

## Update

- Bumped Dependencies

# v.0.27.3 (2022-10-13)

## Update

- Set Default network to `Network.Mainnet`

# v.0.27.2 (2022-xx-xx)

## Update

- Bumped `xchain-utils` & `xchain-client`

# v.0.27.1 (2022-09-29)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.27.0 (2022-09-05)

## Update

- bumped deps on xchain-utils & xchain-client

# v.0.26.0 (2022-07-20)

### Breaking change

- client.deposit() removed, all thorchain deposits were moved to xchain-thorchain-amm

# v.0.25.1 (2022-06-02)

## Fix

- If optional `signer` is not set to `client.call`, internal wallet is used as signer (similar to `transfer`)

# v.0.25.0 (2022-05-27)

## Add

- Helper `utils.isApproved`
- Helper `utils.estimateCall`
- Helper `utils.estimateApprove`
- Helper `utils.strip0x`
- Helper `utils.getApprovalAmount`
- Helper `utils.call`
- Helper `util.getAssetAddress`
- Helper `util.isEthAsset`
- Add optional `signer` parameter to `client.approve`
- Add optional `signer` parameter to `client.transfer`
- Add optional `signer` parameter to `client.call`
- Export ERC20 + router ABI's

## Breaking change

- Remove `walletIndex` parameter from `client.estimateApprove` in favour of `fromAddress`
- Remove `walletIndex` parameter from `client.call` in favour of `signer`
- Rename `feeOptionKey` parameter to `feeOption` in `client.approve` / `client.transfer`
- `feeOption` is `FeeOption.Fast` by default in `client.transfer`
- `AssetETH` is default `asset` in `client.transfer` (optional before)

## Fix

- `gasPrice` can be `undefined` in `client.transfer`, but needed by `checkFeeBounds`

# v.0.24.1 (2022-05-05)

## Update

- Add `deposit` function to Ethereum `client`
- Add `routerABI.json`
- Update latest dependencies
- Add tests for `deposit`

# v.0.24.0 (2022-04-20)

## Fix

- Make phrase optional on Client ([#550](https://github.com/xchainjs/xchainjs-lib/pull/550))

# v.0.23.3 (2022-02-04)

## Update

- Use latest axios@0.25.0
- xchain-client@0.11.1
- @xchainjs/xchain-util@0.5.1

# v.0.23.2 (2022-02-02)

## Update

- xchain-util@0.5.0

## Add

- `isAssetNativeRune` helper

# v.0.23.1 (2022-01-05)

## Fix

- Fix default provider for `stagenet`

# v.0.23.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

# v.0.22.5 (2021-09-09)

- updated to the latest dependencies

# v.0.22.4 (2021-07-08)

### Fix

- Provide overridden `getFees` in `EthereumClient` interface

# v.0.22.3 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

# v.0.22.2 (2021-07-05)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

# v.0.22.1 (2021-06-30)

### Fix

- Rates in `estimateGasPrices` need to be converted from `gwei` into `wei`

# v.0.22.0 (2021-06-30)

### Fix

- `isApproved` returned always `false`

### Breaking change

- Parameter object for `call`, `estimateCall`, `isApproved` methods

### Add

- Optional `gasLimitFallback` parameter for `approve` call

# v.0.21.5 (2021-06-29)

- added support for pulling fees from thornode.

# v.0.21.4 (2021-06-07)

### Fix

- `utils:getTokenBalances` - added filtering out assets without `decimals`

# v.0.21.3 (2021-05-27)

- updated peer deps

# v.0.21.2 (2021-06-02)

### Fix

- fixed `getTransactions`'s transactions filtering to match correct pagintaion's boundings

### Update

- updated `xchain-client` package version

# v.0.21.0 (2021-05-27)

### Fix

- Get ETH balance directly from provider

# v.0.20.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.0.19.0 (2021-05-05)

### Breaking change

- Latest @xchainjs/xchain-client@0.8.0
- Latest @xchainjs/xchain-util@0.2.7

# v.0.18.0 (2021-04-08)

### Breaking changes

- change parameters of `approve` function to an object

### Update

- update `approve` function to accept `feeOptionKey` parameter

# v.0.17.1 (2021-04-06)

### Update

- update tests for utils
- update error messages

# v.0.17.0 (2021-04-02)

### Update

- update `getBalance` to use ethplorer API for mainnet
- update `getTransactionData` to use ethplorer API for mainnet
- update dependencies (ethers, xchain-util)

# v.0.16.0 (2021-03-23)

### Breaking change

- move `getDecimal` from client to util

# v.0.15.0 (2021-03-23)

### Add

- add `getDecimal(asset)`

# v.0.14.2 (2021-03-09)

### Fix

- export Client.`estimateGasPrices`, Util.`getFee`
- save `etherscanApiKey` in Client
- update `getTokenAddress` to return checksum address

### Breaking change

- change parameter of `getTokenAddress`

# v.0.14.1 (2021-03-08)

### Fix

- Update conversion of BaseAmount

# v.0.14.0 (2021-03-08)

### Update

- Add `estimateCall` to estimate gaslimit for `call` function.

### Breaking change

- types of estimateGasLimit() + FeesWithGasPricesAndLimits have been changed

# v.0.13.2 (2021-03-03)

### Update

- update `getBalance` to get balances in a sequence way, not in parallel(for testnet only)

# v.0.13.1 (2021-03-03)

### Fix

- Fix `transfer` to consider memo

# v.0.13.0 (2021-03-02)

### Breaking change

- replace `find`, `findIndex`
- Update @xchainjs/xchain-client package to 0.7.0

# v.0.12.1 (2021-02-26)

### Fix

- Fix `getTxFromTokenTransaction` to parse correct tx date

# v.0.12.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0
- Update `getBalance`

### Fix

- Remove trailing slashes from `getDefaultExplorerURL`.

# v.0.11.1 (2020-02-21)

### Fix

- Fix `estimateGasLimit` to consider memo
- Fix `getTransactions` self tx duplication issue

# v.0.11.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0

# v.0.10.4 (2020-02-19)

### Fix

- Fix etherscan api url for getTransaction
- Fix `getTransactionData`
- Fix `getTxFromEthTransaction` to parse correct tx date
- Fix `peerDependencies`

# v.0.10.3 (2020-02-18)

### Update

- Update `getBalance` for error handling of invalid api key #224
- Add `Service Providers` section in README.md

### Fix

- Fix `typings` from package.json

# v.0.10.2-1 (2020-02-11)

- Sets Infura creds as project ID if no secret is provided.

# v.0.10.2 (2020-02-11)

- Allow optional Infura credentials

# v.0.10.1 (2020-02-09)

### Breaking change

- Update @xchainjs/xchain-client package to 0.4.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Update @xchainjs/xchain-util package to 0.2.2
- Move `erc20.json` to `src` folder
- Export `ETH_DECIMAL`

# v.0.10.0 (2020-02-02)

### Breacking change

- Change `ropsten` to `ropsten`

# v.0.9.1 (2020-02-01)

### Fix

- Fix type `FeesParams`

### Breaking change

- Change `getFee`
- Add `estimateGasLimit`, `estimateGasLimits`, `estimateFeesWithGasPricesAndLimits`

# v.0.8.1 (2020-01-30)

- Clear lib folder on build

# v.0.8.0 (2020-01-27)

### Breaking change

- Change `kovan` to `rinkeby`

# v.0.7.1 (2020-01-15)

### Change

- Export `getPrefix`

# v.0.7.0 (2020-01-15)

### Update

- add `getPrefix`

# v.0.6.0 (2021-01-13)

### Breaking change

- Update to provide default values for `ethplorerUrl` and `explorerUrl`

# v.0.5.1 (2021-01-12)

### Update

- Update `getBalance` to check api key #180
- Update `estimateGasNormalTx`, `estimateGasERC20Tx` #177

# v.0.5.0 (2021-01-11)

### Update

- Update comments for documentation
- Update `getBalance`, `getTransactions`, `getTransactionData`, `transfer`
- Update mocked tests

# v.0.4.0 (2020-12-28)

### Breaking change

- Extract `getDefaultFees` from `Client` to `utils` #157

# v.0.3.0 (2020-12-22)

### Update

- Add function comments including possible errors.
- Update blockchair API response.
- Update mocked tests. (blockchair/etherscan)

### Fix

- `getBalance`, `getTransactions`, `getTransactionData`

# v.0.2.0 (2020-12-11)

### Update

- Update dependencies

# v.0.1.0 (2020-05-28)

First release
