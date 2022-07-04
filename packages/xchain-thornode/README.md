# `@xchainjs/xchain-thornode`

Thornode Module for XChainJS Clients

## Modules

Thornode module has been created using openapi-generator-cli auto-generation reading from "https://thornode.ninerealms.com/thorchain/doc/openapi.yaml" This library exposes the thornode api's below but also defined in the swagger doc "https://thornode.ninerealms.com/thorchain/doc"
Pools
Transactions
Network
Queue
Mimir

## Installation

```
yarn add @xchainjs/xchain-thornode
```

## Examples
Request data from MimirApi

```
// Options to import three different baseUrl's
// THORNODE_API_TC_URL, THORNODE_API_9R_URL, THORNODE_API_TS_URL
//import { MimirApi, THORNODE_API_9R_URL, Configuration } from '../xchainjs/xchainjs-lib/packages/xchain-thornode/src'

  const baseUrl = THORNODE_API_9R_URL
  const apiconfig = new Configuration({ basePath: baseUrl })
  const mimirApi = new MimirApi(apiconfig)
  const data = await mimirApi.mimir()

```

## Documentation

[`Thornode Thorchain endpoint`](https://thornode.thorchain.info/)
[`Thornode Thorswap endpoint`](https://thornode.thorswap.net/)
[`Thornode NineRelms endpoint`](https://thornode.ninerealms.com/)
