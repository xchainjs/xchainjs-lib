/**
 * Decoy output selection for Monero ring signatures.
 * Uses gamma distribution (shape=19.28, scale=1/1.61) matching Monero's wallet2.
 *
 * Reference: monero/src/wallet/wallet2.cpp (get_outs)
 */

const RING_SIZE = 16
const GAMMA_SHAPE = 19.28
const GAMMA_RATE = 1.61 // scale = 1/rate

/**
 * Generate a cryptographically secure random float in [0, 1).
 */
function secureRandom(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 0x100000000
}

/**
 * Sample from gamma distribution using Marsaglia & Tsang's method.
 * Uses crypto.getRandomValues() for privacy-safe randomness.
 */
function sampleGamma(shape: number, rate: number): number {
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  while (true) {
    let x: number
    let v: number
    do {
      // Box-Muller for standard normal
      const u1 = secureRandom()
      const u2 = secureRandom()
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      v = Math.pow(1 + c * x, 3)
    } while (v <= 0)

    const u = secureRandom()
    if (u < 1 - 0.0331 * Math.pow(x, 4) || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return (d * v) / rate
    }
  }
}

/**
 * Select decoy global output indices for ring signature construction.
 *
 * @param realGlobalIndex - Global output index of the real input
 * @param numOutputs - Total number of outputs on chain
 * @param newestHeight - Current blockchain height
 * @param outputDistribution - Cumulative output distribution per block
 * @param distStartHeight - Start height of distribution data
 * @returns Array of RING_SIZE - 1 decoy global indices (excluding the real one)
 */
export function selectDecoys(
  realGlobalIndex: number,
  numOutputs: number,
  newestHeight: number,
  outputDistribution: number[],
  distStartHeight: number,
): number[] {
  const decoys: Set<number> = new Set()
  const maxIndex = numOutputs - 1

  let attempts = 0
  while (decoys.size < RING_SIZE - 1 && attempts < 1000) {
    attempts++

    // Sample from gamma distribution
    let blockOffset = Math.floor(sampleGamma(GAMMA_SHAPE, GAMMA_RATE))

    // Map to a block height (counting from the newest block backwards)
    let blockHeight = newestHeight - blockOffset

    // Ensure within valid range
    if (blockHeight < distStartHeight) blockHeight = distStartHeight
    if (blockHeight >= distStartHeight + outputDistribution.length) {
      blockHeight = distStartHeight + outputDistribution.length - 1
    }

    // Get output range for this block
    const distIdx = blockHeight - distStartHeight
    const blockStart = distIdx > 0 ? outputDistribution[distIdx - 1] : 0
    const blockEnd = outputDistribution[distIdx]

    if (blockEnd <= blockStart) continue // empty block

    // Pick random output within this block
    const outputIdx = blockStart + Math.floor(secureRandom() * (blockEnd - blockStart))

    if (outputIdx > maxIndex) continue
    if (outputIdx === realGlobalIndex) continue
    if (decoys.has(outputIdx)) continue

    decoys.add(outputIdx)
  }

  // If we couldn't get enough decoys from gamma sampling, fill randomly
  let fallbackAttempts = 0
  while (decoys.size < RING_SIZE - 1 && fallbackAttempts < 10000) {
    fallbackAttempts++
    const idx = Math.floor(secureRandom() * (maxIndex + 1))
    if (idx !== realGlobalIndex && !decoys.has(idx)) {
      decoys.add(idx)
    }
  }

  if (decoys.size < RING_SIZE - 1) {
    throw new Error(`Insufficient decoys: need ${RING_SIZE - 1}, got ${decoys.size} from ${maxIndex + 1} outputs`)
  }

  return Array.from(decoys).sort((a, b) => a - b)
}

/**
 * Build sorted ring with real index.
 * Returns the ring indices (sorted) and the position of the real input.
 */
export function buildRingIndices(realGlobalIndex: number, decoys: number[]): { indices: number[]; realIndex: number } {
  const all = [...decoys, realGlobalIndex].sort((a, b) => a - b)
  const realIndex = all.indexOf(realGlobalIndex)
  return { indices: all, realIndex }
}

/**
 * Convert absolute global indices to relative offsets (as stored in tx).
 */
export function toRelativeOffsets(sortedIndices: number[]): bigint[] {
  const offsets: bigint[] = [BigInt(sortedIndices[0])]
  for (let i = 1; i < sortedIndices.length; i++) {
    offsets.push(BigInt(sortedIndices[i] - sortedIndices[i - 1]))
  }
  return offsets
}
