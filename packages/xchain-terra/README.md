# `@xchainjs/xchain-terra`

Terra Module for XChainJS Clients

## Modules
Terra.js a JavaScript SDK for writing applications that interact with the Terra blockchain `@terra-money/terra.js`, [https://www.npmjs.com/package/@terra-money/terra.js]
Exposes the Terra API through [`LCDClient`](https://docs.terra.money/docs/develop/sdks/terra-js/query-data.html)

## Installation

```
yarn add @xchainjs/xchain-terra
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-terra`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios @terra-money/terra.js
```

## Terra Client Testing

```
yarn install
yarn test

```

## Documentation

[`How it works`](http://docs.xchainjs.org/xchain-client/xchain-terra/how-it-works.html)
[`How to use`](http://docs.xchainjs.org/xchain-client/xchain-terra/how-to-use.html)


## Service Providers

This package uses the following service providers:

| Function                    | Service              | Notes                                                                         | Rate limits                   |
| --------------------------- | -------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| Explorer                    | Terra Luna           | https://finder.terra.money/mainnet                                            |                               |


## Extras

Tested with node v 16.4.0 