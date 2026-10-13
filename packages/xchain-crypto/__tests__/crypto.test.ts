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

  // v2 keystore (aes-256-ctr, dklen 64) — the format written by the current encryptToKeyStore.
  // Known-answer test: produced from the fixed salt/iv/password/phrase above.
  const expectedKeystoreV2 = {
    crypto: {
      cipher: 'aes-256-ctr',
      ciphertext:
        '31607fd3f65a69ded1701f2f45f1bc7eba8d8ac3eb3a9c50e95ac9d5915631e34c59ba05047bfe4f1ae5639081ea705eef5e65fea253b39faa5e2c0e8b606c60606cb1e5c4081518ca4dcb472fe7d9',
      cipherparams: { iv: 'dffdb8bbe92e9a00e173eaa20f1a3784' },
      kdf: 'pbkdf2',
      kdfparams: {
        prf: 'hmac-sha256',
        dklen: 64,
        salt: 'ead4ad6c09f5a5586235a642fa39c95741b35283304e3fd464d942e300fe0514',
        c: 600000,
      },
      mac: '7c437ee1126fe587317a32dccef99970d16384c21db28ed6d8a7dedf8a77eaf0',
    },
    id: '9ad9ea91-22ad-46a7-9613-4f9d190e32ab',
    version: 2,
    meta: 'xchain-keystore',
  }

  // v1 keystore (aes-128-ctr, dklen 32) — the format written before the AES-256 upgrade.
  // Must remain decryptable so existing wallets keep working (backward-compatible read).
  const expectedKeystore = {
    crypto: {
      cipher: 'aes-128-ctr',
      ciphertext:
        '14bdcc0565d4ecd101a61a129b4cf109d80a496ee46547013086daab702554f6fa6b78596cc0bc008e2c26518b0c38e066fb215746639674b8f1be4693ef17ae77b35dbab753421af10307df1f177a',
      cipherparams: { iv: 'dffdb8bbe92e9a00e173eaa20f1a3784' },
      kdf: 'pbkdf2',
      kdfparams: {
        prf: 'hmac-sha256',
        dklen: 32,
        salt: 'ead4ad6c09f5a5586235a642fa39c95741b35283304e3fd464d942e300fe0514',
        c: 600000,
      },
      mac: 'f2b7858b9f46cc5a4391f1b747561ec5e7197463774b8cc6c62a2da6eb2a9d30',
    },
    id: '9ad9ea91-22ad-46a7-9613-4f9d190e32ab',
    version: 1,
    meta: 'xchain-keystore',
  }

  // Keystore produced with the legacy c=262144 iteration count. The iteration count is
  // stored in the keystore itself, so older keystores must still decrypt unchanged.
  const legacyKeystore = {
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

  it('encryptToKeyStore() should produce the expected v2 (aes-256-ctr) ciphertext and mac', async () => {
    jest
      .spyOn(crypto, 'randomBytes')
      .mockImplementationOnce(() => Buffer.from(expectedKeystoreV2.crypto.kdfparams.salt, 'hex')) // salt
      .mockImplementationOnce(() => Buffer.from(expectedKeystoreV2.crypto.cipherparams.iv, 'hex')) // iv

    const keystore = await encryptToKeyStore(phrase, password)

    expect(keystore.crypto.cipher).toBe('aes-256-ctr')
    expect(keystore.version).toBe(2)
    expect(keystore.crypto.ciphertext).toBe(expectedKeystoreV2.crypto.ciphertext)
    expect(keystore.crypto.mac).toBe(expectedKeystoreV2.crypto.mac)
    expect(keystore.crypto.kdfparams).toEqual(expectedKeystoreV2.crypto.kdfparams)
    expect(keystore.crypto.cipherparams).toEqual(expectedKeystoreV2.crypto.cipherparams)
  })

  it('decryptFromKeystore() should decrypt a v2 (aes-256-ctr) keystore', async () => {
    const result = await decryptFromKeystore(expectedKeystoreV2, password)
    expect(result).toBe(phrase)
  })

  it('decryptFromKeystore() should still decrypt a legacy v1 (aes-128-ctr) keystore', async () => {
    const result = await decryptFromKeystore(expectedKeystore, password)
    expect(result).toBe(phrase)
  })

  it('decryptFromKeystore() should still decrypt legacy (c=262144) keystores', async () => {
    const result = await decryptFromKeystore(legacyKeystore, password)
    expect(result).toBe(phrase)
  })

  it('decryptFromKeystore() should reject an incorrect password', async () => {
    await expect(decryptFromKeystore(expectedKeystore, 'wrong-password')).rejects.toThrow('Invalid password')
  })

  // Browsers/bundlers polyfill `crypto` with crypto-browserify, which lacks
  // timingSafeEqual. Simulate its absence and ensure decrypt still works.
  describe('without crypto.timingSafeEqual (browser polyfill)', () => {
    const original = crypto.timingSafeEqual

    beforeEach(() => {
      // @ts-expect-error simulate a polyfill that does not implement timingSafeEqual
      crypto.timingSafeEqual = undefined
    })

    afterEach(() => {
      crypto.timingSafeEqual = original
    })

    it('decryptFromKeystore() should return original phrase via fallback comparison', async () => {
      const result = await decryptFromKeystore(expectedKeystore, password)
      expect(result).toBe(phrase)
    })

    it('decryptFromKeystore() should still reject an incorrect password via fallback comparison', async () => {
      await expect(decryptFromKeystore(expectedKeystore, 'wrong-password')).rejects.toThrow('Invalid password')
    })
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
    expect(keystore.crypto.cipher).toEqual('aes-256-ctr')
    expect(keystore.crypto.kdf).toEqual('pbkdf2')
    expect(keystore.crypto.kdfparams.prf).toEqual('hmac-sha256')
    expect(keystore.crypto.kdfparams.dklen).toEqual(64)
    expect(keystore.crypto.kdfparams.c).toEqual(600000)
    expect(keystore.version).toEqual(2)
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
