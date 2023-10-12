# XChainJS API UTXO providers Interface

A specification for a generalised interface for api providers, to be used by XChainJS implementations. The providers should not have any functionality to generate a key, instead, the `xchain-crypto` library should be used to ensure cross-chain compatible keystores are handled. The providers is only ever passed a master BIP39 phrase, from which a temporary key and address is decoded.

## Documentation

## Design

The OnlineDataProvider has the following signature:

```typescript
export interface OnlineDataProvider {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
}
```

## Implementations

### Etherscan / bscscan / snowtrace

```
Websites:         https://snowtrace.io/ , https://bscscan.com/ , https://etherscan.io/
Status:           Complete
FreeTier:         Yes
Chains supported: ETH, BSC, ETH
```

### Covalent

```
Website:          https://www.covalenthq.com/
Status:           Complete
FreeTier:         Yes
Chains supported: ETH, BSC, ETH
```
