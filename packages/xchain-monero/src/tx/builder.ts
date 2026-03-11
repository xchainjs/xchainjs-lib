/**
 * Monero transaction builder.
 * Orchestrates: stealth addresses, Pedersen commitments, ECDH encryption,
 * CLSAG signatures, Bulletproofs+ range proofs, and serialization.
 *
 * Reference: monero/src/wallet/wallet2.cpp (create_transactions_2)
 */

import { bytesToNumberLE, numberToBytesLE } from '@noble/curves/abstract/utils'

import { clsagSign } from '../crypto/clsag'
import { bulletproofPlusProve } from '../crypto/bulletproofsPlus'
import { commit } from '../crypto/pedersen'
import { generateKeyImage } from '../crypto/keyImage'
import { deriveOutputKey, deriveInputKey } from '../crypto/stealth'
import { deriveSharedSecret, encryptAmount } from '../crypto/ecdh'
import { secretKeyToPublicKey } from '../crypto/keys'
import { keccak_256 } from '@noble/hashes/sha3'

import { scReduce32, concatBytes, bytesToHex, hexToBytes } from '../utils'
import { selectDecoys, buildRingIndices, toRelativeOffsets } from './decoySelection'
import { serializeTransaction, txPrefixHash, serializeRctBase, serializeRctPrunable, rctSigHash } from './serialize'
import * as daemon from '../daemon'
import type { MoneroTransaction, RingMember, TxInput, TxOutput, RctSignatures } from './types'

const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989')

/** Input to spend */
export interface SpendableOutput {
  globalIndex: number
  amount: bigint
  mask: Uint8Array // 32-byte commitment mask
  txPubKey: Uint8Array // 32-byte tx public key for derivation
  outputIndex: number // output index within the tx
  publicKey: Uint8Array // 32-byte one-time output public key
}

/** Destination output */
export interface Destination {
  pubViewKey: Uint8Array // 32-byte recipient public view key
  pubSpendKey: Uint8Array // 32-byte recipient public spend key
  amount: bigint
}

/** Result of building a transaction */
export interface BuiltTransaction {
  tx: MoneroTransaction
  txHex: string
  txHash: string
}

function randomScalar(): Uint8Array {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return scReduce32(bytes)
}

/**
 * Build a complete Monero RingCT transaction.
 *
 * @param inputs - Spendable outputs to use as inputs
 * @param destinations - Recipients + amounts
 * @param changeDestination - Change address keys (pubView, pubSpend)
 * @param fee - Transaction fee in piconero
 * @param privViewKey - Sender's private view key
 * @param privSpendKey - Sender's private spend key
 * @param daemonUrl - Daemon RPC URL for decoy selection
 * @returns Built transaction ready for broadcast
 */
export async function buildTransaction(
  inputs: SpendableOutput[],
  destinations: Destination[],
  changeDestination: { pubViewKey: Uint8Array; pubSpendKey: Uint8Array },
  fee: bigint,
  privViewKey: Uint8Array,
  privSpendKey: Uint8Array,
  daemonUrl: string,
): Promise<BuiltTransaction> {
  if (inputs.length === 0) throw new Error('No inputs')
  if (destinations.length === 0) throw new Error('No destinations')

  const totalIn = inputs.reduce((sum, inp) => sum + inp.amount, BigInt(0))
  const totalOut = destinations.reduce((sum, d) => sum + d.amount, BigInt(0))
  if (totalIn < totalOut + fee) throw new Error('Insufficient funds')

  // Add change output if needed
  const change = totalIn - totalOut - fee
  const allDestinations = [...destinations]
  if (change > BigInt(0)) {
    allDestinations.push({
      pubViewKey: changeDestination.pubViewKey,
      pubSpendKey: changeDestination.pubSpendKey,
      amount: change,
    })
  }

  // Generate tx private key
  const txPrivKey = randomScalar()
  const txPubKey = secretKeyToPublicKey(txPrivKey)

  // --- Build outputs ---
  const txOutputs: TxOutput[] = []
  const outAmounts: bigint[] = []
  const outMasks: Uint8Array[] = []
  const outCommitments: Uint8Array[] = []
  const ecdhInfo: Uint8Array[] = []

  for (let i = 0; i < allDestinations.length; i++) {
    const dest = allDestinations[i]

    // One-time output key
    const outputKey = deriveOutputKey(txPrivKey, dest.pubViewKey, dest.pubSpendKey, i)
    txOutputs.push({ amount: BigInt(0), key: outputKey })

    // Output commitment mask
    const outMask = randomScalar()
    outMasks.push(outMask)
    outAmounts.push(dest.amount)

    // Pedersen commitment: C = mask*G + amount*H
    const commitment = commit(outMask, dest.amount)
    outCommitments.push(commitment.toRawBytes())

    // ECDH encrypted amount
    const sharedSecret = deriveSharedSecret(txPrivKey, dest.pubViewKey)
    const encrypted = encryptAmount(dest.amount, sharedSecret, i)
    ecdhInfo.push(encrypted)
  }

  // --- Build inputs with decoys ---
  const distData = await daemon.getOutputDistribution(daemonUrl)
  const height = await daemon.getHeight(daemonUrl)
  const numOutputs = distData.distribution[distData.distribution.length - 1]

  const txInputs: TxInput[] = []
  const rings: RingMember[][] = []
  const realIndices: number[] = []
  const inputPrivKeys: Uint8Array[] = []
  const inputMasks: Uint8Array[] = []
  const keyImages: Uint8Array[] = []
  const pseudoOuts: Uint8Array[] = []
  const pseudoMasks: Uint8Array[] = []

  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i]

    // Derive the one-time private key for this input
    const inputPrivKey = deriveInputKey(inp.txPubKey, privViewKey, privSpendKey, inp.outputIndex)
    inputPrivKeys.push(inputPrivKey)

    // Key image
    const ki = generateKeyImage(inputPrivKey, inp.publicKey)
    keyImages.push(ki)

    // Select decoys
    const decoys = selectDecoys(
      inp.globalIndex,
      numOutputs,
      height,
      distData.distribution,
      distData.startHeight,
    )
    const { indices: ringIndices, realIndex } = buildRingIndices(inp.globalIndex, decoys)
    realIndices.push(realIndex)
    const offsets = toRelativeOffsets(ringIndices)

    // Fetch ring member public keys and commitments from daemon
    const outsReq = ringIndices.map((idx) => ({ amount: 0, index: idx }))
    const outs = await daemon.getOuts(daemonUrl, outsReq)

    const ring: RingMember[] = outs.map((out) => ({
      dest: hexToBytes(out.key),
      mask: hexToBytes(out.mask),
    }))
    rings.push(ring)

    txInputs.push({
      amount: BigInt(0),
      keyOffsets: offsets,
      keyImage: ki,
    })

    inputMasks.push(inp.mask)

    // Pseudo-output commitment (random mask, same amount as real input)
    const pseudoMask = randomScalar()
    pseudoMasks.push(pseudoMask)
    const pseudoCommitment = commit(pseudoMask, inp.amount)
    pseudoOuts.push(pseudoCommitment.toRawBytes())
  }

  // Adjust last pseudo-output mask so commitments balance:
  // sum(pseudoMasks) = sum(outMasks) + 0 (fee mask is 0)
  // So: pseudoMasks[last] = sum(outMasks) - sum(pseudoMasks[0..n-2])
  if (inputs.length > 0) {
    let sumOutMasks = BigInt(0)
    for (const m of outMasks) sumOutMasks = (sumOutMasks + bytesToNumberLE(m)) % L

    let sumPseudoMasks = BigInt(0)
    for (let i = 0; i < pseudoMasks.length - 1; i++) {
      sumPseudoMasks = (sumPseudoMasks + bytesToNumberLE(pseudoMasks[i])) % L
    }

    let lastMask = (sumOutMasks - sumPseudoMasks) % L
    if (lastMask < BigInt(0)) lastMask += L
    const lastIdx = pseudoMasks.length - 1
    pseudoMasks[lastIdx] = new Uint8Array(numberToBytesLE(lastMask, 32))

    // Recompute last pseudo-output commitment
    pseudoOuts[lastIdx] = commit(pseudoMasks[lastIdx], inputs[lastIdx].amount).toRawBytes()
  }

  // --- Bulletproofs+ range proof ---
  const bppProof = bulletproofPlusProve(outAmounts, outMasks)

  // --- Build tx extra (tx public key) ---
  const extra = concatBytes(new Uint8Array([0x01]), txPubKey) // tag 0x01 = tx pubkey

  // --- Assemble transaction ---
  const rctSig: RctSignatures = {
    type: 6, // RCTTypeBulletproofPlus
    txnFee: fee,
    ecdhInfo,
    outPk: outCommitments,
    pseudoOuts,
    clsags: [], // filled below
    bppProofs: [bppProof],
  }

  const tx: MoneroTransaction = {
    version: 2,
    unlockTime: BigInt(0),
    inputs: txInputs,
    outputs: txOutputs,
    extra,
    rctSignatures: rctSig,
  }

  // --- Sign each input with CLSAG ---
  const prefixHash = txPrefixHash(tx)
  const rctBase = serializeRctBase(rctSig)
  const rctPrunable = serializeRctPrunable(rctSig)
  const sigMessage = rctSigHash(prefixHash, rctBase, rctPrunable)

  for (let i = 0; i < inputs.length; i++) {
    // z = inputMask - pseudoMask
    let z = (bytesToNumberLE(inputMasks[i]) - bytesToNumberLE(pseudoMasks[i])) % L
    if (z < BigInt(0)) z += L
    const zBytes = new Uint8Array(numberToBytesLE(z, 32))

    const sig = clsagSign(
      sigMessage,
      rings[i],
      pseudoOuts[i],
      inputPrivKeys[i],
      zBytes,
      realIndices[i],
      keyImages[i],
    )

    tx.rctSignatures.clsags.push(sig)
  }

  // Serialize
  const txBytes = serializeTransaction(tx)
  const txHex = bytesToHex(txBytes)
  const txHash = bytesToHex(keccak_256(txBytes))

  return { tx, txHex, txHash }
}
