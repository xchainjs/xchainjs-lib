import { type NetworkInfo } from '@emurgo/cardano-serialization-lib-browser'
import { Network } from '@xchainjs/xchain-client'

import { getCardano } from './wasm'

export const getCardanoNetwork = async (network: Network): Promise<NetworkInfo> => {
  const cardanoLib = await getCardano()
  const networkMap: { [key in Network]: NetworkInfo } = {
    [Network.Mainnet]: cardanoLib.NetworkInfo.mainnet(),
    [Network.Stagenet]: cardanoLib.NetworkInfo.mainnet(),
    [Network.Testnet]: cardanoLib.NetworkInfo.testnet_preprod(),
  }
  return networkMap[network]
}
/**
 * Maximum size, in bytes, of a single Cardano transaction metadata text value. Values longer
 * than this must be stored as a list of chunks.
 */
export const MEMO_CHUNK_MAX_BYTES = 64

/**
 * Splits a memo into chunks of at most {@link MEMO_CHUNK_MAX_BYTES} UTF-8 bytes without splitting
 * a multi-byte codepoint across a chunk boundary. The boundary is governed by UTF-8 byte length,
 * not character count, so multi-byte characters are kept whole.
 *
 * @param {string} memo - The memo to split.
 * @returns {string[]} The memo split into <=64-byte chunks. Empty for an empty memo.
 */
export const chunkMemoUtf8 = (memo: string): string[] => {
  const encoder = new TextEncoder()
  const chunks: string[] = []
  let current = ''
  let currentBytes = 0

  // Iterating a string with for...of yields whole codepoints, so a multi-byte character is never
  // split. A single codepoint is at most 4 bytes, so it always fits within a 64-byte chunk.
  for (const codepoint of memo) {
    const size = encoder.encode(codepoint).length
    if (currentBytes + size > MEMO_CHUNK_MAX_BYTES) {
      chunks.push(current)
      current = ''
      currentBytes = 0
    }
    current += codepoint
    currentBytes += size
  }
  if (current.length > 0) chunks.push(current)

  return chunks
}

export const getCardanoPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
      return 'addr'
    case Network.Testnet:
    case Network.Stagenet:
      return 'addr_test'
  }
}
