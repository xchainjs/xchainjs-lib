# `@xchainjs/xchain-thornode`

Thornode Module for XChainJS Clients

## Modules

Thornode module has been created using openapi-generator-cli auto-generation reading from "https://thornode.ninerealms.com/thorchain/doc/openapi.yaml" This library exposes all the Api's outlined in the swagger doc "https://thornode.ninerealms.com/thorchain/doc"


## Installation

```
yarn add @xchainjs/xchain-thornode
```

## Examples
Request data from MimirApi

```
// THORNODE_API_9R_URL - default exported URL
// import { MimirApi, THORNODE_API_9R_URL, Configuration } from '@xchainjs/xchain-thornode'

  const baseUrl = THORNODE_API_9R_URL
  const apiconfig = new Configuration({ basePath: baseUrl })
  const mimirApi = new MimirApi(apiconfig)
  const data = await mimirApi.mimir()
  console.log(data)

```

## Documentation

[`Thornode NineRelms endpoint`](https://thornode.ninerealms.com/)
