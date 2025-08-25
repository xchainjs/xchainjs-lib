<div align="center">
  <h1 align="center">XChain Client</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-client' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-client" />
    </a>
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-client' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-client" />
    </a>
  </p>
</div>

<br />

Base client interface and abstract implementation for XChainJS blockchain clients. Provides a standardized interface for wallet operations across different blockchain networks.

## Modules

- `BaseXChainClient` - Abstract base class for all blockchain clients
- `types` - Core type definitions and interfaces
- `fees` - Fee calculation utilities
- `protocols` - Supported blockchain protocol definitions

## Installation

```sh
yarn add @xchainjs/xchain-client
```

or

```sh
npm install @xchainjs/xchain-client
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-client`.

```sh
yarn add @xchainjs/xchain-crypto @xchainjs/xchain-util axios
```

## Documentation

### [`xchain client`](http://docs.xchainjs.org/xchain-client/)

[`Overview of xchain-client`](http://docs.xchainjs.org/xchain-client/overview.html)\
[`Interface of xchain-client`](http://docs.xchainjs.org/xchain-client/interface.html)

## Features

- **Standardized Interface**: Consistent API across all blockchain implementations
- **Key Management**: Secure BIP39 phrase handling without key generation
- **Network Support**: Mainnet, Testnet, and Stagenet configurations
- **Fee Management**: Flexible fee calculation and bounds
- **Abstract Implementation**: Base class for easy client extension

