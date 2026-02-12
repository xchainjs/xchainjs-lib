// Code example generators for each operation
// These generate copy-paste ready code snippets showing how to use xchainjs

// Escape single quotes in user input to prevent broken code syntax
function escapeForString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

interface ChainConfig {
  packageName: string
  clientImport: string
  paramsImport?: string
  clientInit: string
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  BTC: {
    packageName: '@xchainjs/xchain-bitcoin',
    clientImport: 'Client',
    paramsImport: 'defaultBTCParams',
    clientInit: 'new Client({ ...defaultBTCParams, network: Network.Mainnet, phrase })',
  },
  BCH: {
    packageName: '@xchainjs/xchain-bitcoincash',
    clientImport: 'Client',
    paramsImport: 'defaultBchParams',
    clientInit: 'new Client({ ...defaultBchParams, network: Network.Mainnet, phrase })',
  },
  LTC: {
    packageName: '@xchainjs/xchain-litecoin',
    clientImport: 'Client',
    paramsImport: 'defaultLtcParams',
    clientInit: 'new Client({ ...defaultLtcParams, network: Network.Mainnet, phrase })',
  },
  DOGE: {
    packageName: '@xchainjs/xchain-doge',
    clientImport: 'Client',
    paramsImport: 'defaultDogeParams',
    clientInit: 'new Client({ ...defaultDogeParams, network: Network.Mainnet, phrase })',
  },
  DASH: {
    packageName: '@xchainjs/xchain-dash',
    clientImport: 'Client',
    paramsImport: 'defaultDashParams',
    clientInit: 'new Client({ ...defaultDashParams, network: Network.Mainnet, phrase })',
  },
  ETH: {
    packageName: '@xchainjs/xchain-ethereum',
    clientImport: 'Client',
    paramsImport: 'defaultEthParams',
    clientInit: 'new Client({ ...defaultEthParams, network: Network.Mainnet, phrase })',
  },
  AVAX: {
    packageName: '@xchainjs/xchain-avax',
    clientImport: 'Client',
    paramsImport: 'defaultAvaxParams',
    clientInit: 'new Client({ ...defaultAvaxParams, network: Network.Mainnet, phrase })',
  },
  BSC: {
    packageName: '@xchainjs/xchain-bsc',
    clientImport: 'Client',
    paramsImport: 'defaultBscParams',
    clientInit: 'new Client({ ...defaultBscParams, network: Network.Mainnet, phrase })',
  },
  ARB: {
    packageName: '@xchainjs/xchain-arbitrum',
    clientImport: 'Client',
    paramsImport: 'defaultArbParams',
    clientInit: 'new Client({ ...defaultArbParams, network: Network.Mainnet, phrase })',
  },
  GAIA: {
    packageName: '@xchainjs/xchain-cosmos',
    clientImport: 'Client',
    paramsImport: 'defaultClientConfig',
    clientInit: 'new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })',
  },
  THOR: {
    packageName: '@xchainjs/xchain-thorchain',
    clientImport: 'Client',
    paramsImport: 'defaultClientConfig',
    clientInit: 'new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })',
  },
  MAYA: {
    packageName: '@xchainjs/xchain-mayachain',
    clientImport: 'Client',
    paramsImport: 'defaultClientConfig',
    clientInit: 'new Client({ ...defaultClientConfig, network: Network.Mainnet, phrase })',
  },
  KUJI: {
    packageName: '@xchainjs/xchain-kujira',
    clientImport: 'Client',
    paramsImport: 'defaultKujiParams',
    clientInit: 'new Client({ ...defaultKujiParams, network: Network.Mainnet, phrase })',
  },
  SOL: {
    packageName: '@xchainjs/xchain-solana',
    clientImport: 'Client',
    paramsImport: 'defaultSolanaParams',
    clientInit: 'new Client({ ...defaultSolanaParams, network: Network.Mainnet, phrase })',
  },
  XRD: {
    packageName: '@xchainjs/xchain-radix',
    clientImport: 'Client',
    clientInit: 'new Client({ network: Network.Mainnet, phrase })',
  },
  ADA: {
    packageName: '@xchainjs/xchain-cardano',
    clientImport: 'Client',
    paramsImport: 'defaultAdaParams',
    clientInit: 'new Client({ ...defaultAdaParams, network: Network.Mainnet, phrase })',
  },
  XRP: {
    packageName: '@xchainjs/xchain-ripple',
    clientImport: 'Client',
    paramsImport: 'defaultXRPParams',
    clientInit: 'new Client({ ...defaultXRPParams, network: Network.Mainnet, phrase })',
  },
}

function getChainConfig(chainId: string): ChainConfig {
  return CHAIN_CONFIGS[chainId] || {
    packageName: `@xchainjs/xchain-${chainId.toLowerCase()}`,
    clientImport: 'Client',
    clientInit: `new Client({ network: Network.Mainnet, phrase })`,
  }
}

function generateImports(chainId: string, additionalImports: string[] = []): string {
  const config = getChainConfig(chainId)
  const imports = [config.clientImport]
  if (config.paramsImport) {
    imports.push(config.paramsImport)
  }

  const lines = [
    `import { ${imports.join(', ')} } from '${config.packageName}'`,
    `import { Network } from '@xchainjs/xchain-client'`,
  ]

  if (additionalImports.length > 0) {
    lines.push(`import { ${additionalImports.join(', ')} } from '@xchainjs/xchain-util'`)
  }

  return lines.join('\n')
}

function generateClientSetup(chainId: string): string {
  const config = getChainConfig(chainId)
  return `// Initialize the client
const phrase = 'your twelve word mnemonic phrase here ...'
const client = ${config.clientInit}`
}

export function generateGetAddressCode(chainId: string): string {
  return `${generateImports(chainId)}

${generateClientSetup(chainId)}

// Get the wallet address
const address = await client.getAddressAsync()
console.log('Address:', address)`
}

export function generateGetBalanceCode(chainId: string, address?: string): string {
  const addressParam = address ? `'${escapeForString(address)}'` : 'await client.getAddressAsync()'

  return `${generateImports(chainId, ['baseToAsset', 'assetToString'])}

${generateClientSetup(chainId)}

// Get balances for address
const address = ${addressParam}
const balances = await client.getBalance(address)

// Display balances
balances.forEach(balance => {
  const amount = baseToAsset(balance.amount).amount().toString()
  console.log(\`\${assetToString(balance.asset)}: \${amount}\`)
})`
}

export function generateGetFeesCode(chainId: string): string {
  return `${generateImports(chainId, ['baseToAsset'])}

${generateClientSetup(chainId)}

// Get current network fees
const fees = await client.getFees()

console.log('Average fee:', baseToAsset(fees.average).amount().toString())
console.log('Fast fee:', baseToAsset(fees.fast).amount().toString())
console.log('Fastest fee:', baseToAsset(fees.fastest).amount().toString())`
}

export function generateTransferCode(
  chainId: string,
  recipient: string,
  amount: string,
  memo?: string
): string {
  const memoLine = memo ? `\n  memo: '${escapeForString(memo)}',` : ''

  return `${generateImports(chainId, ['assetAmount', 'assetToBase'])}

${generateClientSetup(chainId)}

// Transfer funds
const txHash = await client.transfer({
  recipient: '${escapeForString(recipient)}',
  amount: assetToBase(assetAmount(${amount})),${memoLine}
})

console.log('Transaction hash:', txHash)

// Get explorer URL
const explorerUrl = client.getExplorerTxUrl(txHash)
console.log('Explorer URL:', explorerUrl)`
}

export function generateValidateAddressCode(chainId: string, address: string): string {
  return `${generateImports(chainId)}

${generateClientSetup(chainId)}

// Validate an address
const address = '${escapeForString(address)}'
const isValid = client.validateAddress(address)

console.log(\`Address \${address} is \${isValid ? 'valid' : 'invalid'}\`)`
}

export function generateGetHistoryCode(chainId: string, address?: string): string {
  const addressParam = address ? `'${escapeForString(address)}'` : 'await client.getAddressAsync()'

  return `${generateImports(chainId, ['baseToAsset', 'assetToString'])}

${generateClientSetup(chainId)}

// Get transaction history
const address = ${addressParam}
const history = await client.getTransactions({ address })

console.log(\`Found \${history.total} transactions\`)

history.txs.forEach(tx => {
  console.log({
    hash: tx.hash,
    type: tx.type,
    asset: assetToString(tx.asset),
    date: tx.date,
    from: tx.from.map(i => i.from),
    to: tx.to.map(o => o.to),
  })
})`
}

export function generateSwapEstimateCode(
  fromChain: string,
  toChain: string,
  amount: string,
  protocol: 'THORChain' | 'MAYAChain' = 'THORChain'
): string {
  const isMAYA = protocol === 'MAYAChain'
  const ammPackage = isMAYA ? '@xchainjs/xchain-mayachain-amm' : '@xchainjs/xchain-thorchain-amm'
  const queryPackage = isMAYA ? '@xchainjs/xchain-mayachain-query' : '@xchainjs/xchain-thorchain-query'
  const AmmClass = isMAYA ? 'MayachainAMM' : 'ThorchainAMM'
  const QueryClass = isMAYA ? 'MayachainQuery' : 'ThorchainQuery'

  return `import { ${AmmClass} } from '${ammPackage}'
import { ${QueryClass} } from '${queryPackage}'
import { Wallet } from '@xchainjs/xchain-wallet'
import { CryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'

// Initialize wallet with your chain clients
const wallet = new Wallet({
  // Add your chain clients here
  // BTC: new BtcClient({ ...defaultBtcParams, phrase }),
  // ETH: new EthClient({ ...defaultEthParams, phrase }),
  // ...
})

// Initialize AMM
const query = new ${QueryClass}()
const amm = new ${AmmClass}(query, wallet)

// Define swap parameters
const fromAsset = assetFromStringEx('${fromChain}.${fromChain}')
const toAsset = assetFromStringEx('${toChain}.${toChain}')
const amount = new CryptoAmount(
  assetToBase(assetAmount(${amount || '1'})),
  fromAsset
)

// Get swap estimate/quote
const quote = await amm.estimateSwap({
  fromAsset,
  destinationAsset: toAsset,
  amount,
  destinationAddress: await wallet.getAddress('${toChain}'),
})

console.log('Expected output:', quote.txEstimate.netOutput.assetAmount.amount().toString())
console.log('Fees:', quote.txEstimate.totalFees.assetAmount.amount().toString())
console.log('Slippage:', quote.txEstimate.slipBasisPoints, 'bps')`
}

export function generateSwapExecuteCode(
  fromChain: string,
  toChain: string,
  amount: string,
  protocol: 'THORChain' | 'MAYAChain' = 'THORChain'
): string {
  const isMAYA = protocol === 'MAYAChain'
  const ammPackage = isMAYA ? '@xchainjs/xchain-mayachain-amm' : '@xchainjs/xchain-thorchain-amm'
  const queryPackage = isMAYA ? '@xchainjs/xchain-mayachain-query' : '@xchainjs/xchain-thorchain-query'
  const AmmClass = isMAYA ? 'MayachainAMM' : 'ThorchainAMM'
  const QueryClass = isMAYA ? 'MayachainQuery' : 'ThorchainQuery'

  return `import { ${AmmClass} } from '${ammPackage}'
import { ${QueryClass} } from '${queryPackage}'
import { Wallet } from '@xchainjs/xchain-wallet'
import { CryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'

// Initialize wallet with your chain clients
const wallet = new Wallet({
  // Add your chain clients here
})

// Initialize AMM
const query = new ${QueryClass}()
const amm = new ${AmmClass}(query, wallet)

// Define swap parameters
const fromAsset = assetFromStringEx('${fromChain}.${fromChain}')
const toAsset = assetFromStringEx('${toChain}.${toChain}')
const amount = new CryptoAmount(
  assetToBase(assetAmount(${amount || '1'})),
  fromAsset
)

// Execute the swap
const txResult = await amm.doSwap({
  fromAsset,
  destinationAsset: toAsset,
  amount,
  destinationAddress: await wallet.getAddress('${toChain}'),
})

console.log('Transaction hash:', txResult.hash)
console.log('Explorer URL:', txResult.url)`
}
