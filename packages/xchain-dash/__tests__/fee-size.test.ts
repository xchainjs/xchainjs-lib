import { createHash } from 'crypto'

import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import { UTXO, UtxoError } from '@xchainjs/xchain-utxo'
import * as Dash from 'bitcoinjs-lib'

import { Client } from '../src'
import { defaultDashParams } from '../src/client'
import { dashNetwork } from '../src/utils'

// Fixed mnemonic and synthetic prevouts: signatures are deterministic (RFC6979), so sizes are exact.
// Nothing here talks to a network: the provider only serves UTXOs and captures the signed hex.
const phrase = 'atom green various power must another rent imitate gadget creek fat then'
const UNIT = 1_000_000
const RATE = 3
// Dust: change at or below this is added to the fee
const DUST = 5460
// P2PKH sizes in bytes
const BASE = 10
const IN = 148
const OUT = 34

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

const makeClient = (provider: MockProvider) =>
  new Client({
    ...defaultDashParams,
    phrase,
    dataProviders: [{ [Network.Mainnet]: provider, [Network.Testnet]: provider, [Network.Stagenet]: provider }],
  } as ConstructorParameters<typeof Client>[0])

const fakeUtxo = (address: string, value: number, seed: number): UTXO => {
  const script = Buffer.from(Dash.address.toOutputScript(address, dashNetwork(Network.Mainnet)))
  return {
    hash: createHash('sha256').update(`prevout-${seed}`).digest('hex'),
    index: 0,
    value,
    scriptPubKey: script.toString('hex'),
    witnessUtxo: { value, script },
  }
}

// Legacy (non-segwit) serialisation: vsize is the byte length
const decode = (hex: string, utxos: UTXO[]) => {
  const buf = Buffer.from(hex, 'hex')
  let offset = 4 // version
  const varint = () => buf[offset++]
  const byOutpoint = new Map(utxos.map((u) => [`${u.hash}:${u.index}`, u.value]))
  let inSum = 0
  const nIn = varint()
  for (let i = 0; i < nIn; i++) {
    const hash = Buffer.from(buf.subarray(offset, offset + 32))
      .reverse()
      .toString('hex')
    const index = buf.readUInt32LE(offset + 32)
    inSum += byOutpoint.get(`${hash}:${index}`) ?? NaN
    offset += 36
    const scriptLength = varint()
    offset += scriptLength + 4 // script and sequence
  }
  let outSum = 0
  const nOut = varint()
  for (let i = 0; i < nOut; i++) {
    outSum += Number(buf.readBigUInt64LE(offset))
    offset += 8
    const scriptLength = varint()
    offset += scriptLength
  }
  return { vsize: buf.length, nIn, nOut, fee: inSum - outSum }
}

const fund = async (client: Client, provider: MockProvider, count: number) => {
  const sender = await client.getAddressAsync(0)
  provider.utxos = Array.from({ length: count }, (_, i) => fakeUtxo(sender, UNIT, i))
  return sender
}

describe('DASH fee size', () => {
  const cases: [number, number, 'send' | 'max'][] = []
  for (const nUtxo of [1, 3, 20]) {
    for (const memoLength of [0, 63, 80]) {
      for (const mode of ['send', 'max'] as const) cases.push([nUtxo, memoLength, mode])
    }
  }

  it.each(cases)('pays the requested rate with %i UTXOs, %i byte memo, %s', async (nUtxo, memoLength, mode) => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    const sender = await fund(client, provider, nUtxo)
    const recipient = await client.getAddressAsync(1)
    const memo = memoLength ? 'a'.repeat(memoLength) : undefined

    const estimate = (await client.getFees({ sender, memo })).fast.amount().toNumber()

    if (mode === 'send') {
      // Needs every UTXO, with change
      await client.transfer({ recipient, amount: baseAmount((nUtxo - 0.5) * UNIT, 8), memo, feeRate: RATE })
    } else {
      await client.transferMax({ recipient, memo, feeRate: RATE })
    }

    const { vsize, nIn, fee } = decode(provider.sent[0], provider.utxos)
    expect(nIn).toBe(nUtxo)
    expect(fee).toBeGreaterThanOrEqual(RATE * vsize)
    expect(fee - RATE * vsize).toBeLessThanOrEqual(RATE * (1 + nIn))
    // The estimate is the send with change; a MAX send has no change output
    expect(fee).toBe(mode === 'send' ? estimate : estimate - RATE * OUT)
  })

  it('estimates without a sender as one input, recipient and change, with no floor', async () => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    const plain = await client.getFees()
    expect(plain.fast.amount().toNumber()).toBe((BASE + IN + 2 * OUT) * RATE)
    const withMemo = await client.getFees({ memo: 'a'.repeat(63) })
    // 8 value + 1 length + OP_RETURN + push + 63 bytes
    expect(withMemo.fast.amount().toNumber()).toBe((BASE + IN + 2 * OUT + 9 + 65) * RATE)
  })

  it('rounds a fractional fee rate up in the estimate and the send', async () => {
    const provider = new MockProvider(2 + 0.2)
    const client = makeClient(provider)
    const sender = await fund(client, provider, 1)
    const estimate = (await client.getFees({ sender })).fast.amount().toNumber()
    expect(estimate).toBe((BASE + IN + 2 * OUT) * (2 + 1))
    await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: baseAmount(UNIT / 2, 8),
      feeRate: 2 + 0.2,
    })
    expect(decode(provider.sent[0], provider.utxos).fee).toBe(estimate)
  })

  it('signs deterministically', async () => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    await fund(client, provider, 1)
    const params = { recipient: await client.getAddressAsync(1), amount: baseAmount(UNIT / 2, 8), feeRate: RATE }
    await client.transfer(params)
    await client.transfer(params)
    expect(provider.sent[0]).toBe(provider.sent[1])
  })

  it.each([0, NaN, Infinity, -1])('rejects a MAX send with fee rate %p', async (feeRate) => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    const sender = await fund(client, provider, 1)
    await expect(
      client.prepareMaxTx({ sender, recipient: await client.getAddressAsync(1), feeRate }),
    ).rejects.toBeInstanceOf(UtxoError)
  })

  it('absorbs change below the chain dust into the fee', async () => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    await fund(client, provider, 1)
    const sizeWithChange = (BASE + IN + 2 * OUT) * RATE
    // Change is DUST - 1 once the change output is priced: it must not be created
    await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: baseAmount(UNIT - sizeWithChange - (DUST - 1), 8),
      feeRate: RATE,
    })
    const { nOut, fee } = decode(provider.sent[0], provider.utxos)
    expect(nOut).toBe(1)
    expect(fee).toBe(sizeWithChange + DUST - 1)
  })

  it.each([
    [5460, 1],
    [5461, 2],
  ])('with change of %i the transaction has %i output(s)', async (change, nOut) => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    await fund(client, provider, 1)
    const fee = (BASE + IN + 2 * OUT) * RATE
    await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: baseAmount(UNIT - fee - change, 8),
      feeRate: RATE,
    })
    const decoded = decode(provider.sent[0], provider.utxos)
    // Change at or below 5460 is absorbed into the fee, above it is kept
    expect(decoded.nOut).toBe(nOut)
    expect(decoded.fee).toBe(nOut === 1 ? fee + change : fee)
  })

  it('estimates a memo send without the old 1000 floor', async () => {
    const provider = new MockProvider(1)
    const client = makeClient(provider)
    const plain = (await client.getFees()).fast.amount().toNumber()
    const withMemo = (await client.getFees({ memo: 'a'.repeat(63) })).fast.amount().toNumber()
    expect(plain).toBe(BASE + IN + 2 * OUT)
    expect(withMemo).toBe(plain + 9 + 65)
    expect(withMemo).not.toBe(1000)
  })

  it('absorbs change between 546 and the dashcore dust (5460) into the fee', async () => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    const sender = await fund(client, provider, 1)
    const memo = 'abc'
    const estimate = (await client.getFees({ sender, memo })).fast.amount().toNumber()
    await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: baseAmount(UNIT - estimate - 1000, 8),
      memo,
      feeRate: RATE,
    })
    const decoded = decode(provider.sent[0], provider.utxos)
    // Recipient and memo only
    expect(decoded.nOut).toBe(2)
    expect(decoded.fee).toBe(estimate + 1000)
  })

  it('keeps and serialises change above the dashcore dust', async () => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    await fund(client, provider, 1)
    const fee = (BASE + IN + 2 * OUT) * RATE
    await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: baseAmount(UNIT - fee - 6000, 8),
      feeRate: RATE,
    })
    const decoded = decode(provider.sent[0], provider.utxos)
    expect(decoded.nOut).toBe(2)
    expect(decoded.fee).toBe(fee)
  })

  it.each([546, 5459])('still rejects a %i recipient amount as dust, as dashcore does', async (amount) => {
    const provider = new MockProvider(RATE)
    const client = makeClient(provider)
    await fund(client, provider, 1)
    await expect(
      client.transfer({ recipient: await client.getAddressAsync(1), amount: baseAmount(amount, 8), feeRate: RATE }),
    ).rejects.toThrow(/Dust amount detected/)
    expect(provider.sent).toHaveLength(0)
  })

  it('sends MAX at the upper fee bound', async () => {
    const provider = new MockProvider(500)
    const client = makeClient(provider)
    await fund(client, provider, 1)
    await client.transferMax({ recipient: await client.getAddressAsync(1), feeRate: 500 })
    expect(decode(provider.sent[0], provider.utxos).fee).toBe((BASE + IN + OUT) * 500)
  })
})
