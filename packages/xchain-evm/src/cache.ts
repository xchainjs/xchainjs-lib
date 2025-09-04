import { Contract } from 'ethers'
import type { Provider, InterfaceAbi } from 'ethers'
import BigNumber from 'bignumber.js'

// Provider-scoped contract cache using WeakMap for automatic cleanup
const contractCacheByProvider: WeakMap<Provider, Map<string, Contract>> = new WeakMap()
const bigNumberCache = new Map<string, BigNumber>()

/**
 * Get a cached Contract instance or create a new one
 * Uses provider-scoped caching for proper isolation
 */
export function getCachedContract(address: string, abi: InterfaceAbi, provider: Provider): Contract {
  // Get or create the contract cache for this provider
  let providerCache = contractCacheByProvider.get(provider)
  if (!providerCache) {
    providerCache = new Map<string, Contract>()
    contractCacheByProvider.set(provider, providerCache)
  }

  // Use normalized address as key
  const normalizedAddress = address.toLowerCase()

  // Get or create the contract for this address
  let contract = providerCache.get(normalizedAddress)
  if (!contract) {
    contract = new Contract(address, abi, provider)
    providerCache.set(normalizedAddress, contract)
  }

  return contract
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
 * Note: WeakMap-based contract cache will be automatically cleaned up by GC
 */
export function clearCaches(): void {
  // Note: WeakMap doesn't have a clear() method, and that's by design
  // The contract cache will be automatically cleaned up when providers are GC'd
  bigNumberCache.clear()
}
