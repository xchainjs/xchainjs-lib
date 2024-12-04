<div align="center">
  <h1 align="center">Cardano client</h1>
  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-cardano' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-cardano" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-cardano' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-cardano" />
    </a>
  </p>
</div>

<br />


## Installation

```sh
yarn add @xchainjs/xchain-cardano
```

or 

```sh
npm install @xchainjs/xchain-cardano
```

## Initialization

Using the Cardano client you can initialize the main class of the module in consultation mode if you do not provide any parameters, this means you could retrieve information from the blockchain and prepare transactions to sign, but you will not be able to sign transactions, or generate addresses.

```ts
import { Client } from '@xchainjs/xchain-cardano'

const client = new Client()

// Make read operations with your client
```

Otherwise, if you want to sign transactions and get the addresses you own, you will need to initialize the main class of the protocol as follows

```ts
import { Client, defaultCardanoParams } from '@xchainjs/xchain-cardano'

const client = new Client({
  phrase: 'your secret phrase',
  ...defaultCardanoParams
})

// Make read or write operations with your client
```

##  Features

Thanks to the Cardano client you will be able to:
- Get the Cardano and tokens balances that an address owns
- Generate addresses given a secret phrase
- Transfer Cardano and tokens to another address
- Get details of a transaction
- Get address transaction history



## Examples

You can find examples using the Cardano package in the [Cardano](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/cardano) examples folder.


## Documentation

More information about how to use the Cardano client can be found on [documentation](https://xchainjs.gitbook.io/xchainjs/clients/xchain-cardano)
