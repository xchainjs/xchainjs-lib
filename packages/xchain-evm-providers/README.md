# `@xchainjs/xchain-evm-providers`

Data providers for XChainJS EVM clients. A provider reads balances, transactions, and fee rates. It does not derive keys.

## Interface

```typescript
export interface EvmOnlineDataProvider {
  getBalance(address: Address, assets?: CompatibleAsset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
  getFeeRates(): Promise<FeeRates>
}
```

## Implementations

### EtherscanProviderV2

Etherscan API v2 at `https://api.etherscan.io/v2`. Requests send a `chainid` query parameter, so one API key covers every supported chain. The Ethereum, BSC, Base, and Avalanche clients use this provider. Set `ETHERSCAN_API_KEY`.

Chain ids: https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains

### EtherscanProvider and RoutescanProvider

`EtherscanProvider` speaks the older Etherscan URL shape, which has no `chainid` parameter. `RoutescanProvider` extends it and points the same calls at Routescan's Etherscan-compatible endpoint (`https://api.routescan.io`). The Arbitrum client uses Routescan. Avalanche registers Routescan beside Etherscan v2.

### CovalentProvider

Balance and transaction history from Covalent (GoldRush), https://goldrush.dev/. No chain package wires this provider in by default. Construct it with a Covalent API key and pass it in `dataProviders`.
