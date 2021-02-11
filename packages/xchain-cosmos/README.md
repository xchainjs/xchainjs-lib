# `@xchainjs/xchain-client`

Cosmos Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-cosmos
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-cosmos`.

```
yarn add cosmos-client
```

## Cosmos Client Testing

```
yarn install
yarn test
```

## Service Providers

This package uses the following service providers:

| Function                    | Service    | Notes                                                               |
| --------------------------- | ---------- | ------------------------------------------------------------------- |
| Balances                    | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`GET /bank/balances/{address}`) |
| Transaction history         | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`GET /txs`)                     |
| Transaction details by hash | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`GET /txs/{hash}`)              |
| Transaction broadcast       | Cosmos RPC | https://cosmos.network/rpc/v0.37.9 (`POST /txs`)                    |
| Explorer                    | BigDipper  | https://cosmos.bigdipper.live                                       |

Rate limits: No
