# v.x.x.x (xxxx-xx-xx)

### Update

- update `getBalance` for error handling of invalid api key #224

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
