import { Contract, Provider } from 'ethers'
import BigNumber from 'bignumber.js'

// Global caches for Contract and BigNumber instances
const contractCache = new Map<string, Contract>()
const bigNumberCache = new Map<string, BigNumber>()

/**
 * Get a cached Contract instance or create a new one
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedContract(address: string, abi: any, provider: Provider): Contract {
  // Use address as key (contracts are address-specific anyway)
  const key = address.toLowerCase()
  if (!contractCache.has(key)) {
    contractCache.set(key, new Contract(address, abi, provider))
  }
  return contractCache.get(key)!
}

/**
 * Get a cached BigNumber instance or create a new one
 */
export function getCachedBigNumber(value: string | number): BigNumber {
  const stringValue = value.toString()
  if (!bigNumberCache.has(stringValue)) {
    bigNumberCache.set(stringValue, new BigNumber(stringValue))
  }
  return bigNumberCache.get(stringValue)!
}

/**
 * Clear all caches (useful for testing or memory management)
 */
export function clearCaches(): void {
  contractCache.clear()
  bigNumberCache.clear()
}
