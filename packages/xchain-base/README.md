<div align="center">
  <h1 align="center">Base client</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-base' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-base" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-base' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-base" />
    </a>
  </p>
</div>

<br />

Client that allows to perform operations on the Base blockchain abstracting developers from its particularities, thus allowing developers to focus on their projects. Base is a secure, low-cost, builder-friendly Ethereum L2.

If you want to read more about Base blockchain, go to its official [web site](https://www.base.org/)


## Installation

```sh
yarn add @xchainjs/xchain-base
```
or 

```sh
npm install @xchainjs/xchain-base
```

## Initialization

Using the Base client you can initialize the main class of the module in consultation mode if you do not provide any parameters, this means you could retrieve information from the blockchain and prepare transactions to sign, but you will not be able to sign transactions, or generate addresses.

```ts
import { Client } from '@xchainjs/xchain-base'

const client = new Client()

// Make read operations with your client
```

Otherwise, if you want to sign transactions and get the addresses you own, you will need to initialize the main class of the protocol as follows

```ts
import { Client, defaultBaseParams } from '@xchainjs/xchain-base'

const client = new Client({
  phrase: 'your secret phrase',
  ...defaultBaseParams
})

// Make read or write operations with your client
```

##  Features

Thanks to the Base client you will be able to:
- Get the Base and tokens balances that an address owns
- Generate addresses given a secret phrase
- Transfer Base and tokens to another address
- Get details of a transaction
- Get address transaction history



## Examples

You can find examples using the Base package in the [base](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/base) examples folder.


## Documentation

More information about how to use the Base client can be found on [documentation](https://xchainjs.gitbook.io/xchainjs/clients/xchain-base)
