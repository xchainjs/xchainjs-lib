# v.2.1.0 (2020-08-14)

### Add:

- `getFees()`
- `TxFee`

# v.2.0.0 (2020-07-20)

- BREAKING CHANGE: `getTransactions` expects `GetTxsParams` as its parameter
- Refactored implementation of `getTransactions`
- Use latest `@binance-chain/javascript-sdk@4.0.5"
- Fix `Tx` type

# v.1.0.0 (2020-05-14)

Refactors the client to be constructed with a `net` and optional `phrase`

```
import BinanceClient, { Network } from '../src/client'
...
const net = Network.MAIN
const phrase = process.env.VAULT_PHRASE
const bnbClient = new BinanceClient(net, phrase)
```

### Removal:

- init()
- initClient()
- setPrivateKey()
- removePrivateKey()

### Change:

- getClientUrl(): string -> Class-based
- getExplorerUrl(): string -> Class-based
- getPrefix(): string -> Class-based

### Add:

- setNetwork(net: Network): void
- getNetwork(): Network
- generatePhrase(): string
- setPhrase(phrase?: string): void
- validatePhrase(phrase: string): boolean
- getAddress(): string
- validateAddress(address: string): boolean
- getBalance(address?: Address): Promise<Balance>
- getTransactions(address?: string): Promise<any[]>
- vaultTx(addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult>
- normalTx(addressTo: Address, amount: number, asset: string): Promise<TransferResult>

# v.0.1.0 (2020-04-13)

First release
