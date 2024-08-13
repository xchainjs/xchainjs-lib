<div align="center">
  <h1 align="center">THORChain AMM</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-thorchain-amm' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-thorchain-amm" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-thorchain-amm' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-thorchain-amm" />
    </a>
  </p>
</div>

<br />


THORChain AMM is a module that allows users and developers to interact with the THORChain protocol without having to worry about the underlining particularities of the protocol.

## Installation

```sh
yarn add @xchainjs/xchain-thorchain-amm
```

or 

```sh
npm install @xchainjs/xchain-thorchain-amm
```

## Initialization

Using Thorchain AMM, you can initialize the main class of the module in consultation mode if you do not provide any parameters, this means you could retrieve information from the protocol, but you will not be able to make actions the protocol needs you to sign.

```ts
  import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'

  const thorchainAmm = new ThorchainAMM()
```

Otherwise, if you want to be able make actions the protocol needs you to sign, you will need to initialize the main class of the protocol as follows

```ts
  import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
  import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
  import { Wallet } from '@xchainjs/xchain-wallet'

  const thorChainQuery = new ThorchainQuery()
  const wallet = new Wallet({
    // Your XChainJS clients
  })
  const thorchainAmm = new ThorchainAMM(thorChainQuery, wallet)
```


## Features

Using THORChain AMM package, you could easily implement the following features

### Swaps

- Estimate swaps
- Do swaps, streaming swaps and trade asset swaps
- Approve THORChain router to spend to be able to do ERC-20 swaps


### Liquidity pools

- Add liquidity to pools, symmetrical and asymmetrical
- Withdraw liquidity from pools


### Rune pool

- Deposit Rune to Rune pool
- Withdraw Rune from Rune pool


### Savers

- Add a position in a THORChain savers vault
- Withdraw a position from a THORChain savers vault


### Trade assets

- Deposit L1 assets into the THORChain network to mint trade assets to receive accredited shares
- Swap trade assets with RUNE or another trade asset
- Withdraw trade asset balance


### THORNames

- Get THORNames details
- Get THORNames by owner
- Register and update THORNames


## Examples

You can find examples using the THORChain AMM package in the [thorchain-amm](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/thorchain-amm) examples folder.


## Documentation

More information about how to use the Thorchain AMM package can be found on [documentation](https://xchainjs.gitbook.io/xchainjs/protocols/thorchain/xchain-thorchain-amm)

### Setting Headers for Nine Realms endpoints

If you plan on using the publically accessible endpoints provided by Nine Realms(listed below), ensure that you add a valid 'x-client-id' to all requests

- https://midgard.ninerealms.com
- https://haskoin.ninerealms.com (BTC/BCH/LTC)
- https://thornode.ninerealms.com

Example

```typescript
import cosmosclient from '@cosmos-client/core'
import axios from 'axios'
import { register9Rheader } from '@xchainjs/xchain-util'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)
```