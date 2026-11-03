import {
  decryptFromKeystore,
  encryptToKeyStore,
  generatePhrase,
  Keystore,
  keystoreNeedsUpgrade,
  validatePhrase,
} from '../src/crypto'
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

describe('Keystore v1 regression (legacy format must keep decrypting)', () => {
  const phrase = 'patient use either flash couple jump castle true broccoli cancel brand mechanic'
  const password = '1234'

  const v1Keystore = {
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

  it('decryptFromKeystore() should return original phrase for a v1 keystore', async () => {
    const result = await decryptFromKeystore(v1Keystore, password)
    expect(result).toBe(phrase)
  })

  it('decryptFromKeystore() should still decrypt legacy (c=262144) keystores', async () => {
    const result = await decryptFromKeystore(legacyKeystore, password)
    expect(result).toBe(phrase)
  })

  it('decryptFromKeystore() should reject an incorrect password', async () => {
    await expect(decryptFromKeystore(v1Keystore, 'wrong-password')).rejects.toThrow('Invalid password')
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
      const result = await decryptFromKeystore(v1Keystore, password)
      expect(result).toBe(phrase)
    })

    it('decryptFromKeystore() should still reject an incorrect password via fallback comparison', async () => {
      await expect(decryptFromKeystore(v1Keystore, 'wrong-password')).rejects.toThrow('Invalid password')
    })
  })
})

describe('Keystore v2 (MAC covers the IV)', () => {
  const phrase = 'patient use either flash couple jump castle true broccoli cancel brand mechanic'
  const password = '1234'

  const v2Keystore: Keystore = {
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
      mac: '801caafeca2863d0486c00464fb954ff512e8146e331710173f2c2994068f89f',
    },
    id: '9ad9ea91-22ad-46a7-9613-4f9d190e32ab',
    version: 2,
    meta: 'xchain-keystore',
  }

  // Same key/ciphertext as v2Keystore, but with the v1 MAC (macKey || ciphertext, no IV).
  const v1Mac = 'f2b7858b9f46cc5a4391f1b747561ec5e7197463774b8cc6c62a2da6eb2a9d30'

  const clone = (): Keystore => JSON.parse(JSON.stringify(v2Keystore))

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('encryptToKeyStore() writes version 2 with the expected ciphertext and mac', async () => {
    jest
      .spyOn(crypto, 'randomBytes')
      .mockImplementationOnce(() => Buffer.from(v2Keystore.crypto.kdfparams.salt, 'hex')) // salt
      .mockImplementationOnce(() => Buffer.from(v2Keystore.crypto.cipherparams.iv, 'hex')) // iv

    const keystore = await encryptToKeyStore(phrase, password)

    expect(keystore.version).toBe(2)
    expect(keystore.crypto.ciphertext).toBe(v2Keystore.crypto.ciphertext)
    expect(keystore.crypto.mac).toBe(v2Keystore.crypto.mac)
    expect(keystore.crypto.mac).not.toBe(v1Mac)
    expect(keystore.crypto.kdfparams).toEqual(v2Keystore.crypto.kdfparams)
    expect(keystore.crypto.cipherparams).toEqual(v2Keystore.crypto.cipherparams)
  })

  it('decrypts the v2 fixture', async () => {
    expect(await decryptFromKeystore(v2Keystore, password)).toBe(phrase)
  })

  it('round-trips encrypt -> decrypt', async () => {
    const generated = generatePhrase()
    const keystore = await encryptToKeyStore(generated, 'pw')
    expect(keystore.version).toBe(2)
    expect(await decryptFromKeystore(keystore, 'pw')).toBe(generated)
  })

  it('rejects a wrong password', async () => {
    await expect(decryptFromKeystore(v2Keystore, 'nope')).rejects.toThrow('Invalid password')
  })

  describe('tampering is rejected', () => {
    it('IV tamper', async () => {
      const ks = clone()
      // flip a single bit of the IV
      ks.crypto.cipherparams.iv = 'dffdb8bbe92e9a00e173eaa20f1a3785'
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('Invalid password')
    })

    it('ciphertext tamper', async () => {
      const ks = clone()
      ks.crypto.ciphertext = '15' + ks.crypto.ciphertext.slice(2)
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('Invalid password')
    })

    it('mac tamper', async () => {
      const ks = clone()
      ks.crypto.mac = '00' + ks.crypto.mac.slice(2)
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('Invalid password')
    })

    it('v1 file relabelled as v2', async () => {
      const ks = clone()
      ks.crypto.mac = v1Mac
      ks.version = 1
      // sanity: as v1 it is a legitimate file
      expect(await decryptFromKeystore(ks, password)).toBe(phrase)
      ks.version = 2
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('Invalid password')
    })

    it('v2 file relabelled as v1', async () => {
      const ks = clone()
      ks.version = 1
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('Invalid password')
    })
  })

  describe('strict parameter validation', () => {
    it('dklen 16', async () => {
      const ks = clone()
      ks.crypto.kdfparams.dklen = 16
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('dklen must be 32')
    })

    it('dklen 64', async () => {
      const ks = clone()
      ks.crypto.kdfparams.dklen = 64
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('dklen must be 32')
    })

    it('cipher swapped to aes-256-ctr', async () => {
      const ks = clone()
      ks.crypto.cipher = 'aes-256-ctr'
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('unsupported cipher')
    })

    it.each([0, 3, 99, -1, 1.5, '2' as unknown as number, undefined as unknown as number])(
      'unknown version %p',
      async (version) => {
        const ks = clone()
        ks.version = version
        await expect(decryptFromKeystore(ks, password)).rejects.toThrow('unsupported version')
      },
    )

    it.each([0, -1, 10_000_001, 1.5, Infinity, NaN, 1e12])('invalid iteration count c=%p', async (c) => {
      const ks = clone()
      ks.crypto.kdfparams.c = c
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('iteration count')
    })

    it('huge c is rejected before any key derivation', async () => {
      const ks = clone()
      ks.crypto.kdfparams.c = 2_000_000_000
      const start = Date.now()
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('iteration count')
      expect(Date.now() - start).toBeLessThan(1000)
    })

    it.each([
      '',
      'dffdb8bbe92e9a00e173eaa20f1a37',
      'dffdb8bbe92e9a00e173eaa20f1a378400',
      'zzfdb8bbe92e9a00e173eaa20f1a3784',
    ])('bad IV %p', async (iv) => {
      const ks = clone()
      ks.crypto.cipherparams.iv = iv
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('iv must be 16 bytes')
    })

    it('missing IV', async () => {
      const ks = clone()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ks.crypto.cipherparams = {} as any
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('iv must be 16 bytes')
    })

    it('missing or malformed salt', async () => {
      const ks = clone()
      ks.crypto.kdfparams.salt = ''
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('salt')
      ks.crypto.kdfparams.salt = 'xyz'
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('salt')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (ks.crypto.kdfparams as any).salt
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('salt')
    })

    it('wrong kdf / prf', async () => {
      const ks = clone()
      ks.crypto.kdf = 'scrypt'
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('unsupported kdf')
      const ks2 = clone()
      ks2.crypto.kdfparams.prf = 'hmac-sha1'
      await expect(decryptFromKeystore(ks2, password)).rejects.toThrow('unsupported prf')
    })

    it('malformed mac / ciphertext', async () => {
      const ks = clone()
      ks.crypto.mac = 'nothex'
      await expect(decryptFromKeystore(ks, password)).rejects.toThrow('malformed mac')
      const ks2 = clone()
      ks2.crypto.ciphertext = 'nothex'
      await expect(decryptFromKeystore(ks2, password)).rejects.toThrow('malformed ciphertext')
    })

    it('missing crypto section', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(decryptFromKeystore({ version: 2 } as any, password)).rejects.toThrow('missing crypto section')
    })
  })

  describe('keystoreNeedsUpgrade()', () => {
    it('is true for v1 and false for v2', () => {
      expect(keystoreNeedsUpgrade({ version: 1 })).toBe(true)
      expect(keystoreNeedsUpgrade({ version: 2 })).toBe(false)
    })

    it('lets callers migrate a v1 keystore to v2 after unlocking', async () => {
      const v1: Keystore = { ...clone(), version: 1 }
      v1.crypto.mac = v1Mac
      expect(keystoreNeedsUpgrade(v1)).toBe(true)
      const unlocked = await decryptFromKeystore(v1, password)
      const upgraded = await encryptToKeyStore(unlocked, password)
      expect(keystoreNeedsUpgrade(upgraded)).toBe(false)
      expect(await decryptFromKeystore(upgraded, password)).toBe(phrase)
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
    expect(keystore.crypto.cipher).toEqual('aes-128-ctr')
    expect(keystore.crypto.kdf).toEqual('pbkdf2')
    expect(keystore.crypto.kdfparams.prf).toEqual('hmac-sha256')
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
