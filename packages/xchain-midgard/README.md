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

this.baseUrl = MIDGARD_API_URL;
this.apiConfig = new Configuration({ basePath: this.baseUrl });

```

## Documentation

[`Midgard`](https://midgard.thorchain.info/v2/swagger.json)
