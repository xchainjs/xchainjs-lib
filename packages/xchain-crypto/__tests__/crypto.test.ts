import { decryptFromKeystore, encryptToKeyStore, generatePhrase, validatePhrase } from '../src/crypto'
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

describe('Export Keystore', () => {
  it('Generates Correct Keystore', async () => {
    const phrase = 'flush viable fury sword mention dignity ethics secret nasty gallery teach fever'
    const password = 'thorchain'
    const keystore = await encryptToKeyStore(phrase, password)
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

describe('encodeAddress', () => {
  const hexValue = '00112233445566778899aabbccddeeff'
  const expected = 'thor1qqgjyv6y24n80zye42aueh0wlu65gth0'

  it('encodes a hex string into a Bech32 address with default prefix', () => {
    const result = encodeAddress(hexValue)
    expect(result).toBe(expected)
  })

  it('encodes a Buffer into a Bech32 address with default prefix', () => {
    const buffer = Buffer.from(hexValue, 'hex')
    const result = encodeAddress(buffer, undefined, 'hex')
    expect(result).toBe(expected)
  })
  it('should encode using a custom prefix', () => {
    const result = encodeAddress(hexValue, 'bnb')
    expect(result.startsWith('bnb1')).toBe(true)
  })
})
