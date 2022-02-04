# v.0.9.1 (2022-xx-xx)

- Use latest axios@0.25.0

# v.0.9.0 (2021-12-29)

## Breaking change

- Add stagenet environment handling for `Network` and `BaseXChainClient` changes client to default to mainnet values until stagenet is configured.

# v.0.8.4 (2021-07-07)

- Use latest `xchain-client@0.10.1` + `xchain-util@0.3.0`

# v.0.8.3 (2021-07-05)

- refactored client methods to use regular method syntax (not fat arrow) in order for bcall to super.xxx() to work properly

# v.0.8.2 (2021-06-01)

- updated peer deps

# v.0.8.0 (2021-05-17)

### Breaking change

- added support for HD wallets

# v.0.7.0 (2021-03-02)

### Breaking change

- Update @xchainjs/xchain-client package to 0.7.0

# v.0.6.0 (2021-02-24)

### Breaking change

- Update @xchainjs/xchain-client package to 0.6.0
- Update `getBalance`

# v.0.5.0 (2021-02-19)

### Breaking change

- Update @xchainjs/xchain-client package to 0.5.0
- Update @xchainjs/xchain-crypto package to 0.2.3
- Update @xchainjs/xchain-util package to 0.2.2

### Fix

- Fix `peerDependencies`

### Update

- Add `Service Providers` section in README.md

# v.0.4.1 (2020-01-30)

- Clear lib folder on build

# v.0.4.0 (2020-01-15)

### Update

- Update comments for documentation
- Add `getPrefix`

# v.0.3.0 (2020-12-28)

### Breaking change

- Extract `getDefaultFees`, `getDecimal` from `Client` to `utils` #157

### Update

- Add `validateAddress`
- Update `transfer` (check `insufficient balance`)
- Update dependencies

# v.0.2.0 (2020-12-11)

### Update

- Update dependencies
- Add `getDefaultFees`
- Remove `deposit`
- Fix `transfer` to use `system.remark` to handle the memo
- Fix address derivation

# v.0.1.0 (2020-11-23)

First release

- setNetwork(net: Network): void
- getNetwork(): Network
- getExplorerUrl(): string
- getExplorerAddressUrl(address: Address): string
- getExplorerTxUrl(txID: string): string
- getAddress(): Address
- setPhrase(phrase: string): Address
- getBalance(address?: Address, asset?: Asset): Promise<Balances>
- getTransactions(params?: TxHistoryParams): Promise<TxsPage>
- getTransactionData(txId: string): Promise<Tx>
- getFees(): Promise<Fees>
- transfer(params: TxParams): Promise<TxHash>
- purgeClient(): void

- getSS58Format(): number
- getWsEndpoint(): string
- estimateFees(params: TxParams): Promise<Fees>
