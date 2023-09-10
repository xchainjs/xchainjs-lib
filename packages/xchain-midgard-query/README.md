# `@xchainjs/xchain-midgard-query`

Midgard-query module to query Midgard for read-only data. Midgard is a layer 2 REST API that provides front-end consumers with semi real-time rolled up data and analytics of the THORChain network. Most requests to the network will come through Midgard. This daemon is here to keep the chain itself from fielding large quantities of requests. You can think of it as a “read-only slave” to the chain. This keeps the resources of the network focused on processing transactions.

## Installation

```
yarn add @xchainjs/xchain-midgard-query
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-midgard-query`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-util @xchainjs/xchain-midgard axios

```
