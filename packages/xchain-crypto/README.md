# XCHAIN-CRYPTO

The XCHAIN CRYPTO package is a crypto package used by all `XCHAIN` clients.

XCHAIN-CRYPTO encrypts a master phrase to a keystore. This keystore can then be exported to other XCHAIN wallets or stored securely.

Users can export their phrase and import them into other wallets since it is a BIP39 compatible phrase.

## Design

Typically keystore files encrypt a `seed` to a file, however this is not appropriate or UX friendly, since the phrase cannot be recovered after the fact.

Crypto design:

[entropy] -> [phrase] -> [seed] -> [privateKey] -> [publicKey] -> [address]

Instead, XCHAIN-CRYPTO stores the phrase in a keystore file, then decrypts and passes this phrase to other clients:

[keystore] -> XCHAIN-CRYPTO -> [phrase] -> ChainClient

The ChainClients can then convert this into their respective key-pairs and addresses.
Users can also export their phrases after the fact, ensuring they have saved it securely. This could enhance UX onboarding since users aren't forced to write their phrases down immediately for empty or test wallets.

```js
// Crypto Constants for xchain
const XChainBIP39Phrase = 'xchain'
const BIP44Path = "m/44'/931'/0'/0/0"
const cipher = 'aes-128-ctr'
const kdf = 'pbkdf2'
const prf = 'hmac-sha256'
const dklen = 32
const c = 262144
const hashFunction = 'sha256'
const meta = 'xchain-keystore'
```

## Installation

- Install `@xchainjs/xchain-crypto` from `npm`

```bash
yarn add @xchainjs/xchain-crypto
```

## Usage

### Basic usage

```js
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from '../src/crypto'

const phrase = generatePhrase()
const isCorrect = validatePhrase(phrase)
const password = 'thorchain'
const keystore = await encryptToKeyStore(phrase, password)
const phraseDecrypted = await decryptFromKeystore(keystore, password)
```

Keystore Type

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

### Error handling

## Development

### Build

```bash
yarn build
```

### Tests

```bash
yarn test
```
