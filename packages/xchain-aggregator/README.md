<div align="center">
  <h1 align="center">Aggregator</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-aggregator' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-aggregator" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-aggregator' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-aggregator" />
    </a>
  </p>
</div>

<br />

The Aggregator package has been developed to facilitate interaction with multiple decentralised protocols. It provides a unified interface for developers, with the objective of offering end users the best of each protocol in the most straightforward manner.

## Supported protocols

The current supported protocols are:

- [Thorchain](https://thorchain.org/)
- [Maya Protocol](https://www.mayaprotocol.com/)
- [Chainflip](https://chainflip.io/)


## Installation

```sh
yarn add @xchainjs/xchain-aggregator
```

or 

```sh
npm install @xchainjs/xchain-aggregator
```

## Initialization

Aggregator can be easily initialise providing the [Wallet](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-wallet) with the XChainJs Clients you are working with. If no protocol is provided, the Aggregator will work with all the supported protocols.

```ts
import { Aggregator } from '@xchainjs/xchain-aggregator';

const aggregator = new Aggregator({
  wallet: new Wallet({
    // Your XChainJS clients
  }),
  protocols: [
    // The protocols you want to work with
  ],
  affiliate: {
    // Affiliate config
  }
})
```

## Features

### Swaps

- Estimate the most efficient swap among protocols
- Do swaps
- Get swap history through different protocols


## Examples

You can find examples using the Aggregator package in the [aggregator](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/aggregator) examples folder.


## Documentation

More information about how to use the Aggregator package can be found on [documentation](https://xchainjs.gitbook.io/xchainjs/aggregator)