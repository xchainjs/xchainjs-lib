<div align="center">

  [![Contributors][contributors-shield]][contributors-url]
  [![Forks][forks-shield]][forks-url]
  [![Stargazers][stars-shield]][stars-url]
  [![Issues][issues-shield]][issues-url]
  [![MIT License][license-shield]][license-url]

</div>

<div align="center">
  <a href="https://xchainjs.org/" target="_blank" rel="noopener noreferrer">
    <img width="400" height="300" src="https://avatars.githubusercontent.com/u/73146062?s=200&v=4" alt="xchainjs logo">
  </a>

  <h1 align="center">XChainJS</h1>

  <p align="center">
    <br />
    <a href="https://xchainjs.gitbook.io/xchainjs"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://discord.com/channels/838986635756044328/842252939149967382">Discord</a>
    ·
    <a href="https://t.me/xchainjs">Telegram</a>
    ·
    <a href="https://github.com/xchainjs/xchainjs-lib/issues/new">Report Bug</a>
    ·
    <a href="https://github.com/xchainjs/xchainjs-lib/issues/new">Request Feature</a>
  </p>
</div>

<br />

XChainJS is a comprehensive toolkit designed to facilitate blockchain development by providing developers with a wide range of utilities, modules, and functionalities. Its purpose is to streamline the process of building decentralized applications (DApps), interacting with blockchain networks, and integrating blockchain technology into various projects.&#x20;

The library aims to abstract away the complexities of blockchain development, allowing developers to focus on building innovative solutions without getting bogged down in low-level implementation details.

## Purpose

- **Simplify Blockchain Development**:
  The primary purpose of the XchainJS library is to simplify blockchain development by providing developers with high-level abstractions and ready-to-use tools for common blockchain tasks.

- **Promote Interoperability**:
  The library aims to promote interoperability by offering support for multiple blockchain protocols and standards, enabling developers to build applications that can interact seamlessly with different blockchain networks.

- **Empower Developers**:
  By abstracting away the complexities of blockchain technology, the XchainJS library empowers developers of all skill levels to leverage the potential of blockchain in their projects, regardless of their expertise in cryptography or distributed systems.


## Scope

**Blockchain Interaction**:
The XchainJS library covers a wide range of functionalities related to interacting with blockchain networks, including transaction handling, wallet management, protocols interactions, and data querying.
**Protocol Support**:
It provides support for various blockchain protocols and standards, such as [THORChain](https://thorchain.org/) and [MAYAProtocol](https://docs.mayaprotocol.com/).

**Utilities and Tools**:
The library offers a collection of utilities and tools for common blockchain tasks, including cryptographic operations, address formatting, transaction parsing, and fetching data.

## Key Features

**Modularity**:
The xchain library is modular, allowing developers to pick and choose the modules and functionalities they need for their specific use cases. This modular approach promotes flexibility and scalability in blockchain development.

**Abstraction**:
It abstracts away the complexities of blockchain technology, providing developers with high-level interfaces and abstractions that shield them from low-level implementation details.

**Protocol Agnosticism**:
The library is designed to be protocol-agnostic, meaning it can support multiple blockchain protocols and standards. This allows developers to build applications that are not tied to a specific blockchain network.

**Community Support**:
The xchain library is supported by a vibrant community of developers and contributors who actively maintain and improve the library, ensuring its relevance and usability in the rapidly evolving blockchain landscape.


## Examples

To show different use cases and to facilitate developers experience with XChainJS, we have created a few examples on [CodeSandbox](https://codesandbox.io/) where you will be able to see and fork our examples to create yours.

Follow the [examples instructions](https://xchainjs.gitbook.io/xchainjs/examples-instructions) to be able to start working with the library in just a few minutes.

Examples:

- [Estimate Thorchain swap](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/estimate-swap)
- [THORChain swap](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/do-swap)
- [Liquidity and savers](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/liquidity)
- [Loans](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/loans)
- [THORChain transaction status](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/check-tx)
- [MAYAChain swap](https://codesandbox.io/p/devbox/github/xchainjs/xchainjs-lib/tree/master/examples/do-maya-swap)

## Documentation

More information about how to use each XChainJS package can be found on [documentation](https://xchainjs.gitbook.io/xchainjs)


## Packages

XChainJS is a library made up of different packages through which you can interact with different blockchains, data providers and protocols, or use its utility functions to simplify blockchain development.

### Client packages

Blockchain clients with whom you can prepare, make and broadcast transactions, estimate transactions fees and get address balances.

| Name | Keystore support | Ledger support | Download |
|:-----:|:-----: |:-----: | :------|
| [@xchainjs/xchain-bitcoin](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bitcoin) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-bitcoin)](https://www.npmjs.com/package/@xchainjs/xchain-bitcoin) |
| [@xchainjs/xchain-ethereum](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-ethereum) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-ethereum)](https://www.npmjs.com/package/@xchainjs/xchain-ethereum) |
| [@xchainjs/xchain-thorchain](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thorchain) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-thorchain)](https://www.npmjs.com/package/@xchainjs/xchain-thorchain) |
| [@xchainjs/xchain-mayachain](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayachain) | ✅ | ❌ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-mayachain)](https://www.npmjs.com/package/@xchainjs/xchain-mayachain) |
| [@xchainjs/xchain-bitcoincash](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bitcoincash) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-bitcoincash)](https://www.npmjs.com/package/@xchainjs/xchain-bitcoincash) |
| [@xchainjs/xchain-litecoin](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-litecoin) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-litecoin)](https://www.npmjs.com/package/@xchainjs/xchain-litecoin) |
| [@xchainjs/xchain-doge](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-doge) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-doge)](https://www.npmjs.com/package/@xchainjs/xchain-doge) |
| [@xchainjs/xchain-dash](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-dash) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-dash)](https://www.npmjs.com/package/@xchainjs/xchain-dash) |
| [@xchainjs/xchain-avax](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-avax) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-avax)](https://www.npmjs.com/package/@xchainjs/xchain-avax) |
| [@xchainjs/xchain-arbitrum](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-arbitrum) | ✅ | ❌ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-arbitrum)](https://www.npmjs.com/package/@xchainjs/xchain-arbitrum) |
| [@xchainjs/xchain-bsc](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-bsc) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-bsc)](https://www.npmjs.com/package/@xchainjs/xchain-bsc) |
| [@xchainjs/xchain-kujira](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-kujira) | ✅ | ❌ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-kujira)](https://www.npmjs.com/package/@xchainjs/xchain-kujira) |
| [@xchainjs/xchain-cosmos](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-cosmos) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-cosmos)](https://www.npmjs.com/package/@xchainjs/xchain-cosmos) |
| [@xchainjs/xchain-solana](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-solana) | ✅ | ❌ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-solana)](https://www.npmjs.com/package/@xchainjs/xchain-solana) |
| [@xchainjs/xchain-binance](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-binance) | ✅ | ❌ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-binance)](https://www.npmjs.com/package/@xchainjs/xchain-binance) |
| [@xchainjs/xchain-base](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-base) | ✅ | ✅ | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-base)](https://www.npmjs.com/package/@xchainjs/xchain-base) |

### Utility packages

Utility packages

| Name | Download |
|:-----:|:------|
| [@xchainjs/xchain-util](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-util) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-util)](https://www.npmjs.com/package/@xchainjs/xchain-util) |
| [@xchainjs/xchain-client](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-client) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-client)](https://www.npmjs.com/package/@xchainjs/xchain-client) |
| [@xchainjs/xchain-crypto](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-crypto) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-crypto)](https://www.npmjs.com/package/@xchainjs/xchain-crypto) |


### Data provider packages

Data providers to retrieve blockchain data

| Name | Download |
|:-----:|:------|
| [@xchainjs/xchain-utxo-providers](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-utxo-providers) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-utxo-providers)](https://www.npmjs.com/package/@xchainjs/xchain-utxo-providers) |
| [@xchainjs/xchain-evm-providers](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-evm-providers) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-evm-providers)](https://www.npmjs.com/package/@xchainjs/xchain-evm-providers) |


</p>

### Protocol packages

#### Thorchain

Packages to interact with Thorchain

| Name | Download |
|:-----:|:------|
| [@xchainjs/xchain-thornode](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thornode) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-thornode)](https://www.npmjs.com/package/@xchainjs/xchain-thornode) |
| [@xchainjs/xchain-midgard](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-midgard) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-midgard)](https://www.npmjs.com/package/@xchainjs/xchain-midgard) |
| [@xchainjs/xchain-thorchain-query](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thorchain-query) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-thorchain-query)](https://www.npmjs.com/package/@xchainjs/xchain-thorchain-query) |
| [@xchainjs/xchain-thorchain-amm](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-thorchain-amm) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-thorchain-amm)](https://www.npmjs.com/package/@xchainjs/xchain-thorchain-amm) |


#### Mayachain

Packages to interact with Mayachain

| Name | Download |
|:-----:|:------|
| [@xchainjs/xchain-mayanode](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayanode) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-mayanode)](https://www.npmjs.com/package/@xchainjs/xchain-mayanode) |
| [@xchainjs/xchain-mayamidgard](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayamidgard) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-mayamidgard)](https://www.npmjs.com/package/@xchainjs/xchain-mayamidgard) |
| [@xchainjs/xchain-mayachain-query](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayachain-query) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-mayachain-query)](https://www.npmjs.com/package/@xchainjs/xchain-mayachain-query) |
| [@xchainjs/xchain-mayachain-amm](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-mayachain-amm) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-mayachain-amm)](https://www.npmjs.com/package/@xchainjs/xchain-mayachain-amm) |


### Really cool packages

Poweful tool to build whatever you want...

| Name | Download |
|:-----:|:------|
| [@xchainjs/xchain-wallet](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-wallet) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-wallet)](https://www.npmjs.com/package/@xchainjs/xchain-wallet) |
| [@xchainjs/xchain-aggregator](https://github.com/xchainjs/xchainjs-lib/tree/master/packages/xchain-aggregator) | [![npm](https://img.shields.io/npm/v/@xchainjs/xchain-aggregator)](https://www.npmjs.com/package/@xchainjs/xchain-aggregator) |


## Tools

### TxJammer

[Tx Jammer](https://github.com/xchainjs/xchainjs-lib/tree/master/tools/txJammer) is a script which pushes a random amount of different types of transactions to stagenet to verify new stagenet releases


## Contributing

What to become a XChainJS contributor? Read our [CONTRIBUTING.md](https://github.com/xchainjs/xchainjs-lib/blob/master/CONTRIBUTING.md) and be part of our contributor member. It's people like you that make XChainJS better.

[contributors-shield]: https://img.shields.io/github/contributors/xchainjs/xchainjs-lib.svg?style=for-the-badge
[contributors-url]: https://github.com/xchainjs/xchainjs-lib/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/xchainjs/xchainjs-lib.svg?style=for-the-badge
[forks-url]: https://github.com/xchainjs/xchainjs-lib/network/members
[stars-shield]: https://img.shields.io/github/stars/xchainjs/xchainjs-lib.svg?style=for-the-badge
[stars-url]: https://github.com/xchainjs/xchainjs-lib/stargazers
[issues-shield]: https://img.shields.io/github/issues/xchainjs/xchainjs-lib.svg?style=for-the-badge
[issues-url]: https://github.com/xchainjs/xchainjs-lib/issues
[license-shield]: https://img.shields.io/github/license/xchainjs/xchainjs-lib.svg?style=for-the-badge
[license-url]: https://github.com/xchainjs/xchainjs-lib/blob/master/LICENSE.txt
