<div align="center">
  <h1 align="center">XChain Crypto</h1>

  <p align="center">
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-crypto' target='_blank'>
      <img alt="NPM Version" src="https://img.shields.io/npm/v/%40xchainjs%2Fxchain-crypto" />
    </a>
    <a href='https://www.npmjs.com/package/@xchainjs/xchain-crypto' target='_blank'>
      <img alt="NPM Downloads" src="https://img.shields.io/npm/d18m/%40xchainjs%2Fxchain-crypto" />
    </a>
  </p>
</div>

<br />

The XChain Crypto package provides cryptographic utilities used by all XChain clients. It encrypts master phrases to keystores and supports BIP39 compatible phrase import/export across wallets.

## Modules

- `crypto` - Core cryptographic functions for keystore encryption/decryption
- `types` - TypeScript type definitions for keystores and crypto operations

## Installation

```sh
yarn add @xchainjs/xchain-crypto
```

or

```sh
npm install @xchainjs/xchain-crypto
```

## Documentation

### [`xchain crypto`](http://docs.xchainjs.org/xchain-crypto/)
[`How xchain-crypto works`](http://docs.xchainjs.org/xchain-crypto/how-it-works.html)\
[`How to use xchain-crypto`](http://docs.xchainjs.org/xchain-crypto/how-to-use.html)


## Features

- **BIP39 Compatible**: Full support for BIP39 mnemonic phrases
- **Secure Encryption**: Uses AES-128-CTR with PBKDF2 (262,144 iterations)
- **Cross-Chain**: Works with all XChain client implementations
- **Keystore Export**: Compatible with other wallet formats

### Constants

```js
// Crypto Constants for xchain
const cipher = 'aes-128-ctr'
const kdf = 'pbkdf2'
const prf = 'hmac-sha256'
const dklen = 32
const c = 262144
const hashFunction = 'sha256'
const meta = 'xchain-keystore'
```

### Keystore Type

```js
export type Keystore = {
  address: string
  crypto: {
    cipher: string
    ciphertext: string
    cipherparams: {
      iv: string
    }
    kdf: string
    kdfparams: {
      prf: string
      dklen: number
      salt: string
      c: number
    }
    mac: string
  }
  id: string
  version: number
  meta: string
}
```

