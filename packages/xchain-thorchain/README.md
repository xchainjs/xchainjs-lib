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
const client = new Client({ network: Network.Testnet, phrase: 'my secret phrase' })

// get address
const address = client.getAddress()
console.log('address:', client.getAddress()) // address: tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg

// get balances
const balances = await client.getBalance(address)
console.log('balances:', balances[0].amount.amount().toString()) // balance: 6968080395099

// get transactions
const txs = await client.getTransactions({ address })
console.log('txs total:', txs.total) // txs total: 100

// get transaction details
const tx = await client.getTransactionData('any-tx-hash', address)
console.log('tx asset:', tx.asset) // tx asset: { chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE' }
```

For more examples check out tests in `./__tests__/client.test.ts`

## Creating protobuffer typescript bindings

in order for this library to de/serialize proto3 structures, you can use the following to create bindings

1. `git clone https://gitlab.com/thorchain/thornode`
2. run the following (adjust the paths acordingly) to generate a typecript file for MsgDeposit
   ```bash
   yarn run pbjs -w commonjs  -t static-module  <path to repo>/thornode/proto/thorchain/v1/x/thorchain/types/msg_deposit.proto <path to repo>/thornode/proto/thorchain/v1/common/common.proto -o src/types/MsgDeposit.js
   ```
3. run the following to generate the .d.ts file
   ```bash
   yarn run pbts -o src/types/MsgDeposit.d.ts src/types/MsgDeposit.js
   ```
