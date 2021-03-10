# v.x.x.x

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
