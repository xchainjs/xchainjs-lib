import { createHash } from 'crypto'

import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import { UTXO, UtxoError } from '@xchainjs/xchain-utxo'
import * as Bitcoin from 'bitcoinjs-lib'

import { Client as BtcClient } from '../src'
import { defaultBTCParams } from '../src/client'
import { legacyDerivationPaths, nestedSegwitDerivationPaths, tapRootDerivationPaths } from '../src/const'
import { AddressFormat } from '../src/types'

// Fixed mnemonic and synthetic prevouts: signatures are deterministic (RFC6979), so sizes are exact.
// Nothing here talks to a network: the provider only serves UTXOs and captures the signed hex.
const phrase = 'atom green various power must another rent imitate gadget creek fat then'
const UNIT = 1_000_000

const FORMATS = [
  { name: 'P2WPKH', addressFormat: AddressFormat.P2WPKH, paths: defaultBTCParams.rootDerivationPaths, out: 31 },
  { name: 'P2TR', addressFormat: AddressFormat.P2TR, paths: tapRootDerivationPaths, out: 43 },
  { name: 'P2SH-P2WPKH', addressFormat: AddressFormat.P2SH_P2WPKH, paths: nestedSegwitDerivationPaths, out: 32 },
  { name: 'P2PKH', addressFormat: AddressFormat.P2PKH, paths: legacyDerivationPaths, out: 34 },
]

class MockProvider {
  utxos: UTXO[] = []
  sent: string[] = []
  constructor(public rate: number) {}
  async getUnspentTxs() {
    return this.utxos
  }
  async getConfirmedUnspentTxs() {
    return this.utxos
  }
  async getFeeRates() {
    return { average: this.rate, fast: this.rate, fastest: this.rate }
  }
  async broadcastTx(hex: string) {
    this.sent.push(hex)
    return '00'.repeat(32)
  }
}

const makeClient = (provider: MockProvider, format = FORMATS[0]) =>
  new BtcClient({
    ...defaultBTCParams,
    phrase,
    addressFormat: format.addressFormat,
    rootDerivationPaths: format.paths,
    dataProviders: [{ [Network.Mainnet]: provider, [Network.Testnet]: provider, [Network.Stagenet]: provider }],
  } as ConstructorParameters<typeof BtcClient>[0])

const fakeUtxo = (address: string, value: number, seed: number): UTXO => {
  const script = Bitcoin.address.toOutputScript(address, Bitcoin.networks.bitcoin)
  const prev = new Bitcoin.Transaction()
  prev.version = 1
  prev.addInput(createHash('sha256').update(`prevout-${seed}`).digest(), 0)
  prev.addOutput(script, value)
  return { hash: prev.getId(), index: 0, value, txHex: prev.toHex(), witnessUtxo: { value, script } }
}

const decode = (hex: string, utxos: UTXO[]) => {
  const tx = Bitcoin.Transaction.fromHex(hex)
  const byOutpoint = new Map(utxos.map((u) => [`${u.hash}:${u.index}`, u.value]))
  const inSum = tx.ins.reduce(
    (sum, i) => sum + (byOutpoint.get(`${Buffer.from(i.hash).reverse().toString('hex')}:${i.index}`) ?? NaN),
    0,
  )
  const outSum = tx.outs.reduce((sum, o) => sum + o.value, 0)
  return { vsize: tx.virtualSize(), nIn: tx.ins.length, fee: inSum - outSum }
}

const fund = async (client: BtcClient, provider: MockProvider, count: number) => {
  const sender = await client.getAddressAsync(0)
  provider.utxos = Array.from({ length: count }, (_, i) => fakeUtxo(sender, UNIT, i))
  return sender
}

describe('BTC fee size', () => {
  describe.each(FORMATS)('$name', (format) => {
    const rate = 3
    const cases: [number, number, 'send' | 'max'][] = []
    for (const nUtxo of [1, 3, 20]) {
      for (const memoLength of [0, 63, 80]) {
        for (const mode of ['send', 'max'] as const) cases.push([nUtxo, memoLength, mode])
      }
    }

    it.each(cases)('pays the requested rate with %i UTXOs, %i byte memo, %s', async (nUtxo, memoLength, mode) => {
      const provider = new MockProvider(rate)
      const client = makeClient(provider, format)
      const sender = await fund(client, provider, nUtxo)
      // Same format as the sender, so the estimate's recipient output is exact
      const recipient = await client.getAddressAsync(1)
      const memo = memoLength ? 'a'.repeat(memoLength) : undefined

      const estimate = (await client.getFees({ sender, memo })).fast.amount().toNumber()

      if (mode === 'send') {
        // Needs every UTXO, with change
        await client.transfer({ recipient, amount: baseAmount((nUtxo - 0.5) * UNIT, 8), memo, feeRate: rate })
      } else {
        await client.transferMax({ recipient, memo, feeRate: rate })
      }

      const { vsize, nIn, fee } = decode(provider.sent[0], provider.utxos)
      expect(nIn).toBe(nUtxo)
      expect(fee).toBeGreaterThanOrEqual(rate * vsize)
      expect(fee - rate * vsize).toBeLessThanOrEqual(rate * (1 + nIn))
      // The estimate is the send with change; a MAX send has no change output
      expect(fee).toBe(mode === 'send' ? estimate : estimate - rate * format.out)
    })
  })

  describe('regressions', () => {
    it('does not pay under 1 sat/vB on a MAX send with a memo at rate 1', async () => {
      for (const [format, count] of [
        [FORMATS[0], 1],
        [FORMATS[1], 2],
      ] as const) {
        const provider = new MockProvider(1)
        const client = makeClient(provider, format)
        await fund(client, provider, count)
        await client.transferMax({ recipient: await client.getAddressAsync(1), memo: 'a'.repeat(63), feeRate: 1 })
        const { vsize, fee } = decode(provider.sent[0], provider.utxos)
        expect(fee).toBeGreaterThanOrEqual(vsize)
      }
    })

    it.each([
      [1, 249],
      [1, 250],
      [1, 251],
      [1, 252],
      [1, 260],
      [1, 300],
      [3, 260],
      [3, 300],
    ])('sizes a long memo exactly on a MAX send at rate %i with a %i byte memo', async (rate, memoLength) => {
      const provider = new MockProvider(rate)
      const client = makeClient(provider)
      const sender = await fund(client, provider, 2)
      const memo = 'a'.repeat(memoLength)
      const estimate = (await client.getFees({ sender, memo })).fast.amount().toNumber()
      await client.transferMax({ recipient: await client.getAddressAsync(1), memo, feeRate: rate })
      const { vsize, fee } = decode(provider.sent[0], provider.utxos)
      expect(fee).toBeGreaterThanOrEqual(rate * vsize)
      // OP_RETURN, the push opcode (PUSHDATA1 up to 255 bytes, then PUSHDATA2) and the data
      const scriptLength = memoLength + (memoLength <= 255 ? 3 : 4)
      const memoOutput = 8 + (scriptLength < 253 ? 1 : 3) + scriptLength
      expect(fee).toBe((11 + 2 * 68 + 31 + memoOutput) * rate)
      expect(fee - rate * vsize).toBeLessThanOrEqual(rate)
      expect(estimate).toBe(fee + 31 * rate)
    })

    it('rejects a boolean memo size in calculateMaxSendableAmount', async () => {
      const provider = new MockProvider(3)
      const client = makeClient(provider)
      await fund(client, provider, 1)
      const calc = client as unknown as {
        calculateMaxSendableAmount: (utxos: UTXO[], feeRate: number, memoBytes: unknown) => unknown
      }
      for (const memoBytes of [true, -1, 1.5, NaN]) {
        expect(() => calc.calculateMaxSendableAmount(provider.utxos, 3, memoBytes)).toThrow(UtxoError)
      }
    })

    it('sizes a P2TR recipient from a P2WPKH sender', async () => {
      const provider = new MockProvider(1)
      const client = makeClient(provider)
      await fund(client, provider, 1)
      const recipient = await makeClient(new MockProvider(1), FORMATS[1]).getAddressAsync(0)
      expect(recipient.startsWith('bc1p')).toBe(true)

      await client.transfer({ recipient, amount: baseAmount(UNIT / 2, 8), memo: 'a'.repeat(63), feeRate: 1 })
      const send = decode(provider.sent[0], provider.utxos)
      expect(send.fee).toBeGreaterThanOrEqual(send.vsize)

      await client.transferMax({ recipient, memo: 'a'.repeat(63), feeRate: 1 })
      const max = decode(provider.sent[1], provider.utxos)
      expect(max.fee).toBeGreaterThanOrEqual(max.vsize)
    })

    it('estimates without a sender as one input, recipient and change, with no floor', async () => {
      const provider = new MockProvider(1)
      const client = makeClient(provider)
      const plain = await client.getFees()
      expect(plain.fast.amount().toNumber()).toBe(11 + 68 + 2 * 31)
      const withMemo = await client.getFees({ memo: 'a'.repeat(63) })
      // 8 value + 1 length + OP_RETURN + push + 63 bytes
      expect(withMemo.fast.amount().toNumber()).toBe(11 + 68 + 2 * 31 + 9 + 65)
    })

    it('rounds a fractional fee rate up in the estimate and the send', async () => {
      const provider = new MockProvider(1.2)
      const client = makeClient(provider)
      const sender = await fund(client, provider, 1)
      const estimate = (await client.getFees({ sender })).fast.amount().toNumber()
      expect(estimate).toBe((11 + 68 + 62) * 2)
      await client.transfer({
        recipient: await client.getAddressAsync(1),
        amount: baseAmount(UNIT / 2, 8),
        feeRate: 1.2,
      })
      expect(decode(provider.sent[0], provider.utxos).fee).toBe(estimate)
    })

    it('signs deterministically', async () => {
      const provider = new MockProvider(3)
      const client = makeClient(provider)
      await fund(client, provider, 1)
      const params = { recipient: await client.getAddressAsync(1), amount: baseAmount(UNIT / 2, 8), feeRate: 3 }
      await client.transfer(params)
      await client.transfer(params)
      expect(provider.sent[0]).toBe(provider.sent[1])
    })

    it.each([0, NaN, Infinity, -1])('rejects a MAX send with fee rate %p', async (feeRate) => {
      const provider = new MockProvider(3)
      const client = makeClient(provider)
      const sender = await fund(client, provider, 1)
      await expect(
        client.prepareMaxTx({ sender, recipient: await client.getAddressAsync(1), feeRate }),
      ).rejects.toBeInstanceOf(UtxoError)
    })

    it('rejects an amount below dust', async () => {
      const provider = new MockProvider(3)
      const client = makeClient(provider)
      await fund(client, provider, 1)
      await expect(
        client.transfer({ recipient: await client.getAddressAsync(1), amount: baseAmount(545, 8), feeRate: 3 }),
      ).rejects.toThrow(/dust/)
    })
  })
})
