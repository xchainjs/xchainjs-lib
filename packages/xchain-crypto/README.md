# XCHAIN-CRYPTO

The XCHAIN CRYPTO package is a crypto package used by all `XCHAIN` clients.

XCHAIN-CRYPTO encrypts a master phrase to a keystore. This keystore can then be exported to other XCHAIN wallets or stored securely.

Users can export their phrase and import them into other wallets since it is a BIP39 compatible phrase.

## Installation

- Install `@xchainjs/xchain-crypto` from `npm`

```bash
yarn add @xchainjs/xchain-crypto
```

## Documentation

[`How it works`](http://docs.xchainjs.org/xchain-crypto/how-it-works.html)
[`how to use`](http://docs.xchainjs.org/xchain-crypto/how-to-use.html)


## Build

```bash
yarn build
```

## Tests

```bash
yarn test
```

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

