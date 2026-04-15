# `@xchainjs/xchain-midgard`

Midgard Module for XChainJS Clients

## Modules

Midgard module has been created using openapi-generator-cli auto-generation reading from "https://midgard.thorchain.info/v2/swagger.json" This library exposes all the midgard api functions defined in the swagger doc "https://midgard.thorchain.info/v2/swagger.json"

## Installation

```
yarn add @xchainjs/xchain-midgard
```

## Examples

Request data from midgardApi

```
import { MidgardApi } from '@xchainjs/xchain-midgard'

const midgardApi = new MidgardApi()
const data = midgardApi.getPool('BTC.BTC')

```

## Documentation

[`Midgard Liquify endpoint`](https://gateway.liquify.com/chain/thorchain_midgard/v2/doc)

### Setting Headers for public endpoints

If you plan on using the publicly accessible endpoints listed below, ensure that you add a valid 'x-client-id' to all requests

- https://gateway.liquify.com/chain/thorchain_midgard
- https://api.haskoin.com (BTC/BCH/LTC)
- https://gateway.liquify.com/chain/thorchain_api

Example

```typescript
import cosmosclient from '@cosmos-client/core'
import axios from 'axios'
import { register9Rheader } from '@xchainjs/xchain-util'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)
```

For a complete example please see this [test](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-thorchain-amm/__e2e__/wallet.e2e.ts)
