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

### Setting Headers for Nine Realms endpoints

If you plan on using the publically accessible endpoints provided by Nine Realms(listed below), ensure that you add a valid 'x-client-id' to all requests

- https://midgard.ninerealms.com
- https://haskoin.ninerealms.com (BTC/BCH/LTC)
- https://thornode.ninerealms.com 

Example

```typescript
import cosmosclient from '@cosmos-client/core'
import axios from 'axios'
import { register9Rheader } from '@xchainjs/xchain-util'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)
```

For a complete example please see this [test](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-thorchain-amm/__e2e__/wallet.e2e.ts) for a complete example