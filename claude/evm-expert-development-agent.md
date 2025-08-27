# EVM Expert Development Agent

## Overview

This guide provides expert-level insights for developing with XChainJS's EVM (Ethereum Virtual Machine) ecosystem. XChainJS offers comprehensive support for EVM-based blockchains through standardized interfaces, utilities, and data providers.

## EVM Architecture in XChainJS

### Supported EVM Chains

XChainJS supports multiple EVM-compatible networks:

- **Ethereum** (`xchain-ethereum`) - The original EVM blockchain
- **Binance Smart Chain** (`xchain-bsc`) - BSC with BEP-20 tokens  
- **Avalanche** (`xchain-avax`) - Avalanche C-Chain with native AVAX
- **Arbitrum** (`xchain-arbitrum`) - Layer 2 Ethereum scaling solution
- **Base** (`xchain-base`) - Coinbase's Layer 2 Ethereum network

### Core EVM Packages

#### `xchain-evm` - Core EVM Utilities
The foundation package providing shared EVM functionality:

```typescript
import { 
  ClientKeystore, 
  ClientLedger,
  validateAddress,
  getTokenAddress,
  getFee,
  call,
  estimateCall,
  isApproved,
  estimateApprove,
  MAX_APPROVAL 
} from '@xchainjs/xchain-evm'
```

#### `xchain-evm-providers` - Data Providers
Multiple data providers for blockchain interaction:
- **EtherscanProvider**: Block explorer data
- **CovalentProvider**: Multi-chain API data
- **RoutescanProvider**: Alternative explorer data

## EVM Client Architecture

### Base Client Structure

All EVM clients extend the base `EVMClientKeystore` or `EVMClientLedger`:

```typescript
import { ClientKeystore as EVMClientKeystore, EVMClientParams } from '@xchainjs/xchain-evm'

export class EthereumClient extends EVMClientKeystore {
  constructor(config: Omit<EVMClientParams, 'signer'> = defaultEthParams) {
    super({
      ...config,
      signer: config.phrase
        ? new KeystoreSigner({
            phrase: config.phrase,
            provider: config.providers[config.network || Network.Mainnet],
            derivationPath: config.rootDerivationPaths
              ? config.rootDerivationPaths[config.network || Network.Mainnet]
              : '',
          })
        : undefined,
    })
  }
}
```

### Client Configuration

#### Basic Configuration
```typescript
import { Client as EthereumClient } from '@xchainjs/xchain-ethereum'
import { Network } from '@xchainjs/xchain-client'

const client = new EthereumClient({
  network: Network.Mainnet,
  phrase: 'your twelve word mnemonic phrase here',
  providers: {
    mainnet: new JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID'),
    stagenet: new JsonRpcProvider('https://ropsten.infura.io/v3/YOUR-PROJECT-ID'),
    testnet: new JsonRpcProvider('https://goerli.infura.io/v3/YOUR-PROJECT-ID')
  },
  dataProviders: [
    new EtherscanProvider(
      provider,
      'https://api.etherscan.io',
      'YOUR-ETHERSCAN-API-KEY',
      'ETH',
      AssetETH,
      18
    )
  ],
  feeBounds: { lower: 1, upper: 500 }
})
```

#### Advanced Configuration with Custom Providers
```typescript
const client = new EthereumClient({
  network: Network.Mainnet,
  providers: {
    mainnet: new JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY')
  },
  dataProviders: [
    new EtherscanProvider(/* etherscan config */),
    new CovalentProvider(/* covalent config */)
  ],
  explorerProviders: {
    mainnet: new ExplorerProvider(
      'https://etherscan.io/',
      'https://etherscan.io/address/%%ADDRESS%%',
      'https://etherscan.io/tx/%%TX_ID%%'
    )
  },
  rootDerivationPaths: {
    mainnet: "m/44'/60'/0'/0/",
    stagenet: "m/44'/60'/0'/0/",
    testnet: "m/44'/60'/0'/0/"
  }
})
```

## EVM-Specific Operations

### Address Validation
```typescript
import { validateAddress } from '@xchainjs/xchain-evm'

// Validate Ethereum address
const isValid = validateAddress('0x742d35cc6634c0532925a3b8d582c29c12ac9bc2')
console.log(isValid) // true

// Invalid address
const isValidInvalid = validateAddress('invalid-address')
console.log(isValidInvalid) // false
```

### Token Operations

#### Token Address Extraction
```typescript
import { getTokenAddress } from '@xchainjs/xchain-evm'
import { TokenAsset } from '@xchainjs/xchain-util'

const usdtAsset: TokenAsset = {
  chain: 'ETH',
  symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ticker: 'USDT',
  contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
}

const tokenAddress = getTokenAddress(usdtAsset)
console.log(tokenAddress) // '0xdAC17F958D2ee523a2206206994597C13D831ec7'
```

#### Token Approval Management
```typescript
import { isApproved, estimateApprove, MAX_APPROVAL } from '@xchainjs/xchain-evm'
import { baseAmount } from '@xchainjs/xchain-util'

// Check if token is approved for spending
const approved = await isApproved({
  provider: ethereumProvider,
  contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  spenderAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Uniswap Router
  fromAddress: '0x742d35cc6634c0532925a3b8d582c29c12ac9bc2',
  amount: baseAmount('1000000', 6) // 1 USDT
})

// Estimate gas for approval
const gasEstimate = await estimateApprove({
  provider: ethereumProvider,
  contractAddress: tokenContract,
  spenderAddress: routerAddress,
  fromAddress: userAddress,
  abi: erc20ABI,
  amount: baseAmount('1000000', 6) // Or undefined for MAX_APPROVAL
})
```

### Contract Interactions

#### Contract Function Calls
```typescript
import { call, estimateCall } from '@xchainjs/xchain-evm'

// Read-only contract call
const totalSupply = await call<BigNumber>({
  provider: ethereumProvider,
  contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  abi: erc20ABI,
  funcName: 'totalSupply',
  funcParams: []
})

// Write contract call with signer
const transferTx = await call({
  provider: ethereumProvider,
  signer: walletSigner,
  contractAddress: tokenContract,
  abi: erc20ABI,
  funcName: 'transfer',
  funcParams: [recipientAddress, amount]
})

// Estimate gas for contract function
const gasEstimate = await estimateCall({
  provider: ethereumProvider,
  contractAddress: tokenContract,
  abi: erc20ABI,
  funcName: 'transfer',
  funcParams: [recipientAddress, amount]
})
```

### Fee Calculation
```typescript
import { getFee } from '@xchainjs/xchain-evm'
import { baseAmount } from '@xchainjs/xchain-util'

const fee = getFee({
  gasPrice: baseAmount('20000000000', 18), // 20 Gwei
  gasLimit: new BigNumber('21000'),
  decimals: 18
})

console.log(fee.amount().toString()) // Fee in wei
```

## Advanced EVM Patterns

### Multi-Token Balance Checking
```typescript
async function getPortfolioBalances(client: EthereumClient, address: string) {
  // Define tokens to check
  const tokens = [
    { chain: 'ETH', symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7', ticker: 'USDT' },
    { chain: 'ETH', symbol: 'USDC-0xA0b86a33E6441FE68de6F0c9F4b5B4E8E3Ff2d7', ticker: 'USDC' },
    { chain: 'ETH', symbol: 'UNI-0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', ticker: 'UNI' }
  ]

  const balances = await client.getBalance(address, tokens)
  
  return balances.map(balance => ({
    asset: balance.asset,
    amount: balance.amount.amount().toString(),
    formattedAmount: balance.amount.amount().dividedBy(10 ** balance.amount.decimal).toString()
  }))
}
```

### Custom Data Provider Implementation
```typescript
import { EvmOnlineDataProvider, Balance, Tx, TxsPage } from '@xchainjs/xchain-evm-providers'

class CustomEVMProvider implements EvmOnlineDataProvider {
  private apiUrl: string
  private apiKey: string

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }

  async getBalance(address: Address, assets?: CompatibleAsset[]): Promise<Balance[]> {
    // Custom implementation for getting balances
    const response = await fetch(`${this.apiUrl}/balance/${address}?key=${this.apiKey}`)
    const data = await response.json()
    
    return data.balances.map((balance: any) => ({
      asset: balance.asset,
      amount: baseAmount(balance.amount, balance.decimals)
    }))
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    // Custom implementation for transaction history
    // ... implementation details
  }

  async getTransactionData(txId: string, address: Address): Promise<Tx> {
    // Custom implementation for single transaction
    // ... implementation details
  }

  async getFeeRates(): Promise<FeeRates> {
    // Custom implementation for fee rates
    // ... implementation details
  }
}
```

### EVM Transaction Monitoring
```typescript
class EVMTransactionMonitor {
  private client: any
  private provider: Provider

  constructor(client: any, provider: Provider) {
    this.client = client
    this.provider = provider
  }

  async waitForConfirmation(
    txHash: string, 
    requiredConfirmations: number = 1
  ): Promise<TransactionReceipt> {
    let receipt = null
    let confirmations = 0

    while (confirmations < requiredConfirmations) {
      receipt = await this.provider.getTransactionReceipt(txHash)
      
      if (receipt) {
        const currentBlock = await this.provider.getBlockNumber()
        confirmations = currentBlock - receipt.blockNumber + 1
      }

      if (confirmations < requiredConfirmations) {
        await new Promise(resolve => setTimeout(resolve, 15000)) // Wait 15 seconds
      }
    }

    return receipt
  }

  async getTransactionStatus(txHash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    const receipt = await this.provider.getTransactionReceipt(txHash)
    
    if (!receipt) return 'pending'
    if (receipt.status === 1) return 'confirmed'
    return 'failed'
  }
}
```

## EVM-Specific Best Practices

### 1. Gas Optimization
```typescript
// Use gas estimation with buffer
async function estimateGasWithBuffer(contractCall: any): Promise<BigNumber> {
  const estimate = await contractCall.estimateGas()
  return new BigNumber(estimate.toString()).multipliedBy(1.2) // 20% buffer
}

// Implement gas price strategies
async function getDynamicGasPrice(provider: Provider): Promise<BaseAmount> {
  const feeData = await provider.getFeeData()
  const gasPrice = feeData.gasPrice || parseUnits('20', 'gwei')
  return baseAmount(gasPrice.toString(), 18)
}
```

### 2. Token Approval Patterns
```typescript
// Efficient approval management
class TokenApprovalManager {
  async approveIfNeeded(
    tokenContract: string,
    spender: string,
    amount: BaseAmount,
    userAddress: string,
    provider: Provider,
    signer: Signer
  ): Promise<void> {
    const currentAllowance = await this.getAllowance(tokenContract, userAddress, spender, provider)
    
    if (currentAllowance.lt(amount)) {
      // Approve maximum amount to avoid future approvals
      await this.approve(tokenContract, spender, MAX_APPROVAL, signer)
    }
  }

  private async getAllowance(
    tokenContract: string,
    owner: string,
    spender: string,
    provider: Provider
  ): Promise<BigNumber> {
    const approved = await isApproved({
      provider,
      contractAddress: tokenContract,
      spenderAddress: spender,
      fromAddress: owner
    })
    
    // Return actual allowance amount
    const contract = new Contract(tokenContract, erc20ABI, provider)
    const allowance = await contract.allowance(owner, spender)
    return new BigNumber(allowance.toString())
  }
}
```

### 3. Multi-Chain EVM Management
```typescript
class MultiChainEVMManager {
  private clients: Map<string, any> = new Map()

  constructor() {
    this.initializeClients()
  }

  private initializeClients() {
    // Initialize all EVM clients
    this.clients.set('ETH', new EthereumClient({ network: Network.Mainnet }))
    this.clients.set('BSC', new BSCClient({ network: Network.Mainnet }))
    this.clients.set('AVAX', new AvaxClient({ network: Network.Mainnet }))
    this.clients.set('ARB', new ArbitrumClient({ network: Network.Mainnet }))
  }

  async getBalanceAcrossChains(address: string, asset: string): Promise<Map<string, BaseAmount>> {
    const balances = new Map<string, BaseAmount>()

    for (const [chain, client] of this.clients) {
      try {
        const balance = await client.getBalance(address)
        const assetBalance = balance.find((b: any) => b.asset.symbol === asset)
        if (assetBalance) {
          balances.set(chain, assetBalance.amount)
        }
      } catch (error) {
        console.error(`Error getting balance for ${chain}:`, error)
        balances.set(chain, baseAmount(0, 18))
      }
    }

    return balances
  }

  async executeTransactionOnOptimalChain(
    fromAddress: string,
    toAddress: string,
    amount: BaseAmount,
    asset: string
  ): Promise<{ chain: string; txHash: string; fee: BaseAmount }> {
    const fees = new Map<string, BaseAmount>()

    // Get fee estimates from all chains
    for (const [chain, client] of this.clients) {
      try {
        const feeEstimate = await client.getFees()
        fees.set(chain, feeEstimate.fast)
      } catch (error) {
        console.error(`Error getting fees for ${chain}:`, error)
      }
    }

    // Find chain with lowest fees
    let optimalChain = 'ETH'
    let lowestFee = baseAmount(Number.MAX_SAFE_INTEGER, 18)

    for (const [chain, fee] of fees) {
      if (fee.lt(lowestFee)) {
        lowestFee = fee
        optimalChain = chain
      }
    }

    // Execute transaction on optimal chain
    const client = this.clients.get(optimalChain)
    const txHash = await client.transfer({
      asset: { chain: optimalChain, symbol: asset, ticker: asset },
      amount,
      recipient: toAddress
    })

    return { chain: optimalChain, txHash, fee: lowestFee }
  }
}
```

### 4. Error Handling Strategies
```typescript
class EVMErrorHandler {
  static async handleTransactionError(error: any, retryCount: number = 3): Promise<void> {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient balance for transaction')
    }
    
    if (error.code === 'REPLACEMENT_UNDERPRICED') {
      // Increase gas price and retry
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        // Implement retry logic with higher gas price
      } else {
        throw new Error('Transaction replacement failed after retries')
      }
    }
    
    if (error.code === 'NONCE_EXPIRED') {
      // Reset nonce and retry
      if (retryCount > 0) {
        // Implement nonce reset and retry
      } else {
        throw new Error('Nonce issues persist after retries')
      }
    }

    // Network congestion errors
    if (error.message.includes('timeout') || error.code === 'TIMEOUT') {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 10000))
        // Implement retry with exponential backoff
      } else {
        throw new Error('Network timeout after retries')
      }
    }

    throw error
  }
}
```

## Testing EVM Implementations

### Unit Testing with Mocked Providers
```typescript
import { jest } from '@jest/globals'

describe('EVM Client Tests', () => {
  let mockProvider: any
  let client: EthereumClient

  beforeEach(() => {
    mockProvider = {
      getBalance: jest.fn(),
      getTransactionReceipt: jest.fn(),
      getFeeData: jest.fn(),
      getBlockNumber: jest.fn()
    }

    client = new EthereumClient({
      network: Network.Testnet,
      providers: { testnet: mockProvider }
    })
  })

  test('should get native balance', async () => {
    mockProvider.getBalance.mockResolvedValue(parseEther('1.5'))
    
    const balance = await client.getBalance('0x742d35cc6634c0532925a3b8d582c29c12ac9bc2')
    
    expect(balance[0].amount.amount().toString()).toBe('1500000000000000000')
  })

  test('should estimate fees correctly', async () => {
    mockProvider.getFeeData.mockResolvedValue({
      gasPrice: parseUnits('20', 'gwei'),
      maxFeePerGas: parseUnits('30', 'gwei'),
      maxPriorityFeePerGas: parseUnits('2', 'gwei')
    })

    const fees = await client.getFees()
    
    expect(fees.fast).toBeDefined()
    expect(fees.average).toBeDefined()
    expect(fees.fastest).toBeDefined()
  })
})
```

### Integration Testing
```typescript
describe('EVM Integration Tests', () => {
  test('should perform full token transfer flow', async () => {
    const client = new EthereumClient({
      network: Network.Testnet,
      phrase: process.env.TEST_PHRASE
    })

    // 1. Check initial balance
    const initialBalance = await client.getBalance(testAddress)
    
    // 2. Estimate fees
    const fees = await client.getFees()
    
    // 3. Execute transfer
    const txHash = await client.transfer({
      asset: testToken,
      amount: baseAmount('1000000', 6), // 1 USDT
      recipient: recipientAddress
    })
    
    // 4. Wait for confirmation
    const receipt = await monitor.waitForConfirmation(txHash, 2)
    
    // 5. Verify final balance
    const finalBalance = await client.getBalance(testAddress)
    
    expect(receipt.status).toBe(1)
    expect(finalBalance[0].amount.lt(initialBalance[0].amount)).toBe(true)
  })
})
```

## Performance Optimization

### Connection Pooling
```typescript
class EVMConnectionPool {
  private providers: Map<string, Provider[]> = new Map()
  private currentIndex: Map<string, number> = new Map()

  constructor(configs: { [chain: string]: string[] }) {
    for (const [chain, urls] of Object.entries(configs)) {
      this.providers.set(
        chain,
        urls.map(url => new JsonRpcProvider(url))
      )
      this.currentIndex.set(chain, 0)
    }
  }

  getProvider(chain: string): Provider {
    const providers = this.providers.get(chain)
    if (!providers || providers.length === 0) {
      throw new Error(`No providers available for chain ${chain}`)
    }

    const currentIndex = this.currentIndex.get(chain) || 0
    const provider = providers[currentIndex]
    
    // Round-robin load balancing
    this.currentIndex.set(chain, (currentIndex + 1) % providers.length)
    
    return provider
  }
}
```

### Caching Strategies
```typescript
class EVMDataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Cache token metadata
  async getTokenMetadata(contractAddress: string, provider: Provider): Promise<any> {
    const cacheKey = `token-metadata-${contractAddress}`
    const cached = this.get(cacheKey)
    if (cached) return cached

    const contract = new Contract(contractAddress, erc20ABI, provider)
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ])

    const metadata = { name, symbol, decimals }
    this.set(cacheKey, metadata, 3600000) // Cache for 1 hour

    return metadata
  }
}
```

## Troubleshooting Common EVM Issues

### 1. Gas-Related Issues
- **Underpriced Transaction**: Increase gas price during network congestion
- **Out of Gas**: Increase gas limit for complex contract interactions
- **Gas Estimation Failures**: Use manual gas limits with buffer

### 2. Provider Issues
- **Rate Limiting**: Implement exponential backoff and request queuing
- **Network Timeouts**: Use multiple providers with failover
- **Invalid Responses**: Validate provider responses before processing

### 3. Token Issues
- **Invalid Contract Address**: Validate contract addresses before interaction
- **Insufficient Allowance**: Check and handle approval requirements
- **Non-Standard Tokens**: Implement fallbacks for non-ERC20 compliant tokens

### 4. Network-Specific Issues
- **MEV Protection**: Use private mempools for sensitive transactions
- **Front-running**: Implement commit-reveal schemes where necessary
- **Chain Reorganizations**: Wait for sufficient confirmations

## Migration and Deployment

### Environment Configuration
```typescript
// config/evm.ts
export const evmConfig = {
  ethereum: {
    mainnet: {
      rpcUrl: process.env.ETH_MAINNET_RPC || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      etherscanApiKey: process.env.ETHERSCAN_API_KEY,
      explorerUrl: 'https://etherscan.io'
    },
    testnet: {
      rpcUrl: process.env.ETH_TESTNET_RPC || 'https://goerli.infura.io/v3/YOUR-PROJECT-ID',
      etherscanApiKey: process.env.ETHERSCAN_API_KEY,
      explorerUrl: 'https://goerli.etherscan.io'
    }
  },
  // ... other chains
}
```

### Production Deployment Checklist
- [ ] Configure rate-limited, reliable RPC endpoints
- [ ] Set up monitoring and alerting for failed transactions
- [ ] Implement circuit breakers for provider failures
- [ ] Use environment-specific configurations
- [ ] Set up transaction replay protection
- [ ] Configure proper gas price strategies
- [ ] Implement comprehensive error logging

This guide provides the foundation for expert-level EVM development with XChainJS. The modular architecture allows for easy extension and customization while maintaining consistency across different EVM-compatible networks.