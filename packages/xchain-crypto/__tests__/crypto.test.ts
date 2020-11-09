import {
  generatePhrase,
  validatePhrase,
  encryptToKeyStore,
  decryptFromKeystore,
  getPublicKeyPair,
  getAddress,
} from '../src/crypto'
import { encodeAddress } from '../src/utils'

describe('Generate Phrase', () => {
  it('Generates 12-word phrase', () => {
    const phrase = generatePhrase()
    const words = phrase.split(' ')
    expect(words.length).toEqual(12)
  })
  it('Generates 24-word phrase', () => {
    const phrase = generatePhrase(24)
    const words = phrase.split(' ')
    expect(words.length).toEqual(24)
  })
})

describe('Validate Phrase', () => {
  it('Validates 12-word Phrase', () => {
    const phrase = generatePhrase()
    const correctPhrase = validatePhrase(phrase)
    expect(correctPhrase).toBeTruthy()
  })
  it('Validates 24-word Phrase', () => {
    const phrase = generatePhrase(24)
    const correctPhrase = validatePhrase(phrase)
    expect(correctPhrase).toBeTruthy()
  })
  it('Invalidates phrase', () => {
    const phrase = 'flush viable fury sword mention dignity ethics secret nasty gallery teach wrong'
    const incorrectPhrase = validatePhrase(phrase)
    expect(incorrectPhrase).toBeFalsy()
  })
})

describe('getPublicKeyPair', () => {
  it('Generates Correct Publickeys from phrase', async () => {
    const phrase = 'flush viable fury sword mention dignity ethics secret nasty gallery teach fever'
    const publickeys = getPublicKeyPair(phrase)
    expect(encodeAddress(publickeys.secp256k1?.getAddress() ?? '')).toEqual(getAddress(phrase))
    expect(encodeAddress(publickeys.secp256k1?.getAddress() ?? '')).toEqual(
      'thor13ymnnjc4jtymjsc297nulyf0d3qtdl8pyg0tvx',
    )
    expect(encodeAddress(publickeys.ed25519.getAddress())).toEqual('thor179wypy2zld6su560x25mj268dlscyqxhqfjp85')
  })
})

describe('Export Keystore', () => {
  it('Generates Correct Keystore', async () => {
    const phrase = 'flush viable fury sword mention dignity ethics secret nasty gallery teach fever'
    const password = 'thorchain'
    const keystore = await encryptToKeyStore(phrase, password)
    expect(encodeAddress(keystore.publickeys.secp256k1?.getAddress() ?? '')).toEqual(
      'thor13ymnnjc4jtymjsc297nulyf0d3qtdl8pyg0tvx',
    )
    expect(encodeAddress(keystore.publickeys.ed25519.getAddress())).toEqual(
      'thor179wypy2zld6su560x25mj268dlscyqxhqfjp85',
    )
    expect(keystore.crypto.cipher).toEqual('aes-128-ctr')
    expect(keystore.crypto.kdf).toEqual('pbkdf2')
    expect(keystore.crypto.kdfparams.prf).toEqual('hmac-sha256')
    expect(keystore.crypto.kdfparams.c).toEqual(262144)
    expect(keystore.version).toEqual(1)
    expect(keystore.meta).toEqual('xchain-keystore')
  })
})

describe('Import Keystore', () => {
  it('Decrypts Keystore', async () => {
    const phrase = generatePhrase()
    const password = 'thorchain'
    const keystore = await encryptToKeyStore(phrase, password)
    const phraseDecrypted = await decryptFromKeystore(keystore, password)
    expect(phraseDecrypted).toEqual(phrase)
  })
})
