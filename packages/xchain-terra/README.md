# `@xchainjs/xchain-terra`

Terra Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-terra
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-terra`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios @terra-money/terra.js
```

## Terra Client Testing

```
yarn install
yarn test
```

## Examples

```ts
// import `xchain-terra`
import { Client } from '@xchainjs/xchain-terra'

// Create a `Client`
const client = new Client({ network: Network.Testnet, phrase: 'my secret phrase' })

// get address
const address = client.getAddress()
console.log('address:', address) // address: terra1hf2j3w46zw8lg25awgan7x8wwsnc509sk0e6gr

// get balances
const balances = await client.getBalance(address)
console.log('balances:', balances[0].amount.amount().toString()) // balance: 6968080395099

// get transactions
const txs = await client.getTransactions({ address })
console.log('txs total:', txs.total) // txs total: 100

// get transaction details
const tx = await client.getTransactionData('any-tx-hash', address)
console.log('tx asset:', tx.asset) // tx asset: { chain: 'TERRA', symbol: 'LUNA', ticker: 'LUNA' }
```

For more examples check out tests in `./__tests__/client.test.ts`
