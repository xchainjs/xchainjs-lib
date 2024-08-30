<div align="center">
  <h1 align="center">Solana client</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-solana' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-solana" />
    </a>
      <a href='https://www.npmjs.com/package/@xchainjs/xchain-solana' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-solana" />
    </a>
  </p>
</div>

<br />

Client that allows to perform operations on the Solana blockchain abstracting developers from its particularities, thus allowing developers to focus on their projects. The Solana client is built on top of [@solana/web3.js](https://github.com/solana-labs/solana-web3.js) and the suite of packages developed by the [Metaplex](https://www.metaplex.com/) foundation.

If you want to read more about Solana blockchain, go to its official [web site](https://solana.com/)


## Installation

```sh
yarn add @xchainjs/xchain-solana
```
or 

```sh
npm install @xchainjs/xchain-solana
```

## Initialization

Using the Solana client you can initialize the main class of the module in consultation mode if you do not provide any parameters, this means you could retrieve information from the blockchain and prepare transactions to sign, but you will not be able to sign transactions, or generate addresses.

```ts
import { Client } from '@xchainjs/xchain-solana'

const client = new Client()

// Make read operations with your client
```

Otherwise, if you want to sign transactions and get the addresses you own, you will need to initialize the main class of the protocol as follows

```ts
import { Client, defaultSolanaParams } from '@xchainjs/xchain-solana'

const client = new Client({
  phrase: 'your secret phrase',
  ...defaultSolanaParams
})

// Make read or write operations with your client
```

##  Features

Thanks to the Solana client you will be able to:
- Get the Solana and tokens balances that an address owns
- Generate addresses given a secret phrase
- Transfer Solana and tokens to another address
- Get details of a transaction
- Get address transaction history



## Examples

You can find examples using the Solana package in the [solana](https://github.com/xchainjs/xchainjs-lib/tree/master/examples/solana) examples folder.


## Documentation

More information about how to use the Solana client can be found on [documentation](https://xchainjs.gitbook.io/xchainjs/clients/xchain-solana)
