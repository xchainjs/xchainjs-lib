import { Contract, Provider } from 'ethers'
import BigNumber from 'bignumber.js'

// Per-provider contract cache to ensure contracts are properly isolated
// Key format: `${providerNetwork}_${chainId}_${address}`
const contractCache = new Map<string, Contract>()
const bigNumberCache = new Map<string, BigNumber>()

/**
 * Generate a unique cache key for a contract that includes provider context
 */
async function getContractCacheKey(address: string, provider: Provider): Promise<string> {
  try {
    // Get network information from provider to create unique key
    const network = await provider.getNetwork()
    const chainId = network.chainId.toString()
    const networkName = network.name || 'unknown'
    return `${networkName}_${chainId}_${address.toLowerCase()}`
  } catch {
    // Fallback to a provider-specific key if network info unavailable
    // Use provider instance as unique identifier
    const providerIdentity = provider as any
    const connectionUrl = providerIdentity._request?.url || 
                          providerIdentity.connection?.url || 
                          providerIdentity._url || 
                          'unknown'
    const hashedKey = Buffer.from(connectionUrl.toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    return `provider_${hashedKey}_${address.toLowerCase()}`
  }
}

/**
 * Get a cached Contract instance or create a new one
 * Now includes provider/network isolation to prevent cross-network contract reuse
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCachedContract(address: string, abi: any, provider: Provider): Promise<Contract> {
  const key = await getContractCacheKey(address, provider)
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
