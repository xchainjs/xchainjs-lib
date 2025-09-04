import { JsonRpcProvider } from 'ethers'
import { getCachedContract } from '../src/cache'
import erc20ABI from '../src/data/erc20.json'

describe('Contract Cache', () => {
  it('should cache contracts separately for different providers', async () => {
    // Create two different providers
    const provider1 = new JsonRpcProvider('https://eth.llamarpc.com')
    const provider2 = new JsonRpcProvider('https://goerli.infura.io/v3/test')

    const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC address

    // Get contracts from both providers
    const contract1 = await getCachedContract(contractAddress, erc20ABI, provider1)
    const contract2 = await getCachedContract(contractAddress, erc20ABI, provider2)

    // Contracts should have different providers
    expect(contract1.runner).toBe(provider1)
    expect(contract2.runner).toBe(provider2)
    expect(contract1).not.toBe(contract2) // Different contract instances

    // Getting the same contract again should return the cached instance
    const contract1Again = await getCachedContract(contractAddress, erc20ABI, provider1)
    expect(contract1).toBe(contract1Again) // Same instance from cache
  })

  it('should cache contracts separately for different addresses on same provider', async () => {
    const provider = new JsonRpcProvider('https://eth.llamarpc.com')

    const address1 = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
    const address2 = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT

    // Get contracts for different addresses
    const contract1 = await getCachedContract(address1, erc20ABI, provider)
    const contract2 = await getCachedContract(address2, erc20ABI, provider)

    // Should be different contract instances
    expect(contract1).not.toBe(contract2)
    expect(contract1.target).toBe(address1)
    expect(contract2.target).toBe(address2)

    // Getting the same contract again should return the cached instance
    const contract1Again = await getCachedContract(address1, erc20ABI, provider)
    expect(contract1).toBe(contract1Again)
  })

  it('should cache contracts separately for different provider instances with same URL', async () => {
    // Create two distinct provider instances using the same URL
    const sameUrl = 'https://eth.llamarpc.com'
    const provider1 = new JsonRpcProvider(sameUrl)
    const provider2 = new JsonRpcProvider(sameUrl)

    const contractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC address

    // Get contracts from both provider instances
    const contract1 = await getCachedContract(contractAddress, erc20ABI, provider1)
    const contract2 = await getCachedContract(contractAddress, erc20ABI, provider2)

    // Contracts should be different instances (cache keys by provider instance, not just URL)
    expect(contract1).not.toBe(contract2)

    // Each contract should be bound to its respective provider
    expect(contract1.runner).toBe(provider1)
    expect(contract2.runner).toBe(provider2)
    expect(contract1.runner).not.toBe(contract2.runner)

    // Calling getCachedContract again with the same provider should return the cached instance
    const contract1Again = await getCachedContract(contractAddress, erc20ABI, provider1)
    const contract2Again = await getCachedContract(contractAddress, erc20ABI, provider2)

    expect(contract1).toBe(contract1Again) // Same instance from cache for provider1
    expect(contract2).toBe(contract2Again) // Same instance from cache for provider2
  })
})
