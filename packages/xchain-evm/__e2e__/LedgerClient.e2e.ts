import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Balance, ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EtherscanProvider, RoutescanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset, assetAmount, assetFromStringEx, assetToBase, assetToString } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

// Import necessary modules and classes from external packages and files
import { ClientLedger, EVMClientParams, LedgerSigner } from '../src'

// Define constants related to Avalanche
const AVAX_DECIMAL = 18
const LOWER_FEE_BOUND = 2_000_000_000
const UPPER_FEE_BOUND = 1_000_000_000_000
const AVAX_GAS_ASSET_DECIMAL = 18
const AVAXChain = 'AVAX' as const
const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false }

// Define JSON-RPC providers for mainnet and testnet
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/avalanche')
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/avalanche_fuji')

// Define ethers providers for different networks
const AVAX_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.snowtrace.io',
  process.env.SNOWTRACE_API_KEY || '',
  AVAXChain,
  AssetAVAX,
  18,
)

// Define providers for different networks
const avaxProviders = {
  [Network.Mainnet]: AVAX_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: new EtherscanProvider(
    AVALANCHE_TESTNET_ETHERS_PROVIDER,
    'https://api-testnet.snowtrace.io',
    process.env.SNOWTRACE_API_KEY || '',
    AVAXChain,
    AssetAVAX,
    18,
  ),
  [Network.Stagenet]: AVAX_ONLINE_PROVIDER_MAINNET,
}

// Define Routescan providers for mainnet and testnet
const ROUTESCAN_PROVIDER_MAINNET = new RoutescanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.routescan.io',
  43114,
  AssetAVAX,
  AVAX_DECIMAL,
)

// Define Routescan providers for different networks
const routescanProviders = {
  [Network.Mainnet]: ROUTESCAN_PROVIDER_MAINNET,
  [Network.Testnet]: new RoutescanProvider(
    AVALANCHE_TESTNET_ETHERS_PROVIDER,
    'https://api.routescan.io',
    43113,
    AssetAVAX,
    AVAX_DECIMAL,
    true,
  ),
  [Network.Stagenet]: ROUTESCAN_PROVIDER_MAINNET,
}

// Define explorer providers for mainnet and testnet
const AVAX_MAINNET_EXPLORER = new ExplorerProvider(
  'https://snowtrace.dev/',
  'https://snowtrace.dev/address/%%ADDRESS%%',
  'https://snowtrace.dev/tx/%%TX_ID%%',
)

// Define default parameters for the Avalanche client
const defaults = {
  [Network.Mainnet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: BigNumber.from(200000),
    transferGasAssetGasLimit: BigNumber.from(23000),
    transferTokenGasLimit: BigNumber.from(100000),
    gasPrice: BigNumber.from(30 * 10 ** 9),
  },
}

const defaultAvaxParams: EVMClientParams = {
  chain: AVAXChain,
  gasAsset: AssetAVAX,
  gasAssetDecimals: AVAX_GAS_ASSET_DECIMAL,
  defaults,
  providers: {
    [Network.Mainnet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
    [Network.Testnet]: AVALANCHE_TESTNET_ETHERS_PROVIDER,
    [Network.Stagenet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
  },
  explorerProviders: {
    [Network.Mainnet]: AVAX_MAINNET_EXPLORER,
    [Network.Testnet]: new ExplorerProvider(
      'https://testnet.snowtrace.dev/',
      'https://testnet.snowtrace.dev/address/%%ADDRESS%%',
      'https://testnet.snowtrace.dev/tx/%%TX_ID%%',
    ),
    [Network.Stagenet]: AVAX_MAINNET_EXPLORER,
  },
  dataProviders: [avaxProviders, routescanProviders],
  network: Network.Mainnet,
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/60'/0'/0/`,
    [Network.Testnet]: `m/44'/60'/0'/0/`,
    [Network.Stagenet]: `m/44'/60'/0'/0/`,
  },
}

jest.setTimeout(200000)

describe('EVM Client Ledger', () => {
  let client: ClientLedger
  beforeAll(async () => {
    client = new ClientLedger({
      ...defaultAvaxParams,
      signer: new LedgerSigner({
        transport: await TransportNodeHid.create(),
        provider: defaultAvaxParams.providers[Network.Mainnet],
        derivationPath: defaultAvaxParams.rootDerivationPaths
          ? defaultAvaxParams.rootDerivationPaths[Network.Mainnet]
          : '',
      }),
    })
  })
  it('get address async without verification', async () => {
    const address = await client.getAddressAsync()
    console.log({ address })
  })

  it('get address async with verification', async () => {
    const address = await client.getAddressAsync(0, true)
    console.log({ address })
  })

  it('get balance', async () => {
    const address = await client.getAddressAsync()
    const balances = await client.getBalance(address)
    balances.forEach((balance: Balance) => {
      console.log(`${assetToString(balance.asset)} = ${balance.amount.amount()}`)
    })
  })

  it('transfer', async () => {
    try {
      const amount = assetToBase(assetAmount('1', 6))
      const txid = await client.transfer({
        asset: assetFromStringEx('AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'),
        recipient: await client.getAddressAsync(0),
        amount,
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })

  it('Approve', async () => {
    try {
      const amount = assetToBase(assetAmount('1', 6))
      const txid = await client.approve({
        amount,
        contractAddress: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        spenderAddress: '0x8F66c4AE756BEbC49Ec8B81966DD8bba9f127549',
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
