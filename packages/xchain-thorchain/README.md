# `@xchainjs/xchain-thorchain`

Thorchain Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-thorchain
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-cosmos axios cosmos-client
```

Important note: Make sure to install same version of `cosmos-client` as `xchain-thorchain` is using (currently `cosmos-client@0.39.2` ). In other case things might break.

## Thorchain Client Testing

```
yarn install
yarn test
```

## Service Providers

This package uses the following service providers:

| Function                    | Service        | Notes                                                               |
| --------------------------- | -------------- | ------------------------------------------------------------------- |
| Balances                    | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /bank/balances/{address}`) |
| Transaction history         | Tendermint RPC | https://docs.tendermint.com/master/rpc/#/Info/tx_search             |
| Transaction details by hash | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`GET /txs/{hash}`)              |
| Transaction broadcast       | Cosmos RPC     | https://cosmos.network/rpc/v0.37.9 (`POST /txs`)                    |
| Explorer                    | Thorchain.net  | https://thorchain.net                                               |

Rate limits: No

## Examples

```ts
// import `xchain-thorchain`
import { Client } from '@xchainjs/xchain-thorchain'

// Create a `Client`
const client = new Client({ network: 'testnet', phrase: 'my secret phrase' })

// get address
const address = client.getAddress()
console.log('address:', client.getAddress())

// get balances
const balances = await client.getBalance(address)
console.log('balances:', balances[0].amount.amount().toString())

// get transactions
const txs = await client.getTransactions({ address })mark
console.log('txs total:', txs.total)
```

For more examples check out tests in `./__tests__/client.test.ts`
