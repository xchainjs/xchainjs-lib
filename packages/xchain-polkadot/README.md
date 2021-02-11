# `@xchainjs/xchain-polkadot`

Polkadot Module for XChainJS Clients

## Installation

```
yarn add @xchainjs/xchain-polkadot
```

## Polkadot Client Testing

```
yarn install
yarn test
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-polkadot`.

```
yarn add @polkadot/api
```

## Service Providers

This package uses the following service providers:

| Function                    | Service          | Notes                                                                                                       |
| --------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Balances                    | Subscan          | https://documenter.getpostman.com/view/1618960/TVCe1oRU?version=latest#38c96f38-0278-4510-a030-a3e6be935ee5 |
| Transaction history         | Subscan          | https://docs.api.subscan.io/#transfers                                                                      |
| Transaction details by hash | Subscan          | https://docs.api.subscan.io/#extrinsic                                                                      |
| Transaction fees            | Substrate RPC    | https://polkadot.js.org/docs/substrate/rpc/#queryinfoextrinsic-bytes-at-blockhash-runtimedispatchinfo       |
| Transaction broadcast       | Substrate RPC    | https://polkadot.js.org/docs/substrate/rpc#submitextrinsicextrinsic-extrinsic-hash                          |
| Explorer                    | Subscan Explorer | https://polkadot.subscan.io                                                                                 |

Subscan API rate limits: https://docs.api.subscan.io/#rate-limiting
