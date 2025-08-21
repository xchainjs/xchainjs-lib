<div align="center">
  <h1 align="center">XChain Wallet</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-wallet' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-wallet" />
    </a>
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-wallet' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-wallet" />
    </a>
  </p>
</div>

<br />

Multi-chain wallet wrapper that allows you to work with multiple XChainJS clients simultaneously. Provides a unified interface for managing assets across different blockchain networks.

## Modules

- `wallet` - Main wallet class for multi-chain asset management
- `types` - TypeScript type definitions for wallet operations

## Installation

```sh
yarn add @xchainjs/xchain-wallet
```

or

```sh
npm install @xchainjs/xchain-wallet
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-wallet`.

```sh
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util
```

## Documentation

### [`xchain wallet`](http://docs.xchainjs.org/xchain-wallet/)

[`How xchain-wallet works`](http://docs.xchainjs.org/xchain-wallet/how-it-works.html)\
[`How to use xchain-wallet`](http://docs.xchainjs.org/xchain-wallet/how-to-use.html)

## Features

- **Multi-Chain Support**: Manage assets across all supported blockchains
- **Unified Interface**: Single wallet instance for multiple clients
- **Balance Aggregation**: View balances across all connected chains
- **Transaction Management**: Send and receive across different networks

## Examples

You can find examples using the Wallet package in the [wallet](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/wallet) examples folder.