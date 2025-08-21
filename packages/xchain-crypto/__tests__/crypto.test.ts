import { decryptFromKeystore, encryptToKeyStore, generatePhrase, validatePhrase } from '../src/crypto'
import crypto from 'crypto'

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

describe('Keystore regression test for encrypt/decrypt with internal migration', () => {
  const phrase = 'patient use either flash couple jump castle true broccoli cancel brand mechanic'
  const password = '1234'

  const expectedKeystore = {
    crypto: {
      cipher: 'aes-128-ctr',
      ciphertext:
        'aa6838a2aded226922107d5a2322513e5dd706149831580356dec17d8ab531f873d3f173c2775f125d2b3203c498214039cfa78ac1d0ecb29c3f9be35483c1e4d0e2267bba7b36cec14172f760a91a',
      cipherparams: { iv: 'dffdb8bbe92e9a00e173eaa20f1a3784' },
      kdf: 'pbkdf2',
      kdfparams: {
        prf: 'hmac-sha256',
        dklen: 32,
        salt: 'ead4ad6c09f5a5586235a642fa39c95741b35283304e3fd464d942e300fe0514',
        c: 262144,
      },
      mac: '10597fd811d910c2a9ae3aa4538d03e7ddda672070c1e324603ecf6bcb0426dd',
    },
    id: '9ad9ea91-22ad-46a7-9613-4f9d190e32ab',
    version: 1,
    meta: 'xchain-keystore',
  }

  it('encryptToKeyStore() should produce expected ciphertext and mac', async () => {
    jest
      .spyOn(crypto, 'randomBytes')
      .mockImplementationOnce(() => Buffer.from(expectedKeystore.crypto.kdfparams.salt, 'hex')) // salt
      .mockImplementationOnce(() => Buffer.from(expectedKeystore.crypto.cipherparams.iv, 'hex')) // iv

    const keystore = await encryptToKeyStore(phrase, password)

    expect(keystore.crypto.ciphertext).toBe(expectedKeystore.crypto.ciphertext)
    expect(keystore.crypto.mac).toBe(expectedKeystore.crypto.mac)
    expect(keystore.crypto.kdfparams).toEqual(expectedKeystore.crypto.kdfparams)
    expect(keystore.crypto.cipherparams).toEqual(expectedKeystore.crypto.cipherparams)
  })

  it('decryptFromKeystore() should return original phrase', async () => {
    const result = await decryptFromKeystore(expectedKeystore, password)
    expect(result).toBe(phrase)
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
