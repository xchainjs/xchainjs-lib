/**
 * Daemon-based blockchain scanner for Monero.
 * Scans blocks using the view key to find owned outputs and detect spent outputs.
 * Used as fallback when no LWS (Light Wallet Server) is available.
 *
 * This is intentionally slow — scanning the full chain from genesis is impractical.
 * Use a restore height close to when the wallet was created.
 */

import { ed25519 } from '@noble/curves/ed25519'
import { bytesToNumberLE } from '@noble/curves/abstract/utils'

import * as daemon from './daemon'
import { isOutputForUs } from './crypto/stealth'
import { decryptAmount, computeViewTag } from './crypto/ecdh'
import { generateKeyImage } from './crypto/keyImage'
import { deriveInputKey } from './crypto/stealth'
import { hexToBytes, bytesToHex } from './utils'

const ExtPoint = ed25519.ExtendedPoint

export interface OwnedOutput {
  txHash: string
  outputIndex: number
  amount: bigint
  globalIndex: number
  publicKey: Uint8Array
  txPubKey: Uint8Array
  keyImage: string
  height: number
  timestamp: number
}

export interface ScanState {
  /** Last fully scanned block height */
  lastHeight: number
  /** Owned unspent outputs */
  ownedOutputs: OwnedOutput[]
  /** Set of spent key images */
  spentKeyImages: Set<string>
}

/**
 * Parse tx public key from the extra field of a decoded Monero transaction.
 * The extra field is an array of bytes; tag 0x01 followed by 32 bytes is the tx pub key.
 */
function parseTxPubKey(extraBytes: number[]): Uint8Array | null {
  for (let i = 0; i < extraBytes.length; i++) {
    if (extraBytes[i] === 0x01 && i + 32 < extraBytes.length) {
      return new Uint8Array(extraBytes.slice(i + 1, i + 33))
    }
    // Tag 0x02 = nonce, skip its length
    if (extraBytes[i] === 0x02 && i + 1 < extraBytes.length) {
      i += extraBytes[i + 1] + 1
    }
  }
  return null
}

/**
 * Compute the ECDH shared secret for amount decryption: a*R (view key * tx pub key).
 * Returns compressed point bytes.
 */
function computeSharedSecret(privViewKey: Uint8Array, txPubKey: Uint8Array): Uint8Array {
  const a = bytesToNumberLE(privViewKey)
  const R = ExtPoint.fromHex(txPubKey)
  // Monero's generate_key_derivation: derivation = 8 * a * R (cofactor multiplication)
  return R.multiply(a).multiply(BigInt(8)).toRawBytes()
}


interface ScanProgress {
  currentHeight: number
  totalHeight: number
  outputsFound: number
}

interface ParsedTxJson {
  extra?: number[]
  vout?: { amount: number; target: { tagged_key?: { key: string; view_tag?: string }; key?: string } }[]
  rct_signatures?: { ecdhInfo?: { amount: string }[]; outPk?: string[] }
  vin?: { key?: { key_image: string; k_image: string } }[]
}

/**
 * Process decoded transactions to find owned outputs and spent key images.
 */
function processTransactions(
  decodedTxs: daemon.DecodedTxEntry[],
  privViewKey: Uint8Array,
  pubSpendKey: Uint8Array,
  privSpendKey: Uint8Array,
  heightTimestampMap: Map<string, { height: number; timestamp: number }>,
): { ownedOutputs: OwnedOutput[]; spentKeyImages: Set<string> } {
  const ownedOutputs: OwnedOutput[] = []
  const spentKeyImages = new Set<string>()

  for (const txEntry of decodedTxs) {
    let txJson: ParsedTxJson
    try {
      txJson = JSON.parse(txEntry.as_json)
    } catch {
      continue
    }

    // Collect spent key images from inputs
    if (txJson.vin) {
      for (const input of txJson.vin) {
        const ki = input.key?.key_image || input.key?.k_image
        if (ki) spentKeyImages.add(ki)
      }
    }

    if (!txJson.extra || !txJson.vout) continue

    const txPubKey = parseTxPubKey(txJson.extra)
    if (!txPubKey) continue

    const sharedSecret = computeSharedSecret(privViewKey, txPubKey)
    const meta = heightTimestampMap.get(txEntry.tx_hash) ?? { height: txEntry.block_height, timestamp: txEntry.block_timestamp }

    for (let i = 0; i < txJson.vout.length; i++) {
      const out = txJson.vout[i]
      const outputKeyHex = out.target.tagged_key?.key ?? out.target.key
      if (!outputKeyHex) continue

      // View tag optimization: skip EC math if view tag doesn't match
      const viewTag = out.target.tagged_key?.view_tag
      if (viewTag !== undefined) {
        const expected = computeViewTag(sharedSecret, i)
        if (expected !== parseInt(viewTag, 16)) continue
      }

      const outputKey = hexToBytes(outputKeyHex)

      try {
        if (!isOutputForUs(txPubKey, privViewKey, pubSpendKey, outputKey, i)) continue
      } catch {
        continue
      }

      // Decrypt amount from RingCT ecdhInfo
      let amount = BigInt(0)
      if (txJson.rct_signatures?.ecdhInfo?.[i]) {
        const encryptedHex = txJson.rct_signatures.ecdhInfo[i].amount
        const encrypted = hexToBytes(encryptedHex)
        try {
          amount = decryptAmount(encrypted, sharedSecret, i)
        } catch {
          continue
        }
      }

      // Compute key image for spent detection
      const oneTimePrivKey = deriveInputKey(txPubKey, privViewKey, privSpendKey, i)
      const keyImage = bytesToHex(generateKeyImage(oneTimePrivKey, outputKey))

      ownedOutputs.push({
        txHash: txEntry.tx_hash,
        outputIndex: i,
        amount,
        globalIndex: 0,
        publicKey: outputKey,
        txPubKey,
        keyImage,
        height: meta.height,
        timestamp: meta.timestamp,
      })
    }
  }

  return { ownedOutputs, spentKeyImages }
}

/**
 * Scan a range of blocks for owned outputs.
 * Uses batched RPC calls: fetches block tx hashes in parallel, then
 * fetches all transactions in a single get_transactions call per batch.
 */
export async function scanBlocks(
  daemonUrl: string,
  privViewKey: Uint8Array,
  pubSpendKey: Uint8Array,
  privSpendKey: Uint8Array,
  fromHeight: number,
  toHeight: number,
  onProgress?: (progress: ScanProgress) => void,
): Promise<{ ownedOutputs: OwnedOutput[]; spentKeyImages: Set<string> }> {
  const allOwnedOutputs: OwnedOutput[] = []
  const allSpentKeyImages = new Set<string>()

  // Step 1: Fetch all block headers in one RPC call to find blocks with txs
  const HEADER_BATCH = 500
  const blocksWithTxs: { height: number; timestamp: number }[] = []

  for (let h = fromHeight; h <= toHeight; h += HEADER_BATCH) {
    const rangeEnd = Math.min(h + HEADER_BATCH - 1, toHeight)
    try {
      const headers = await daemon.getBlockHeadersRange(daemonUrl, h, rangeEnd)
      for (const hdr of headers) {
        if (hdr.num_txes > 0) {
          blocksWithTxs.push({ height: hdr.height, timestamp: hdr.timestamp })
        }
      }
    } catch (err) {
      console.error(`[XMR scanner] getBlockHeadersRange failed for ${h}-${rangeEnd}:`, (err as Error).message)
    }
  }

  console.log(`[XMR scanner] ${blocksWithTxs.length} blocks with transactions out of ${toHeight - fromHeight + 1} total`)

  // Step 2: For each block with txs, fetch tx hashes sequentially
  const allTxHashes: string[] = []
  const heightMap = new Map<string, { height: number; timestamp: number }>()

  for (const block of blocksWithTxs) {
    try {
      const result = await daemon.getBlockTxHashes(daemonUrl, block.height)
      for (const txHash of result.txHashes) {
        allTxHashes.push(txHash)
        heightMap.set(txHash, { height: block.height, timestamp: block.timestamp })
      }
    } catch (err) {
      console.warn(`[XMR scanner] getBlockTxHashes failed for height ${block.height}:`, (err as Error).message)
    }
  }

  console.log(`[XMR scanner] collected ${allTxHashes.length} tx hashes from ${blocksWithTxs.length} blocks`)

  // Step 3: Fetch and process transactions in small batches (process-as-you-go to limit memory)
  const TX_BATCH = 25
  let processedTxs = 0

  console.log(`[XMR scanner] processing ${allTxHashes.length} txs in batches of ${TX_BATCH}...`)

  for (let t = 0; t < allTxHashes.length; t += TX_BATCH) {
    const slice = allTxHashes.slice(t, t + TX_BATCH)
    try {
      const decodedTxs = await daemon.getTransactionsDecoded(daemonUrl, slice)
      const result = processTransactions(decodedTxs, privViewKey, pubSpendKey, privSpendKey, heightMap)
      allOwnedOutputs.push(...result.ownedOutputs)
      for (const ki of result.spentKeyImages) allSpentKeyImages.add(ki)
      processedTxs += decodedTxs.length
    } catch (err) {
      console.error(`[XMR scanner] getTransactionsDecoded failed (batch ${t}):`, (err as Error).message)
    }

    if (onProgress) {
      const progress = Math.min(t + TX_BATCH, allTxHashes.length) / allTxHashes.length
      onProgress({ currentHeight: fromHeight + Math.floor(progress * (toHeight - fromHeight)), totalHeight: toHeight, outputsFound: allOwnedOutputs.length })
    }
  }

  console.log(`[XMR scanner] processed ${processedTxs} txs, found ${allOwnedOutputs.length} owned outputs`)

  return { ownedOutputs: allOwnedOutputs, spentKeyImages: allSpentKeyImages }
}

/**
 * Compute balance from scan results.
 * Balance = sum of owned outputs whose key images are NOT in the spent set.
 */
export function computeBalance(ownedOutputs: OwnedOutput[], spentKeyImages: Set<string>): bigint {
  let balance = BigInt(0)
  for (const out of ownedOutputs) {
    if (!spentKeyImages.has(out.keyImage)) {
      balance += out.amount
    }
  }
  return balance
}

/**
 * Get unspent outputs from scan results.
 */
export function getUnspentOutputs(ownedOutputs: OwnedOutput[], spentKeyImages: Set<string>): OwnedOutput[] {
  return ownedOutputs.filter((out) => !spentKeyImages.has(out.keyImage))
}
