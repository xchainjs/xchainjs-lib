import { Contract } from 'ethers'
import type { Provider, InterfaceAbi } from 'ethers'
import BigNumber from 'bignumber.js'

// Per-provider contract cache to ensure contracts are properly isolated
// Key format: `${networkName}_${chainId}_${providerInstanceId}_${address}`
const contractCache = new Map<string, Contract>()
const bigNumberCache = new Map<string, BigNumber>()

/**
 * Generate a unique cache key for a contract that includes provider context
 */
async function getContractCacheKey(address: string, provider: Provider): Promise<string> {
  // Use provider instance reference as unique identifier to ensure
  // different provider instances are cached separately even if they
  // point to the same network
  const providerInstanceId = (provider as any)[Symbol.for('cache_instance_id')] || 
    (() => {
      const id = Math.random().toString(36).substring(2, 15);
      (provider as any)[Symbol.for('cache_instance_id')] = id;
      return id;
    })();

  try {
    // Get network information from provider to create unique key
    const network = await provider.getNetwork()
    const chainId = network.chainId.toString()
    const networkName = network.name || 'unknown'
    return `${networkName}_${chainId}_${providerInstanceId}_${address.toLowerCase()}`
  } catch {
    // Fallback to a provider-specific key if network info unavailable
    // Use safe runtime checks for public properties only
    const providerUnknown = provider as unknown
    let connectionUrl = 'unknown'
    
    // Check for public connection property with url
    if (typeof providerUnknown === 'object' && providerUnknown !== null &&
        'connection' in providerUnknown && 
        typeof (providerUnknown as any).connection?.url === 'string') {
      connectionUrl = (providerUnknown as any).connection.url
    }
    // Check for public url property
    else if (typeof providerUnknown === 'object' && providerUnknown !== null &&
             'url' in providerUnknown && 
             typeof (providerUnknown as any).url === 'string') {
      connectionUrl = (providerUnknown as any).url
    }
    
    const hashedKey = Buffer.from(connectionUrl.toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    return `provider_${hashedKey}_${providerInstanceId}_${address.toLowerCase()}`
  }
}

/**
 * Get a cached Contract instance or create a new one
 * Now includes provider/network isolation to prevent cross-network contract reuse
 */
export async function getCachedContract(address: string, abi: InterfaceAbi, provider: Provider): Promise<Contract> {
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
