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
import { MidgardApi, Configuration, MIDGARD_API_URL } from '@xchainjs/xchain-midgard'

const baseUrl = MIDGARD_API_URL
const apiconfig = new Configuration({ basePath: baseUrl })
const midgardApi = new MidgardApi(apiconfig)
const data = midgardApi.getPool('BTC.BTC') 

```

## Documentation

[`Midgard`](https://midgard.thorchain.info/v2/swagger.json)
