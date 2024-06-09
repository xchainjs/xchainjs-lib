<div align="center">
  <h1 align="center">MAYAChain AMM</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-mayachain-amm' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-mayachain-amm" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-mayachain-amm' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-mayachain-amm" />
    </a>
  </p>
</div>

<br />


MAYAChain AMM is a module that allows users and developers to interact with the MAYAChain protocol without having to worry about the underlining particularities of the protocol.

## Installation

```sh
yarn add @xchainjs/xchain-mayachain-amm
```

or 

```sh
npm install @xchainjs/xchain-mayachain-amm

```

## Initialization

Using Mayachain AMM, you can initialize the main class of the module in consultation mode if you do not provide any parameters, this means you could retrieve information from the protocol, but you will not be able to make actions the protocol needs you to sign.

```ts
  import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'

  const mayachainAmm = new MayachainAMM()
```

Otherwise, if you want to be able make actions the protocol needs you to sign, you will need to initialize the main class of the protocol as follows

```ts
  import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
  import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
  import { Wallet } from '@xchainjs/xchain-wallet'

  const mayaChainQuery = new MayachainQuery()
  const wallet = new Wallet({
    // Your XChainJS clients
  })
  const mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
```

## Features

Using MAYAChain AMM package, you could easily implement the following features

### Swaps

- Estimate swaps
- Do swaps
- Approve MAYAChain router to spend to be able to do ERC-20 swaps

### MAYANames

- Get MAYAName details
- Get MAYANames by owner

## Examples

You can find examples using the MAYAChain AMM package in the [mayachain-amm](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/mayachain-amm) examples folder.