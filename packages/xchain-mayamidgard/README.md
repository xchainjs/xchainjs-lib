# `@xchainjs/xchain-mayamidgard`

Mayachain midgard Module for XChainJS Clients

## Modules

This library exposes all the midgard api functions defined in the swagger doc "https://midgard.mayachain.info/v2/swagger.json"

Midgard module has been created using openapi-generator-cli auto-generation reading from "https://midgard.mayachain.info/v2/swagger.json". 

## Installation

```
yarn add @xchainjs/xchain-mayamidgard
```

## Examples

Request data from midgardApi

```ts
import { MidgardApi } from '@xchainjs/xchain-mayamidgard'

// ...
const midgardApi = new MidgardApi()
const data = await midgardApi.getPool('BTC.BTC')
// ...

```

## Documentation

All endpoints documentation can be found under [`Mayachain midgard docs`](https://midgard.mayachain.info/v2/doc)
