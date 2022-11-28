# `@xchainjs/xchain-thornode`

Thornode Module for XChainJS Clients

## Modules

Thornode module has been created using openapi-generator-cli to auto-generate rest api reading from "https://gitlab.com/thorchain/thornode/-/raw/release-{version}/openapi/openapi.yaml"
This library exposes all the Api's outlined in the swagger doc "https://thornode.ninerealms.com/thorchain/doc"

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
  const mimirResponse = await mimirApi.mimir()
  console.log(mimirResponse.data)

```
## Example - set custom header

Request data from MimirApi

```
// THORNODE_API_9R_URL - default exported URL
// import { MimirApi, THORNODE_API_9R_URL, Configuration } from '@xchainjs/xchain-thornode'

  const baseUrl = THORNODE_API_9R_URL
  const headers = {"x-client-id": "my-custom-val"}
  const baseOptions = { headers }
  const apiconfig = new Configuration({ basePath: baseUrl , baseOptions })
  const mimirApi = new MimirApi(apiconfig)
  const mimirResponse = await mimirApi.mimir()
  console.log(mimirResponse.data)

```

## Documentation

[`Thornode NineRelms endpoint`](https://thornode.ninerealms.com/)
