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


## Installation

- Install `@xchainjs/xchain-crypto` from `npm`

```bash
yarn add @xchainjs/xchain-crypto
```

## Basic example usage

### Generate new phrase and encrypt

Create a new phrase using generatePhrase()\ 
Check phrase validity using validatePhrase()\
Encrypt to keystore using encryptToKeyStore() > takes two arguements (phrase, password)

```js
// Imports
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from "@xchainjs/xchain-crypto"

require('dotenv').config();

const keystore1 = JSON.parse(fs.readFileSync('keystore.json', 'utf8'))
const password = process.env.PASSWORD

// Generate Keystore and save it to a keystore file
const GenerateKeystore = async () => {
    const phrase = generatePhrase()
    console.log(`phrase ${phrase}`)
    const isCorrect = validatePhrase(phrase) //validate phrase if needed returns Boolean
    console.log(`Phrase valid?: ${isCorrect}`)
    const keystore = await encryptToKeyStore(phrase, password)
    fs.writeFileSync(`./keystore.json`, JSON.stringify(keystore, null, 4), 'utf8')
}
```

### Decrypt keystore to retrieve phrase

Retrieve phrase by calling decryptFromKeystore() 
```ts
const connectWallet = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    console.log(`Phrase: ${phrase}`)
}
```

### Retrieve seed

Returns the seed for a given phrase 

```ts
const seed = async () => {
    let phrase = await decryptFromKeystore(keystore1, password)
    let seed = getSeed(phrase)
    console.log(`Seed ${seed}`)
}
```

## Build

```bash
yarn build
```

## Tests

```bash
yarn test
```

## Extras

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

