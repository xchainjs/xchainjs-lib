import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { EtherscanProvider } from '@xchainjs/xchain-evm-providers'
import { Asset, AssetType, Chain, baseAmount } from '@xchainjs/xchain-util'
import { JsonRpcProvider, Transaction } from 'ethers'
import { BigNumber } from 'bignumber.js'

import mock from '../__mocks__/axios-adapter'
import { mock_gas_oracle_custom } from '../__mocks__/etherscan-api'
import { mock_thornode_inbound_addresses_success } from '../__mocks__/thornode-api'
import { Client, EVMKeystoreClientParams, KeystoreSigner } from '../src'
import * as utils from '../src/utils'

const importjson = async (file: string) => (await import(file, { with: { type: 'json' } })).default

const AVAXChain: Chain = 'AVAX'
const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', type: AssetType.NATIVE }

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e'
const thornodeApiUrl = 'https://testnet.thornode.thorchain.info'

// =====Defaults=====
export const transferGasAssetGasLimit: BigNumber = new BigNumber(21000)
export const transferTokenGasLimit: BigNumber = new BigNumber(100000)
// =====Ethers providers=====
const AVALANCHE_MAINNET_ETHERS_PROVIDER = new JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
const AVALANCHE_TESTNET_ETHERS_PROVIDER = new JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc')

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
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
  [Network.Testnet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
  },
  [Network.Stagenet]: {
    approveGasLimit: new BigNumber(200000),
    transferGasAssetGasLimit: new BigNumber(23000),
    transferTokenGasLimit: new BigNumber(100000),
    gasPrice: new BigNumber(30 * 10 ** 9),
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

const setupCleanMocks = () => {
  mock.reset()
  mock.resetHistory()
}

/**
 * Wallet Tests
 */
describe('EVM client', () => {
  let avaxClient: Client

  beforeAll(() => {
    setupCleanMocks()
  })

  beforeEach(() => {
    setupCleanMocks()

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
    setupCleanMocks()
    jest.restoreAllMocks()
  })

  afterAll(() => {
    mock.restore()
  })

  it('Should throw error with invalid phrase', async () => {
    expect(() => {
      new Client({
        ...avaxParams,
        signer: new KeystoreSigner({
          phrase: 'bad phrase',
          provider: ethersJSProviders[Network.Testnet],
          derivationPath: ethRootDerivationPaths[Network.Testnet],
        }),
      })
    }).toThrow()
  })

  it('Should not throw error on a client without a phrase', () => {
    const params = { ...avaxParams, signer: undefined }
    expect(() => {
      new Client(params)
    }).not.toThrow()
  })

  it('Should not have a phrase after purging', async () => {
    avaxClient.purgeClient()
    expect(() => avaxClient.getAddress()).toThrow()
  })

  it('Should set new phrase', () => {
    expect(avaxClient.getAddress()).toBe('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
    const newAddress = avaxClient.setPhrase(newPhrase)
    expect(newAddress).toBe('0xd7aa2e8903782e02f3cee4fa3f317f5bcfd62a4d')
  })

  it('should fail to set new phrase', async () => {
    expect(() => avaxClient.setPhrase('bad bad phrase')).toThrow()
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
      await importjson('../__mocks__/responses/inbound_addresses_testnet.json'),
    )

    mock_gas_oracle_custom('https://api-testnet.snowtrace.io', 43113, {
      SafeGasPrice: '12.5',
      ProposeGasPrice: '25',
      FastGasPrice: '125',
    })

    const { fast, fastest, average } = await avaxClient.estimateGasPrices()

    expect(fast.amount().toString()).toEqual('25000000000')
    expect(fastest.amount().toString()).toEqual('125000000000') // 5x more than fast
    expect(average.amount().toString()).toEqual('12500000000') // 1/2 as much as fast
  })

  describe('approve - reset to zero for USDT-like tokens', () => {
    const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const spenderAddress = '0x3624525075b88B24ecc29CE226b0CEc1fFcB6976'
    const fakeSignedTx = '0xfakesignedtx'
    const fakeTxHash = '0xfaketxhash'

    const buildMockUnsignedTx = (): string => {
      const tx = new Transaction()
      tx.to = contractAddress
      tx.chainId = BigInt(43113)
      tx.nonce = 0
      return tx.unsignedSerialized
    }

    it('Should reset allowance to 0 before approving when current allowance is non-zero', async () => {
      const getAllowanceSpy = jest.spyOn(utils, 'getAllowance').mockResolvedValue(new BigNumber(1000))

      jest.spyOn(avaxClient, 'estimateGasPrices').mockResolvedValue({
        average: baseAmount(1, 18),
        fast: baseAmount(1, 18),
        fastest: baseAmount(1, 18),
      })
      jest.spyOn(avaxClient, 'estimateApprove').mockResolvedValue(new BigNumber(50000))
      jest.spyOn(avaxClient, 'prepareApprove').mockResolvedValue({ rawUnsignedTx: buildMockUnsignedTx() })

      const broadcastSpy = jest.spyOn(avaxClient, 'broadcastTx').mockResolvedValue(fakeTxHash)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signer = (avaxClient as any).getSigner()
      const signSpy = jest.spyOn(signer, 'signApprove').mockResolvedValue(fakeSignedTx)

      const mockProvider = avaxClient.getProvider()
      const waitSpy = jest.spyOn(mockProvider, 'waitForTransaction').mockResolvedValue({} as never)
      jest.spyOn(mockProvider, 'getTransactionCount').mockResolvedValue(0)
      jest.spyOn(mockProvider, 'getNetwork').mockResolvedValue({ chainId: BigInt(43113) } as never)

      await avaxClient.approve({
        contractAddress,
        spenderAddress,
        amount: baseAmount(5000, 18),
      })

      // Should have been called to check current allowance
      expect(getAllowanceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          contractAddress,
          spenderAddress,
        }),
      )

      // broadcastTx should be called twice: once for reset to 0, once for actual approval
      expect(broadcastSpy).toHaveBeenCalledTimes(2)

      // signApprove called twice: reset tx + actual approval tx
      expect(signSpy).toHaveBeenCalledTimes(2)

      // waitForTransaction must be called for the reset tx before the second broadcast
      expect(waitSpy).toHaveBeenCalledTimes(1)
      expect(waitSpy).toHaveBeenCalledWith(fakeTxHash)

      getAllowanceSpy.mockRestore()
    })

    it('Should not reset allowance when current allowance is zero', async () => {
      const getAllowanceSpy = jest.spyOn(utils, 'getAllowance').mockResolvedValue(new BigNumber(0))

      jest.spyOn(avaxClient, 'estimateGasPrices').mockResolvedValue({
        average: baseAmount(1, 18),
        fast: baseAmount(1, 18),
        fastest: baseAmount(1, 18),
      })
      jest.spyOn(avaxClient, 'estimateApprove').mockResolvedValue(new BigNumber(50000))
      jest.spyOn(avaxClient, 'prepareApprove').mockResolvedValue({ rawUnsignedTx: buildMockUnsignedTx() })

      const broadcastSpy = jest.spyOn(avaxClient, 'broadcastTx').mockResolvedValue(fakeTxHash)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signer = (avaxClient as any).getSigner()
      const signSpy = jest.spyOn(signer, 'signApprove').mockResolvedValue(fakeSignedTx)

      const mockProvider = avaxClient.getProvider()
      const waitSpy = jest.spyOn(mockProvider, 'waitForTransaction').mockResolvedValue({} as never)

      await avaxClient.approve({
        contractAddress,
        spenderAddress,
        amount: baseAmount(5000, 18),
      })

      // broadcastTx should be called only once for the actual approval
      expect(broadcastSpy).toHaveBeenCalledTimes(1)

      // signApprove called only once
      expect(signSpy).toHaveBeenCalledTimes(1)

      // waitForTransaction should not be called (no reset needed)
      expect(waitSpy).not.toHaveBeenCalled()

      getAllowanceSpy.mockRestore()
    })

    it('Should proceed with approval when getAllowance fails', async () => {
      const getAllowanceSpy = jest.spyOn(utils, 'getAllowance').mockRejectedValue(new Error('RPC timeout'))

      jest.spyOn(avaxClient, 'estimateGasPrices').mockResolvedValue({
        average: baseAmount(1, 18),
        fast: baseAmount(1, 18),
        fastest: baseAmount(1, 18),
      })
      jest.spyOn(avaxClient, 'estimateApprove').mockResolvedValue(new BigNumber(50000))
      jest.spyOn(avaxClient, 'prepareApprove').mockResolvedValue({ rawUnsignedTx: buildMockUnsignedTx() })

      const broadcastSpy = jest.spyOn(avaxClient, 'broadcastTx').mockResolvedValue(fakeTxHash)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signer = (avaxClient as any).getSigner()
      jest.spyOn(signer, 'signApprove').mockResolvedValue(fakeSignedTx)

      await avaxClient.approve({
        contractAddress,
        spenderAddress,
        amount: baseAmount(5000, 18),
      })

      // Should still broadcast the approval despite getAllowance failure
      expect(broadcastSpy).toHaveBeenCalledTimes(1)

      getAllowanceSpy.mockRestore()
    })
  })
})
