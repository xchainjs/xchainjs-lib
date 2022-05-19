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
import { Midgard } from '@xchainjs/xchain-midgard'

const midgardApi = new Midgard()
console.log(midgardApi.getBaseUrl()) // Returns "https://midgard.thorchain.info"
const getBtcPool  = await midgardApi.getPool("BTC.BTC") 
console.log(getBtcPool)

```

## Documentation

[`Midgard`](https://midgard.thorchain.info/v2/swagger.json)
