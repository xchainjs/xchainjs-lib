# `@xchainjs/xchain-thorchain`

Thorchain Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-thorchain
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain`.

```
yarn add axios cosmos-client
```

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
