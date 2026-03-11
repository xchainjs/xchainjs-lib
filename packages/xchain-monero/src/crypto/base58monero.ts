/**
 * Monero's custom base58 encoding.
 * Unlike Bitcoin's base58, Monero encodes in fixed 8-byte blocks → 11-char blocks.
 * The last block may be shorter depending on remaining bytes.
 */

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/** Number of base58 chars needed to encode N bytes (for N = 0..8) */
const ENCODED_BLOCK_SIZES = [0, 2, 3, 5, 6, 7, 9, 10, 11]

const FULL_BLOCK_SIZE = 8
const FULL_ENCODED_BLOCK_SIZE = 11

/**
 * Encodes a block of bytes (up to 8) into base58 characters.
 */
function encodeBlock(data: Uint8Array): string {
  if (data.length === 0) return ''

  const size = ENCODED_BLOCK_SIZES[data.length]

  // Convert bytes to a big number (big-endian)
  let num = BigInt(0)
  for (let i = 0; i < data.length; i++) {
    num = (num << BigInt(8)) | BigInt(data[i])
  }

  // Convert to base58 with fixed-width output
  const chars: string[] = new Array(size)
  for (let i = size - 1; i >= 0; i--) {
    chars[i] = ALPHABET[Number(num % BigInt(58))]
    num = num / BigInt(58)
  }

  return chars.join('')
}

/**
 * Decodes a base58-encoded block back to bytes.
 */
function decodeBlock(encoded: string, targetLen: number): Uint8Array {
  if (encoded.length === 0) return new Uint8Array(0)

  // Convert base58 string to number
  let num = BigInt(0)
  for (let i = 0; i < encoded.length; i++) {
    const idx = ALPHABET.indexOf(encoded[i])
    if (idx === -1) throw new Error(`Invalid base58 character: ${encoded[i]}`)
    num = num * BigInt(58) + BigInt(idx)
  }

  // Convert number to bytes (big-endian, fixed width)
  const result = new Uint8Array(targetLen)
  for (let i = targetLen - 1; i >= 0; i--) {
    result[i] = Number(num & BigInt(0xff))
    num = num >> BigInt(8)
  }

  return result
}

/**
 * Encodes a Uint8Array using Monero's base58 scheme.
 */
export const cnBase58Encode = (data: Uint8Array): string => {
  const fullBlocks = Math.floor(data.length / FULL_BLOCK_SIZE)
  const lastBlockSize = data.length % FULL_BLOCK_SIZE

  let result = ''

  for (let i = 0; i < fullBlocks; i++) {
    const block = data.slice(i * FULL_BLOCK_SIZE, (i + 1) * FULL_BLOCK_SIZE)
    result += encodeBlock(block)
  }

  if (lastBlockSize > 0) {
    const lastBlock = data.slice(fullBlocks * FULL_BLOCK_SIZE)
    result += encodeBlock(lastBlock)
  }

  return result
}

/**
 * Decodes a Monero base58-encoded string to Uint8Array.
 */
export const cnBase58Decode = (encoded: string): Uint8Array => {
  // Figure out how many full encoded blocks and the remainder
  const fullBlocks = Math.floor(encoded.length / FULL_ENCODED_BLOCK_SIZE)
  const lastEncodedSize = encoded.length % FULL_ENCODED_BLOCK_SIZE

  // Find the byte length of the last block
  let lastBlockSize = 0
  if (lastEncodedSize > 0) {
    lastBlockSize = ENCODED_BLOCK_SIZES.indexOf(lastEncodedSize)
    if (lastBlockSize === -1) throw new Error(`Invalid encoded length: ${encoded.length}`)
  }

  const totalBytes = fullBlocks * FULL_BLOCK_SIZE + lastBlockSize
  const result = new Uint8Array(totalBytes)

  let offset = 0
  let encodedOffset = 0

  for (let i = 0; i < fullBlocks; i++) {
    const block = encoded.slice(encodedOffset, encodedOffset + FULL_ENCODED_BLOCK_SIZE)
    const decoded = decodeBlock(block, FULL_BLOCK_SIZE)
    result.set(decoded, offset)
    offset += FULL_BLOCK_SIZE
    encodedOffset += FULL_ENCODED_BLOCK_SIZE
  }

  if (lastEncodedSize > 0) {
    const lastEncoded = encoded.slice(encodedOffset)
    const decoded = decodeBlock(lastEncoded, lastBlockSize)
    result.set(decoded, offset)
  }

  return result
}
