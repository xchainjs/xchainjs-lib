import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import type { XChainClient } from '@xchainjs/xchain-client'
import { EtherscanProviderV2 } from '@xchainjs/xchain-evm-providers'
import { AssetType } from '@xchainjs/xchain-util'
import { JsonRpcProvider } from 'ethers'
import BigNumber from 'bignumber.js'

// UTXO Chains
import { Client as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as ZecClient, defaultZECParams, AssetZEC, ZEC_DECIMAL, zcashExplorerProviders } from '@xchainjs/xchain-zcash'
import { NownodesProvider } from '@xchainjs/xchain-utxo-providers'

// EVM Chains - import only the Client classes, not the default params (they trigger broken module-level code)
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as AvaxClient } from '@xchainjs/xchain-avax'
import { Client as BscClient } from '@xchainjs/xchain-bsc'
import { Client as ArbClient, defaultArbParams } from '@xchainjs/xchain-arbitrum'

// Lazy creation of AVAX config to avoid module-level provider instantiation with undefined env vars
function createAvaxParams(network: Network, phrase: string) {
  const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || ''

  // Create providers lazily
  const mainnetProvider = new JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc', { name: 'avalanche', chainId: 43114 })
  const testnetProvider = new JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc', { name: 'fuji', chainId: 43113 })

  const AssetAVAX = { chain: 'AVAX' as const, symbol: 'AVAX', ticker: 'AVAX', type: AssetType.NATIVE as const }

  const providers = {
    [Network.Mainnet]: mainnetProvider,
    [Network.Testnet]: testnetProvider,
    [Network.Stagenet]: mainnetProvider,
  }

  const explorerProviders = {
    [Network.Mainnet]: new ExplorerProvider('https://snowtrace.dev/', 'https://snowtrace.dev/address/%%ADDRESS%%', 'https://snowtrace.dev/tx/%%TX_ID%%'),
    [Network.Testnet]: new ExplorerProvider('https://testnet.snowtrace.dev/', 'https://testnet.snowtrace.dev/address/%%ADDRESS%%', 'https://testnet.snowtrace.dev/tx/%%TX_ID%%'),
    [Network.Stagenet]: new ExplorerProvider('https://snowtrace.dev/', 'https://snowtrace.dev/address/%%ADDRESS%%', 'https://snowtrace.dev/tx/%%TX_ID%%'),
  }

  const dataProviders = [{
    [Network.Mainnet]: new EtherscanProviderV2(mainnetProvider, 'https://api.etherscan.io/v2', etherscanApiKey, 'AVAX', AssetAVAX, 18, 43114),
    [Network.Testnet]: new EtherscanProviderV2(testnetProvider, 'https://api.etherscan.io/v2', etherscanApiKey, 'AVAX', AssetAVAX, 18, 43113),
    [Network.Stagenet]: new EtherscanProviderV2(mainnetProvider, 'https://api.etherscan.io/v2', etherscanApiKey, 'AVAX', AssetAVAX, 18, 43114),
  }]

  const defaults = {
    [Network.Mainnet]: { approveGasLimit: new BigNumber(200000), transferGasAssetGasLimit: new BigNumber(23000), transferTokenGasLimit: new BigNumber(100000), gasPrice: new BigNumber(30 * 10 ** 9) },
    [Network.Testnet]: { approveGasLimit: new BigNumber(200000), transferGasAssetGasLimit: new BigNumber(23000), transferTokenGasLimit: new BigNumber(100000), gasPrice: new BigNumber(30 * 10 ** 9) },
    [Network.Stagenet]: { approveGasLimit: new BigNumber(200000), transferGasAssetGasLimit: new BigNumber(23000), transferTokenGasLimit: new BigNumber(100000), gasPrice: new BigNumber(30 * 10 ** 9) },
  }

  return {
    chain: 'AVAX' as const,
    gasAsset: AssetAVAX,
    gasAssetDecimals: 18,
    defaults,
    providers,
    explorerProviders,
    dataProviders,
    network,
    phrase,
    feeBounds: { lower: 1_000_000, upper: 1_000_000_000_000 },
    rootDerivationPaths: { [Network.Mainnet]: "m/44'/60'/0'/0/", [Network.Testnet]: "m/44'/60'/0'/0/", [Network.Stagenet]: "m/44'/60'/0'/0/" },
  }
}

// Lazy creation of BSC config to avoid module-level provider instantiation with undefined env vars
function createBscParams(network: Network, phrase: string) {
  const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || ''

  // Create providers lazily
  const mainnetProvider = new JsonRpcProvider('https://bsc-dataseed.binance.org', { name: 'bsc', chainId: 56 })
  const testnetProvider = new JsonRpcProvider('https://bsc-testnet.public.blastapi.io', { name: 'bsc-testnet', chainId: 97 })

  const AssetBSC = { chain: 'BSC' as const, symbol: 'BNB', ticker: 'BNB', type: AssetType.NATIVE as const }

  const providers = {
    [Network.Mainnet]: mainnetProvider,
    [Network.Testnet]: testnetProvider,
    [Network.Stagenet]: mainnetProvider,
  }

  const explorerProviders = {
    [Network.Mainnet]: new ExplorerProvider('https://bscscan.com/', 'https://bscscan.com/address/%%ADDRESS%%', 'https://bscscan.com/tx/%%TX_ID%%'),
    [Network.Testnet]: new ExplorerProvider('https://testnet.bscscan.com/', 'https://testnet.bscscan.com/address/%%ADDRESS%%', 'https://testnet.bscscan.com/tx/%%TX_ID%%'),
    [Network.Stagenet]: new ExplorerProvider('https://bscscan.com/', 'https://bscscan.com/address/%%ADDRESS%%', 'https://bscscan.com/tx/%%TX_ID%%'),
  }

  const dataProviders = [{
    [Network.Mainnet]: new EtherscanProviderV2(mainnetProvider, 'https://api.etherscan.io/v2', etherscanApiKey, 'BSC', AssetBSC, 18, 56),
    [Network.Testnet]: new EtherscanProviderV2(testnetProvider, 'https://api.etherscan.io/v2', etherscanApiKey, 'BSC', AssetBSC, 18, 97),
    [Network.Stagenet]: new EtherscanProviderV2(mainnetProvider, 'https://api.etherscan.io/v2', etherscanApiKey, 'BSC', AssetBSC, 18, 56),
  }]

  const defaults = {
    [Network.Mainnet]: { approveGasLimit: new BigNumber(200000), transferGasAssetGasLimit: new BigNumber(23000), transferTokenGasLimit: new BigNumber(100000), gasPrice: new BigNumber(30 * 10 ** 9) },
    [Network.Testnet]: { approveGasLimit: new BigNumber(200000), transferGasAssetGasLimit: new BigNumber(23000), transferTokenGasLimit: new BigNumber(100000), gasPrice: new BigNumber(30 * 10 ** 9) },
    [Network.Stagenet]: { approveGasLimit: new BigNumber(200000), transferGasAssetGasLimit: new BigNumber(23000), transferTokenGasLimit: new BigNumber(100000), gasPrice: new BigNumber(30 * 10 ** 9) },
  }

  return {
    chain: 'BSC' as const,
    gasAsset: AssetBSC,
    gasAssetDecimals: 18,
    defaults,
    providers,
    explorerProviders,
    dataProviders,
    network,
    phrase,
    feeBounds: { lower: 1_000_000, upper: 1_000_000_000_000 },
    rootDerivationPaths: { [Network.Mainnet]: "m/44'/60'/0'/0/", [Network.Testnet]: "m/44'/60'/0'/0/", [Network.Stagenet]: "m/44'/60'/0'/0/" },
  }
}

// Lazy creation of ZCash config to use Vite env var for NowNodes API key
function createZecParams(network: Network, phrase: string) {
  const nownodesApiKey = import.meta.env.VITE_NOWNODES_API_KEY || ''

  const mainnetNownodesProvider = new NownodesProvider(
    'https://zecbook.nownodes.io/api/v2',
    'ZEC',
    AssetZEC,
    ZEC_DECIMAL,
    nownodesApiKey,
  )

  const dataProviders = [{
    [Network.Testnet]: undefined,
    [Network.Stagenet]: mainnetNownodesProvider,
    [Network.Mainnet]: mainnetNownodesProvider,
  }]

  return {
    ...defaultZECParams,
    network,
    phrase,
    explorerProviders: zcashExplorerProviders,
    dataProviders,
  }
}

// Cosmos Chains
import { Client as GaiaClient, defaultClientConfig as defaultGaiaParams } from '@xchainjs/xchain-cosmos'
import { Client as ThorClient, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { Client as MayaClient, defaultClientConfig as defaultMayaParams } from '@xchainjs/xchain-mayachain'
import { Client as KujiClient, defaultKujiParams } from '@xchainjs/xchain-kujira'

// Other Chains
import { Client as SolClient, defaultSolanaParams } from '@xchainjs/xchain-solana'
import { Client as XrdClient } from '@xchainjs/xchain-radix'
import { Client as AdaClient, defaultAdaParams } from '@xchainjs/xchain-cardano'
import { Client as XrpClient, defaultXRPParams } from '@xchainjs/xchain-ripple'

export interface ClientConfig {
  phrase: string
  network: Network
}

export function createClient(chainId: string, config: ClientConfig): XChainClient {
  const { phrase, network } = config

  switch (chainId) {
    // UTXO Chains
    case 'BTC':
      return new BtcClient({ ...defaultBTCParams, network, phrase })
    case 'BCH':
      return new BchClient({ ...defaultBchParams, network, phrase })
    case 'LTC':
      return new LtcClient({ ...defaultLtcParams, network, phrase })
    case 'DOGE':
      return new DogeClient({ ...defaultDogeParams, network, phrase })
    case 'DASH':
      return new DashClient({ ...defaultDashParams, network, phrase })
    case 'ZEC':
      return new ZecClient(createZecParams(network, phrase))

    // EVM Chains - use wide fee bounds to accommodate varying gas prices
    case 'ETH':
      return new EthClient({ ...defaultEthParams, network, phrase, feeBounds: { lower: 1_000_000, upper: 1_000_000_000_000 } })
    case 'AVAX':
      return new AvaxClient(createAvaxParams(network, phrase))
    case 'BSC':
      return new BscClient(createBscParams(network, phrase))
    case 'ARB':
      return new ArbClient({ ...defaultArbParams, network, phrase, feeBounds: { lower: 1_000_000, upper: 1_000_000_000_000 } })

    // Cosmos Chains
    case 'GAIA':
      return new GaiaClient({ ...defaultGaiaParams, network, phrase })
    case 'THOR':
      return new ThorClient({ ...defaultThorParams, network, phrase })
    case 'MAYA':
      return new MayaClient({ ...defaultMayaParams, network, phrase })
    case 'KUJI':
      return new KujiClient({ ...defaultKujiParams, network, phrase })

    // Other Chains
    case 'SOL':
      return new SolClient({ ...defaultSolanaParams, network, phrase })
    case 'XRD':
      return new XrdClient({ network, phrase })
    case 'ADA':
      return new AdaClient({ ...defaultAdaParams, network, phrase })
    case 'XRP':
      return new XrpClient({ ...defaultXRPParams, network, phrase })

    default:
      throw new Error(`Unsupported chain: ${chainId}`)
  }
}
