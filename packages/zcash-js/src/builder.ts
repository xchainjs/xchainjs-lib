import { secp256k1 } from '@noble/curves/secp256k1'
import { blake2b } from '@noble/hashes/blake2b'
import { min, sumBy } from 'lodash'

import { isValidAddr, mainnetPrefix, testnetPrefix } from './addr'
import { addressToScript, memoToScript, writeSigScript } from './script'
import { Output, OutputMemo, OutputPKH, Tx, UTXO } from './types'
import { writeCompactInt } from './writer'

// NU6.1 Consensus Branch ID - activated November 24, 2025 at block height 3146400
// See ZIP 255: https://zips.z.cash/zip-0255
const NU6_1_CONSENSUS_BRANCH_ID = 0x4dec4df0

// Version Group ID for transaction version 5
const TX_VERSION_GROUP_ID = 0x26a7270a

// Transaction version 5 with overwinter flag
const TX_VERSION = 0x80000005

const PKH_OUTPUT_SIZE = 34
const MARGINAL_FEE = 5000
const GRACE_ACTIONS = 2

function calculateFee(inCount: number, outCount: number): number {
  const logicalActions = inCount + outCount
  return MARGINAL_FEE * Math.max(GRACE_ACTIONS, logicalActions)
}

export function getFee(inCount: number, outCount: number, memo?: string): number {
  if (memo && memo.length > 0) {
    const memoLenWithOverhead = memo.length + 2
    const memoOutputSlots = Math.floor((memoLenWithOverhead + PKH_OUTPUT_SIZE - 1) / PKH_OUTPUT_SIZE)
    outCount += memoOutputSlots
  }
  return calculateFee(inCount, outCount)
}

function selectUTXOS(utxos: UTXO[], amount: number, memo?: string): UTXO[] {
  let currentFee = 0
  const selected: UTXO[] = []
  let remaining = amount
  for (const utxo of utxos) {
    if (remaining == 0) break
    selected.push(utxo)
    const fee = getFee(selected.length, 2, memo)
    const deltaFee = fee - currentFee
    currentFee = fee
    remaining += deltaFee
    const used = min([utxo.satoshis, remaining])!
    remaining -= used
  }
  return selected
}

/**
 * Create a blake2b hash with personalization string
 */
function blake2bWithPersonal(data: Uint8Array, personal: string | Uint8Array): Uint8Array {
  const personalBytes = typeof personal === 'string' ? new TextEncoder().encode(personal) : personal
  // Pad personal to 16 bytes
  const paddedPersonal = new Uint8Array(16)
  paddedPersonal.set(personalBytes.slice(0, 16))

  return blake2b(data, { dkLen: 32, personalization: paddedPersonal })
}

export async function buildTx(
  height: number,
  from: string,
  to: string,
  amount: number,
  utxos: UTXO[],
  isMainnet: boolean,
  memo?: string,
): Promise<Tx> {
  const prefixb = isMainnet ? mainnetPrefix : testnetPrefix
  const prefix = Buffer.from(prefixb)
  if (!isValidAddr(from, prefix)) throw new Error('Invalid "from" address')
  if (!isValidAddr(to, prefix)) throw new Error('Invalid "to" address')
  if (amount > 1e14) throw new Error('Amount too large')
  if (memo && memo.length > 80) throw new Error('Memo too long')

  const inputs = selectUTXOS(utxos, amount, memo)
  const outputCount = memo ? 3 : 2 // change + to + memo (if exists)
  const fee = getFee(inputs.length, outputCount, memo)
  const change = sumBy(inputs, (u: UTXO) => u.satoshis) - amount - fee
  if (change < 0) throw new Error('Not enough funds')

  const outputs: Output[] = []
  outputs.push({
    type: 'pkh',
    address: from,
    amount: change,
  })
  outputs.push({
    type: 'pkh',
    address: to,
    amount: amount,
  })
  if (memo) {
    outputs.push({
      type: 'op_return',
      memo: memo,
    })
  }

  return {
    height: height,
    inputs: inputs,
    outputs: outputs,
    fee: fee,
  }
}

export async function signAndFinalize(height: number, skb: string, utxos: UTXO[], outputs: Output[]): Promise<Buffer> {
  const sk = new Uint8Array(Buffer.from(skb, 'hex'))
  const pk = secp256k1.getPublicKey(sk, true)
  let offset = 0

  // HEADER with NU6.1 consensus branch ID
  let buf = Buffer.alloc(20)
  buf.writeUInt32LE(TX_VERSION, 0) // Transaction version 5 with overwinter flag
  buf.writeUInt32LE(TX_VERSION_GROUP_ID, 4) // Version group ID
  buf.writeUInt32LE(NU6_1_CONSENSUS_BRANCH_ID, 8) // NU6.1 consensus branch ID (FIXED!)
  buf.writeUInt32LE(0x00000000, 12) // Lock time
  buf.writeUInt32LE(height, 16) // Expiry height

  const headerHash = Buffer.from(blake2bWithPersonal(buf, 'ZTxIdHeadersHash')).toString('hex')

  buf = Buffer.alloc(36 * utxos.length)
  for (const [i, utxo] of utxos.entries()) {
    const txid = Buffer.from(utxo.txid, 'hex')
    txid.reverse()
    txid.copy(buf, 36 * i)
    buf.writeUInt32LE(utxo.outputIndex, 36 * i + 32)
  }

  const prevoutputsHash = Buffer.from(blake2bWithPersonal(buf, 'ZTxIdPrevoutHash')).toString('hex')

  buf = Buffer.alloc(4 * utxos.length)
  for (const [i] of utxos.entries()) {
    buf.writeInt32LE(-1, 4 * i)
  }

  const sequencesHash = Buffer.from(blake2bWithPersonal(buf, 'ZTxIdSequencHash')).toString('hex')

  // Calculate the actual buffer size needed for outputs
  let outputsBufferSize = 0
  for (const output of outputs) {
    if (output.type === 'pkh') {
      outputsBufferSize += 34 // 8 bytes amount + 26 bytes script
    } else if (output.type === 'op_return') {
      outputsBufferSize += 8 + memoToScript((output as OutputMemo).memo).length
    }
  }

  buf = Buffer.alloc(outputsBufferSize)
  offset = 0
  for (const output of outputs) {
    switch (output.type) {
      case 'pkh': {
        buf.writeUIntLE((output as OutputPKH).amount, offset, 6) // 6 is the max
        offset += 8
        const pkhscript = addressToScript((output as OutputPKH).address)
        pkhscript.copy(buf, offset)
        offset += 26
        break
      }
      case 'op_return': {
        offset += 8
        const oprscript = memoToScript((output as OutputMemo).memo)
        oprscript.copy(buf, offset)
        offset += oprscript.length
        break
      }
    }
  }

  const outputsHash = Buffer.from(blake2bWithPersonal(buf.subarray(0, offset), 'ZTxIdOutputsHash')).toString('hex')

  buf = Buffer.alloc(8 * utxos.length)
  for (const [i, utxo] of utxos.entries()) {
    buf.writeUIntLE(utxo.satoshis, 8 * i, 6)
  }

  const amountsHash = Buffer.from(blake2bWithPersonal(buf, 'ZTxTrAmountsHash')).toString('hex')

  buf = Buffer.alloc(26 * utxos.length)
  for (const [i, utxo] of utxos.entries()) {
    const script = addressToScript(utxo.address)
    script.copy(buf, 26 * i)
  }

  const scriptsHash = Buffer.from(blake2bWithPersonal(buf, 'ZTxTrScriptsHash')).toString('hex')

  const signatures: Uint8Array[] = []
  for (const utxo of utxos) {
    buf = Buffer.alloc(32 + 4 + 8 + 26 + 4)
    offset = 0
    const txid = Buffer.from(utxo.txid, 'hex')
    txid.reverse()
    txid.copy(buf, offset)
    offset += 32
    buf.writeUInt32LE(utxo.outputIndex, offset)
    offset += 4
    buf.writeUIntLE(utxo.satoshis, offset, 6)
    offset += 8
    const script = addressToScript(utxo.address)
    script.copy(buf, offset)
    offset += 26
    buf.writeInt32LE(-1, offset)

    const txInHash = Buffer.from(blake2bWithPersonal(buf, 'Zcash___TxInHash')).toString('hex')

    buf = Buffer.alloc(1 + 32 * 6)
    offset = 1
    buf[0] = 1
    Buffer.from(prevoutputsHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from(amountsHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from(scriptsHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from(sequencesHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from(outputsHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from(txInHash, 'hex').copy(buf, offset)
    offset += 32

    const transparentHash = Buffer.from(blake2bWithPersonal(buf, 'ZTxIdTranspaHash')).toString('hex')

    buf = Buffer.alloc(32 * 4)
    offset = 0
    Buffer.from(headerHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from(transparentHash, 'hex').copy(buf, offset)
    offset += 32
    Buffer.from('6f2fc8f98feafd94e74a0df4bed74391ee0b5a69945e4ced8ca8a095206f00ae', 'hex').copy(buf, offset)
    offset += 32
    Buffer.from('9fbe4ed13b0c08e671c11a3407d84e1117cd45028a2eee1b9feae78b48a6e2c1', 'hex').copy(buf, offset)
    offset += 32

    // Create personalization with NU6.1 branch ID
    const personal = Buffer.alloc(16)
    Buffer.from('ZcashTxHash_').copy(personal)
    personal.writeUInt32LE(NU6_1_CONSENSUS_BRANCH_ID, 12) // NU6.1 consensus branch ID (FIXED!)

    const sigHash = blake2bWithPersonal(buf, personal)
    const signature = secp256k1.sign(sigHash, sk, { lowS: true, prehash: false })
    const signatureDER = signature.toDERRawBytes()
    signatures.push(signatureDER)
  }

  // Build final transaction - calculate required buffer size dynamically
  // Header: 20 bytes (version + versionGroupId + consensusBranchId + lockTime + expiryHeight)
  // Per input: 32 (txid) + 4 (vout) + ~1 (compactInt) + ~110 (sigScript: 5 + ~72 sig + 33 pubkey) + 4 (sequence) = ~151 bytes
  // Per output: 8 (amount) + ~26-80 (script) = ~34-88 bytes
  // Trailing: 3 bytes (empty sapling/orchard bundles)
  const maxSigScriptSize = 5 + 73 + 33 // overhead + max DER sig + compressed pubkey
  const perInputSize = 32 + 4 + 3 + maxSigScriptSize + 4 // txid + vout + compactInt + sigScript + sequence
  const perOutputSize = 8 + 80 // amount + max script size (memo can be up to 80 chars)
  const headerSize = 20
  const trailingSize = 3
  const compactIntSize = 3 // max for reasonable counts

  const txBufferSize =
    headerSize +
    compactIntSize +
    utxos.length * perInputSize +
    compactIntSize +
    outputs.length * perOutputSize +
    trailingSize

  buf = Buffer.alloc(txBufferSize)
  offset = 0
  buf.writeUInt32LE(TX_VERSION, offset) // Transaction version
  offset += 4
  buf.writeUInt32LE(TX_VERSION_GROUP_ID, offset) // Version group ID
  offset += 4
  buf.writeUInt32LE(NU6_1_CONSENSUS_BRANCH_ID, offset) // NU6.1 consensus branch ID (FIXED!)
  offset += 4
  buf.writeUInt32LE(0x00000000, offset) // Lock time
  offset += 4
  buf.writeUInt32LE(height, offset) // Expiry height
  offset += 4

  const txinc = writeCompactInt(utxos.length)
  txinc.copy(buf, offset)
  offset += txinc.length

  for (const [i, utxo] of utxos.entries()) {
    const txid = Buffer.from(utxo.txid, 'hex')
    txid.reverse()
    txid.copy(buf, offset)
    offset += 32
    buf.writeUInt32LE(utxo.outputIndex, offset)
    offset += 4
    const ss = writeSigScript(signatures[i], pk)
    const ssl = writeCompactInt(ss.length)
    ssl.copy(buf, offset)
    offset += ssl.length
    ss.copy(buf, offset)
    offset += ss.length
    buf.writeInt32LE(-1, offset)
    offset += 4
  }

  const txoutc = writeCompactInt(outputs.length)
  txoutc.copy(buf, offset)
  offset += txoutc.length

  for (const out of outputs) {
    switch (out.type) {
      case 'pkh': {
        buf.writeBigInt64LE(BigInt((out as OutputPKH).amount), offset)
        offset += 8
        const pkhscript = addressToScript((out as OutputPKH).address)
        pkhscript.copy(buf, offset)
        offset += pkhscript.length
        break
      }
      case 'op_return': {
        offset += 8
        const memoscript = memoToScript((out as OutputMemo).memo)
        memoscript.copy(buf, offset)
        offset += memoscript.length
        break
      }
    }
  }

  // Add 000000 (empty sapling/orchard bundles)
  offset += 3

  return buf.subarray(0, offset)
}
