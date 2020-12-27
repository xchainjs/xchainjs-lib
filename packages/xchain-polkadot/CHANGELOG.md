# v.x.x.x (2020-XX-XX)

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
