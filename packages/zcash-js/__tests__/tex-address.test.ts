import { bech32, bech32m } from '@scure/base'
import bs58check from 'bs58check'

import { isValidAddr, mainnetPrefix, skToAddr, testnetPrefix, transparentPkh } from '../src/addr'
import { buildMaxTx, buildTx } from '../src/builder'
import { addressToScript } from '../src/script'

// ZIP 320 reference vector, then the two pairs from issue #1782.
const PAIRS: [string, string][] = [
  ['t1VmmGiyjVNeCjxDZzg7vZmd99WyzVby9yC', 'tex1s2rt77ggv6q989lr49rkgzmh5slsksa9khdgte'],
  ['t1NzY6pFA5h3ndJjVo36Psb6wsuJyuFWYnB', 'tex18q5y0n0m4y4wl9ytnlfwlyc6cyvtfc6fgfgpwj'],
  ['t1XpzA33okQrBQsqdbwZqZLMNao5UNjU3PD', 'tex1nyfspsu4vaxnn025gv754njwckzm8dyuv0calv'],
]

const HASH = Buffer.from('11'.repeat(20), 'hex')

function base58Pkh(prefix: number[], hash: Buffer): string {
  return bs58check.encode(Buffer.concat([Buffer.from(prefix), hash]))
}

function texAddress(hrp: string, hash: Uint8Array): string {
  return bech32m.encode(hrp, bech32m.toWords(hash))
}

describe('ZIP 320 TEX addresses', () => {
  it('decodes a tex address to the same 20-byte hash as its t1', () => {
    for (const [t1, tex] of PAIRS) {
      const fromT = transparentPkh(t1, mainnetPrefix)
      const fromTex = transparentPkh(tex, mainnetPrefix)
      expect(fromT).toBeDefined()
      expect(Buffer.from(fromTex!).equals(Buffer.from(fromT!))).toBe(true)
      expect(addressToScript(tex).equals(addressToScript(t1))).toBe(true)
      expect(addressToScript(t1).subarray(4, 24).equals(Buffer.from(fromT!))).toBe(true)
      expect(isValidAddr(t1, mainnetPrefix)).toBe(true)
      expect(isValidAddr(tex, mainnetPrefix)).toBe(true)
      expect(isValidAddr(tex, testnetPrefix)).toBe(false)
      expect(isValidAddr(t1, testnetPrefix)).toBe(false)
    }
  })

  it('accepts a textest address only on testnet', () => {
    const tm = base58Pkh(testnetPrefix, HASH)
    const textest = texAddress('textest', HASH)
    expect(isValidAddr(textest, testnetPrefix)).toBe(true)
    expect(isValidAddr(textest, mainnetPrefix)).toBe(false)
    expect(isValidAddr(tm, testnetPrefix)).toBe(true)
    expect(addressToScript(textest).equals(addressToScript(tm))).toBe(true)
  })

  it('rejects a bad checksum, the wrong encoding, and a payload that is not 20 bytes', () => {
    const tex = PAIRS[0][1]
    const broken = `${tex.slice(0, -1)}q`
    const bech32Encoded = bech32.encode('tex', bech32m.toWords(HASH))
    const short = bech32m.encode('tex', bech32m.toWords(HASH.subarray(0, 19)))
    const long = bech32m.encode('tex', bech32m.toWords(Buffer.concat([HASH, Buffer.from([1])])))

    expect(isValidAddr(broken, mainnetPrefix)).toBe(false)
    expect(isValidAddr(bech32Encoded, mainnetPrefix)).toBe(false)
    expect(isValidAddr(short, mainnetPrefix)).toBe(false)
    expect(isValidAddr(long, mainnetPrefix)).toBe(false)
    expect(isValidAddr('not an address', mainnetPrefix)).toBe(false)
    expect(() => addressToScript(broken)).toThrow('Invalid address')
    expect(() => addressToScript(short)).toThrow('Invalid address')
  })

  it('accepts an all-uppercase TEX address and rejects mixed case', () => {
    const tex = PAIRS[1][1]
    expect(isValidAddr(tex.toUpperCase(), mainnetPrefix)).toBe(true)
    expect(addressToScript(tex.toUpperCase()).equals(addressToScript(tex))).toBe(true)
    const mixed = `T${tex.slice(1)}`
    expect(isValidAddr(mixed, mainnetPrefix)).toBe(false)
  })

  it('keeps keys derived by this library as t1 addresses', () => {
    const addr = skToAddr(Buffer.alloc(32, 1), mainnetPrefix)
    expect(addr.startsWith('t1')).toBe(true)
    expect(isValidAddr(addr, mainnetPrefix)).toBe(true)
  })

  it('builds a transaction to a TEX recipient', async () => {
    const from = PAIRS[1][0]
    const to = PAIRS[1][1]
    const utxo = [{ address: from, txid: '11'.repeat(32), outputIndex: 0, satoshis: 100_000_000 }]
    const memo = '=:b:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'

    const same = await buildTx(0, from, from, 1_000_000, utxo, true)
    expect(same.outputs[1]).toEqual({ type: 'pkh', address: from, amount: 1_000_000 })

    const tx = await buildTx(0, from, to, 1_000_000, utxo, true, memo)
    expect(tx.outputs[1]).toEqual({ type: 'pkh', address: to, amount: 1_000_000 })
    expect(tx.outputs[2]).toEqual({ type: 'op_return', memo })

    const sweep = await buildMaxTx(0, from, to, utxo, true, memo)
    expect(sweep.outputs[0]).toMatchObject({ type: 'pkh', address: to })
    expect(sweep.maxAmount).toBeGreaterThan(0)

    await expect(buildTx(0, from, `${to.slice(0, -1)}q`, 1_000_000, utxo, true)).rejects.toThrow('Invalid "to" address')
    await expect(buildMaxTx(0, from, texAddress('textest', HASH), utxo, true)).rejects.toThrow('Invalid "to" address')
  })
})
