# v.0.1.0 (2020-11-18)

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
- getChainName(): 'Polkadot' | 'Westend'
- getSpecName(): 'polkadot' | 'westend'
- estimateFees(params: TxParams): Promise<Fees>
