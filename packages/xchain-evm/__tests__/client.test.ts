import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EtherscanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset, Chain } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'
import nock from 'nock'

import { mock_thornode_inbound_addresses_success } from '../__mocks__/thornode-api'
import { Client, EVMKeystoreClientParams, KeystoreSigner } from '../src'

const AVAXChain: Chain = 'AVAX'
const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', synth: false }

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e'
const thornodeApiUrl = 'https://testnet.thornode.thorchain.info'

// =====Defaults=====
export const transferGasAssetGasLimit: ethers.BigNumber = ethers.BigNumber.from(21000)
export const transferTokenGasLimit: ethers.BigNumber = ethers.BigNumber.from(100000)
// =====Ethers providers=====
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider(
  'https://api.avax-test.network/ext/bc/C/rpc',
)

const ethersJSProviders = {
  [Network.Mainnet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: AVALANCHE_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: AVALANCHE_MAINNET_ETHERS_PROVIDER,
}
// =====Ethers providers=====
// =====ONLINE providers=====
// const API_KEY = 'FAKE_KEY'

const AVAX_ONLINE_PROVIDER_TESTNET = new EtherscanProvider(
  AVALANCHE_TESTNET_ETHERS_PROVIDER,
  'https://api-testnet.snowtrace.io',
  'fake',
  AVAXChain,
  AssetAVAX,
  18,
)
const AVAX_ONLINE_PROVIDER_MAINNET = new EtherscanProvider(
  AVALANCHE_MAINNET_ETHERS_PROVIDER,
  'https://api.snowtrace.io',
  'fake',
  AVAXChain,
  AssetAVAX,
  18,
)

const avaxProviders = {
  [Network.Mainnet]: AVAX_ONLINE_PROVIDER_MAINNET,
  [Network.Testnet]: AVAX_ONLINE_PROVIDER_TESTNET,
  [Network.Stagenet]: AVAX_ONLINE_PROVIDER_MAINNET,
}
// =====ONLINE providers=====

// =====Explorers=====
const AVAX_MAINNET_EXPLORER = new ExplorerProvider(
  'https://snowtrace.io/',
  'https://snowtrace.io/tx/%%TX_ID%%',
  'https://snowtrace.io/address/%%ADDRESS%%',
)
const AVAX_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.snowtrace.io/',
  'https://testnet.snowtrace.io/tx/%%TX_ID%%',
  'https://testnet.snowtrace.io/address/%%ADDRESS%%',
)
const avaxExplorerProviders = {
  [Network.Mainnet]: AVAX_MAINNET_EXPLORER,
  [Network.Testnet]: AVAX_TESTNET_EXPLORER,
  [Network.Stagenet]: AVAX_MAINNET_EXPLORER,
}
// =====Explorers=====

// const avaxRootDerivationPaths = {
//   [Network.Mainnet]: `m/44'/9000'/0'/0/`,
//   [Network.Testnet]: `m/44'/9000'/0'/0/`,
//   [Network.Stagenet]: `m/44'/9000'/0'/0/`,
// }
const ethRootDerivationPaths = {
  [Network.Mainnet]: `m/44'/60'/0'/0/`,
  [Network.Testnet]: `m/44'/60'/0'/0/`,
  [Network.Stagenet]: `m/44'/60'/0'/0/`,
}
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
const avaxParams: EVMKeystoreClientParams = {
  chain: AVAXChain,
  gasAsset: AssetAVAX,
  gasAssetDecimals: 18,
  defaults,
  providers: ethersJSProviders,
  explorerProviders: avaxExplorerProviders,
  dataProviders: [avaxProviders],
  network: Network.Testnet,
  feeBounds: {
    lower: 1,
    upper: 1,
  },
  rootDerivationPaths: ethRootDerivationPaths,
  signer: new KeystoreSigner({
    phrase,
    provider: ethersJSProviders[Network.Testnet],
    derivationPath: ethRootDerivationPaths[Network.Testnet],
  }),
}
/**
 * Wallet Tests
 */
describe('EVM client', () => {
  let avaxClient: Client
  beforeEach(() => {
    nock.disableNetConnect()
    avaxClient = new Client({
      ...avaxParams,
      signer: new KeystoreSigner({
        phrase,
        provider: ethersJSProviders[Network.Testnet],
        derivationPath: ethRootDerivationPaths[Network.Testnet],
      }),
    })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('Should throw error with invalid phrase', () => {
    expect(() => {
      new Client({
        ...avaxParams,
        signer: new KeystoreSigner({
          phrase: 'bad phrase',
          provider: ethersJSProviders[Network.Testnet],
          derivationPath: ethRootDerivationPaths[Network.Testnet],
        }),
      })
    }).toThrowError()
  })

  it('Should not throw error on a client without a phrase', () => {
    const params = { ...avaxParams, signer: undefined }
    expect(() => {
      new Client(params)
    }).not.toThrow()
  })

  it('Should not have a phrase after purging', () => {
    avaxClient.purgeClient()
    expect(() => avaxClient.getAddress()).toThrowError()
  })

  it('Should set new phrase', () => {
    expect(avaxClient.getAddress()).toBe('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
    const newAddress = avaxClient.setPhrase(newPhrase)
    expect(newAddress).toBe('0xd7aa2e8903782e02f3cee4fa3f317f5bcfd62a4d')
  })

  it('should fail to set new phrase', () => {
    expect(() => avaxClient.setPhrase('bad bad phrase')).toThrowError()
  })

  it('Should connect to specified network', async () => {
    // TODO
  })

  it('Should get network', () => {
    expect(avaxClient.getNetwork()).toEqual('testnet')
  })

  it('Should set network', async () => {
    avaxClient.setNetwork(Network.Mainnet)
    expect(avaxClient.getNetwork()).toBe(Network.Mainnet)
  })

  it('Should get address', async () => {
    expect(await avaxClient.getAddressAsync()).toEqual(address)
  })

  it('Should throw error on bad index', async () => {
    try {
      await avaxClient.getAddressAsync(-1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      expect(e.message).toBeDefined()
    }
  })

  it('Should throw errors if phrase is not present', async () => {
    avaxClient.purgeClient()
    try {
      await avaxClient.getAddressAsync()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      expect(e.message).toBeDefined()
    }
  })

  it('Should fail a bad address', () => {
    expect(avaxClient.validateAddress('0xBADbadBad')).toBeFalsy()
  })

  it('Should pass a good address', () => {
    const goodAddress = avaxClient.validateAddress(address)
    expect(goodAddress).toBeTruthy()
  })

  it('Should estimate gas prices', async () => {
    mock_thornode_inbound_addresses_success(
      thornodeApiUrl,
      require('../__mocks__/responses/inbound_addresses_testnet.json'),
    )

    const { fast, fastest, average } = await avaxClient.estimateGasPrices()

    expect(fast.amount().toString()).toEqual('25000000000')
    expect(fastest.amount().toString()).toEqual('125000000000') // 5x more than fast
    expect(average.amount().toString()).toEqual('12500000000') // 1/2 as much as fast
  })
})
