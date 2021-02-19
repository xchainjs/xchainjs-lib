# `@xchainjs/xchain-binance`

Binance Module for XChainJS Clients

## Modules

- `client` - Custom client for communicating with Binance Chain by using [`binance-chain/javascript-sdk`](https://github.com/binance-chain/javascript-sdk)
- `types` - TypeScript type definitions for [`binance-chain/javascript-sdk`](https://github.com/binance-chain/javascript-sdk) (not completed) and [`Binance WebSocket Streams`](https://docs.binance.org/api-reference/dex-api/ws-streams.html).
- `util` - Utitilies for using [`binance-chain/javascript-sdk`](https://github.com/binance-chain/javascript-sdk)

## Installation

```
yarn add @xchainjs/xchain-binance
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-binance`.

```
yarn add @binance-chain/javascript-sdk @xchainjs/xchain-client @xchainjs/xchain-crypto
```

## Service Providers

This package uses the following service providers:

| Function                    | Service              | Notes                                                                         | Rate limits                   |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| Balances                    | Binance Dex          | https://docs.binance.org/api-reference/dex-api/paths.html#apiv1accountaddress | 5 requests per IP per second. |
| Transaction history         | Binance Dex          | https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions   | 60 requests per IP per minute |
| Transaction details by hash | Binance Dex          | https://docs.binance.org/api-reference/dex-api/paths.html#apiv1txhash         | 10 requests per IP per second |
| Transaction fees            | Binance Dex          | https://docs.binance.org/api-reference/dex-api/paths.html#apiv1fees           | 1 request per IP per second   |
| Transaction broadcast       | Binance Dex          | https://docs.binance.org/api-reference/dex-api/paths.html#apiv1broadcast      | 5 requests per IP per second  |
| Explorer                    | Binance Dex Explorer | https://explorer.binance.org                                                  |                               |

This package gets the node information (`https://docs.binance.org/api-reference/dex-api/paths.html#apiv1node-info`) to transfer tokens.
