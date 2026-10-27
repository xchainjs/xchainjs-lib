import { createHash } from 'crypto'

import AppBtc from '@ledgerhq/hw-app-btc'
import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import { UTXO, UtxoError } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib'

import { ClientLedger, defaultDogeParams } from '../src'
import { dogeNetwork } from '../src/utils'

// AppBtc is real except for the two device calls, so splitTransaction and serializeTransactionOutputs
// run for real. Nothing here talks to a device or a network.
const RATE = 500
const UNIT = 100_000_000
const BASE = 10
const IN = 148
const OUT = 34

const sha256d = (data: Buffer) => createHash('sha256').update(createHash('sha256').update(data).digest()).digest()

// Legacy serialisation of a one-input one-output transaction paying `script`
const prevTx = (script: Buffer, value: number, seed: number) => {
  const amount = Buffer.alloc(8)
  amount.writeBigUInt64LE(BigInt(value))
  const raw = Buffer.concat([
    Buffer.from('01000000' + '01', 'hex'),
    createHash('sha256').update(`prevout-${seed}`).digest(),
    Buffer.from('00000000' + '00' + 'ffffffff' + '01', 'hex'),
    amount,
    Buffer.from([script.length]),
    script,
    Buffer.from('00000000', 'hex'),
  ])
  return { txHex: raw.toString('hex'), hash: Buffer.from(sha256d(raw)).reverse().toString('hex') }
}

const senderPayment = Dogecoin.payments.p2pkh({ hash: Buffer.alloc(20, 1), network: dogeNetwork(Network.Mainnet) })
const sender = senderPayment.address as string
const senderScript = Buffer.from(senderPayment.output as Uint8Array)
const recipientPayment = Dogecoin.payments.p2pkh({ hash: Buffer.alloc(20, 2), network: dogeNetwork(Network.Mainnet) })
const recipient = recipientPayment.address as string
const recipientScript = Buffer.from(recipientPayment.output as Uint8Array)

const makeUtxo = (value: number, seed: number): UTXO => {
  const { txHex, hash } = prevTx(senderScript, value, seed)
  return {
    hash,
    index: 0,
    value,
    txHex,
    scriptPubKey: senderScript.toString('hex'),
    witnessUtxo: { value, script: senderScript },
  }
}

// Outputs as the device receives them: count, then value, script length and script for each
const parseOutputs = (hex: string) => {
  const buf = Buffer.from(hex, 'hex')
  let offset = 0
  const count = buf[offset++]
  const outputs: { value: number; script: string }[] = []
  for (let i = 0; i < count; i++) {
    const value = Number(buf.readBigUInt64LE(offset))
    offset += 8
    const length = buf[offset++]
    outputs.push({ value, script: buf.subarray(offset, offset + length).toString('hex') })
    offset += length
  }
  return outputs
}

class MockProvider {
  utxos: UTXO[] = []
  sent: string[] = []
  async getUnspentTxs() {
    return this.utxos
  }
  async getConfirmedUnspentTxs() {
    return this.utxos
  }
  async getFeeRates() {
    return { average: RATE, fast: RATE, fastest: RATE }
  }
  async broadcastTx(hex: string) {
    this.sent.push(hex)
    return '00'.repeat(32)
  }
}

const setup = async () => {
  const provider = new MockProvider()
  const client = new ClientLedger({
    ...defaultDogeParams,
    dataProviders: [{ [Network.Mainnet]: provider, [Network.Testnet]: provider, [Network.Stagenet]: provider }],
    transport: { decorateAppAPIMethods: jest.fn(), send: jest.fn() },
  } as ConstructorParameters<typeof ClientLedger>[0])
  const app: AppBtc = await client.getApp()
  jest.spyOn(app, 'getWalletPublicKey').mockResolvedValue({ bitcoinAddress: sender, publicKey: '', chainCode: '' })
  const createPaymentTransaction = jest.spyOn(app, 'createPaymentTransaction').mockResolvedValue('abcdef')
  const splitTransaction = jest.spyOn(app, 'splitTransaction')
  return { provider, client, createPaymentTransaction, splitTransaction }
}

describe('DOGE Ledger transfer', () => {
  it('builds recipient, change and memo outputs and signs the selected inputs', async () => {
    const { provider, client, createPaymentTransaction, splitTransaction } = await setup()
    const utxo = makeUtxo(UNIT, 1)
    provider.utxos = [utxo]
    const memo = 'SWAP:ETH.ETH:0x1234'
    const estimate = (await client.getFees({ sender, memo })).fast.amount().toNumber()
    const amount = UNIT / 2

    const hash = await client.transfer({
      recipient,
      amount: baseAmount(amount, 8),
      memo,
      feeRate: RATE,
      walletIndex: 2,
    })

    expect(hash).toBe('00'.repeat(32))
    expect(provider.sent).toEqual(['abcdef'])
    expect(createPaymentTransaction).toHaveBeenCalledTimes(1)
    const args = createPaymentTransaction.mock.calls[0][0]
    expect(args.inputs).toHaveLength(1)
    expect(args.inputs[0][1]).toBe(utxo.index)
    expect(args.inputs[0][2]).toBeNull()
    expect(splitTransaction.mock.calls[0][0]).toBe(utxo.txHex)
    expect(args.associatedKeysets).toEqual([`${defaultDogeParams.rootDerivationPaths?.[Network.Mainnet]}2`])
    expect(args.additionals).toEqual([])

    const outputs = parseOutputs(args.outputScriptHex as string)
    const fee = estimate
    expect(outputs).toHaveLength(3)
    expect(outputs[0]).toEqual({ value: amount, script: recipientScript.toString('hex') })
    expect(outputs[1]).toEqual({ value: UNIT - amount - fee, script: senderScript.toString('hex') })
    expect(outputs[2].value).toBe(0)
    expect(outputs[2].script.startsWith('6a')).toBe(true)
    // Paid fee is the estimate: the selector and the estimate share one size model
    expect(UNIT - outputs.reduce((sum, o) => sum + o.value, 0)).toBe(estimate)
    expect(estimate).toBe((BASE + IN + 2 * OUT + 9 + outputs[2].script.length / 2) * RATE)
  })

  it('forwards the selection preferences and the selected UTXOs to prepareTxEnhanced', async () => {
    const { provider, client, createPaymentTransaction } = await setup()
    const big = makeUtxo(3 * UNIT, 1)
    const small = makeUtxo(UNIT, 2)
    provider.utxos = [big, small]
    const prepare = jest.spyOn(client, 'prepareTxEnhanced')

    await client.transfer({
      recipient,
      amount: baseAmount(UNIT / 2, 8),
      feeRate: RATE,
      selectedUtxos: [small],
      utxoSelectionPreferences: { minimizeInputs: true },
    })

    expect(prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        sender,
        recipient,
        feeRate: RATE,
        selectedUtxos: [small],
        utxoSelectionPreferences: { minimizeFee: true, avoidDust: true, minimizeInputs: true },
      }),
    )
    const args = createPaymentTransaction.mock.calls[0][0]
    expect(args.inputs).toHaveLength(1)
    expect(parseOutputs(args.outputScriptHex as string)[0].value).toBe(UNIT / 2)
  })

  it('uses the default selection preferences', async () => {
    const { provider, client } = await setup()
    provider.utxos = [makeUtxo(UNIT, 1)]
    const prepare = jest.spyOn(client, 'prepareTxEnhanced')

    await client.transfer({ recipient, amount: baseAmount(UNIT / 2, 8), feeRate: RATE })

    expect(prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        utxoSelectionPreferences: { minimizeFee: true, avoidDust: true, minimizeInputs: false },
      }),
    )
  })

  it('validates the transfer parameters', async () => {
    const { provider, client, createPaymentTransaction } = await setup()
    provider.utxos = [makeUtxo(UNIT, 1)]
    await expect(client.transfer({ recipient, amount: baseAmount(1, 8), feeRate: RATE })).rejects.toThrow(/dust/)
    expect(createPaymentTransaction).not.toHaveBeenCalled()
  })

  it('fails when a UTXO has no txHex (the build needs the previous transaction)', async () => {
    const { provider, client } = await setup()
    const { txHex: _txHex, ...withoutTxHex } = makeUtxo(UNIT, 1)
    provider.utxos = [withoutTxHex]
    await expect(client.transfer({ recipient, amount: baseAmount(UNIT / 2, 8), feeRate: RATE })).rejects.toBeInstanceOf(
      UtxoError,
    )
  })
})
