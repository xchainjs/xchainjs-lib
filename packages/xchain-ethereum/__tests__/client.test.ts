import nock from 'nock'
import { Wallet, providers } from 'ethers'
import { baseAmount, AssetETH, BaseAmount, assetToString } from '@xchainjs/xchain-util'
import Client from '../src/client'
import { ETH_DECIMAL } from '../src/utils'
import { mock_all_api } from '../__mocks__'
import {
  mock_ethplorer_api_getAddress,
  mock_ethplorer_api_getTxInfo,
  mock_ethplorer_api_getAddressTransactions,
  mock_ethplorer_api_getAddressHistory,
} from '../__mocks__/ethplorer-api'

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e'
const etherscanUrl = 'https://api-kovan.etherscan.io'
const kovanInfuraUrl = 'https://kovan.infura.io/v3'
const kovanAlchemyUrl = 'https://eth-kovan.alchemyapi.io/v2'
const wallet = {
  signingKey: {
    curve: 'secp256k1',
    privateKey: '0x739172c3520ea86ad6238b4f303cc09da6ca7254c76af1a1e8fa3fb00eb5c16f',
    publicKey:
      '0x04ef84375983ef666afdf0e430929574510aa56fb5ee0ee8c02a73f2d2c12ff8f7eee6cdaf9ab6d14fdeebc7ff3d7890f5f98376dac0e5d816dca347bc71d2aec8',
    compressedPublicKey: '0x02ef84375983ef666afdf0e430929574510aa56fb5ee0ee8c02a73f2d2c12ff8f7',
    _isSigningKey: true,
  },
}

/**
 * Wallet Tests
 */
describe('Client Test', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should throw error on bad phrase', () => {
    expect(() => {
      new Client({ phrase: 'bad bad phrase' })
    }).toThrowError()
  })

  it('should create a wallet from phrase', () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })
    expect(ethClient.getWallet()).toBeInstanceOf(Wallet)
    expect(ethClient.getWallet()._signingKey()).toMatchObject(wallet.signingKey)
  })

  it('should set new phrase', () => {
    const ethClient = new Client({})
    const newWallet = ethClient.setPhrase(newPhrase)
    expect(ethClient.getWallet().mnemonic.phrase).toEqual(newPhrase)
    expect(newWallet).toBeTruthy()
  })

  it('should fail to set new phrase', () => {
    const ethClient = new Client({})
    expect(() => ethClient.setPhrase('bad bad phrase')).toThrowError()
  })

  it('should connect to specified network', async () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
    })

    expect(ethClient.getWallet()).toBeInstanceOf(Wallet)
    expect(ethClient.getWallet().provider).toBeInstanceOf(providers.FallbackProvider)
    expect(ethClient.getWallet()._signingKey()).toMatchObject(wallet.signingKey)
    const network = await ethClient.getWallet().provider.getNetwork()
    expect(network.name).toEqual('homestead')
    expect(network.chainId).toEqual(1)
  })

  it('should set network', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })
    ethClient.setNetwork('testnet')

    const network = await ethClient.getWallet().provider.getNetwork()
    expect(network.name).toEqual('kovan')
    expect(network.chainId).toEqual(42)
  })

  it('should get address', () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })
    expect(ethClient.getAddress()).toEqual(address)
  })

  it('should get network', () => {
    const ethClient = new Client({ network: 'testnet' })
    expect(ethClient.getNetwork()).toEqual('testnet')
  })

  it('should fail a bad address', () => {
    const ethClient = new Client({ network: 'testnet' })
    expect(ethClient.validateAddress('0xBADbadBad')).toBeFalsy()
  })

  it('should pass a good address', () => {
    const ethClient = new Client({ network: 'testnet' })
    const goodAddress = ethClient.validateAddress(address)
    expect(goodAddress).toBeTruthy()
  })

  it('gets a balance without address args', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      ethplorerApiKey: 'ethplorerApiKey',
    })

    mock_ethplorer_api_getAddress(ethClient.getEthplorerUrl(), ethClient.getAddress(), {
      address: ethClient.getAddress(),
      ETH: {
        balance: 100,
        price: {
          rate: 1196.5425814145788,
          diff: 11.71,
          diff7d: 62.3,
          ts: 1609987982,
          marketCapUsd: 136582198332.62915,
          availableSupply: 114147377.999,
          volume24h: 44933107598.39366,
          diff30d: 108.688017487141,
          volDiff1: 7.230942506781318,
          volDiff7: 81.97257329720685,
          volDiff30: 16.64321146720964,
        },
      },
      tokens: [],
      countTxs: 1,
    })

    const balance = await ethClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].asset).toEqual(AssetETH)
    expect(balance[0].amount.amount().isEqualTo(baseAmount('100000000000000000000', ETH_DECIMAL).amount())).toBeTruthy()
  })

  it('gets a balance from address', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      ethplorerApiKey: 'ethplorerApiKey',
    })

    mock_ethplorer_api_getAddress(ethClient.getEthplorerUrl(), '0x12d4444f96c644385d8ab355f6ddf801315b6254', {
      address: '0x12d4444f96c644385d8ab355f6ddf801315b6254',
      ETH: {
        balance: 100,
        price: {
          rate: 1196.5425814145788,
          diff: 11.71,
          diff7d: 62.3,
          ts: 1609987982,
          marketCapUsd: 136582198332.62915,
          availableSupply: 114147377.999,
          volume24h: 44933107598.39366,
          diff30d: 108.688017487141,
          volDiff1: 7.230942506781318,
          volDiff7: 81.97257329720685,
          volDiff30: 16.64321146720964,
        },
      },
      tokens: [
        {
          balance: 1000,
          tokenInfo: {
            address: '0x2306934ca884caa042dc595371003093092b2bbf',
            decimals: '18',
            name: 'tomatos.finance',
            owner: '0x',
            symbol: 'TOMATOS',
            totalSupply: '1000000000000000000000000000',
            lastUpdated: 1609117980,
            issuancesCount: 0,
            holdersCount: 3181,
            ethTransfersCount: 0,
            price: false,
          },
        },
      ],
      countTxs: 1,
    })

    const balance = await ethClient.getBalance('0x12d4444f96c644385d8ab355f6ddf801315b6254')
    expect(balance.length).toEqual(2)
    expect(assetToString(balance[0].asset)).toEqual(assetToString(AssetETH))
    expect(balance[0].amount.amount().isEqualTo(baseAmount('100000000000000000000', ETH_DECIMAL).amount())).toBeTruthy()
    expect(balance[1].asset.symbol).toEqual('TOMATOS-0x2306934ca884caa042dc595371003093092b2bbf')
    expect(balance[1].amount.amount().isEqualTo(baseAmount(1000, 18).amount())).toBeTruthy()
  })

  it('throws error on bad address', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    const balances = ethClient.getBalance('0xbad')
    expect(balances).rejects.toThrowError()
  })

  it('get eth transaction history', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_ethplorer_api_getAddressTransactions(
      ethClient.getEthplorerUrl(),
      '0xff71cb760666ab06aa73f34995b42dd4b85ea07b',
      [
        {
          timestamp: 1603667072,
          from: '0xd3330a2f2fb4075335b9f2a682a5a550ffdadd6a',
          to: '0xff71cb760666ab06aa73f34995b42dd4b85ea07b',
          hash: '0x22e1e4f7395fed6f0e86d1f36ad65c884d0680c3a7b4d003ea7f21d8d7995a4a',
          value: 0.0102004945,
          input: '0x',
          success: true,
        },
      ],
    )

    const txHistory = await ethClient.getTransactions({
      address: '0xff71cb760666ab06aa73f34995b42dd4b85ea07b',
      limit: 1,
    })
    expect(txHistory.total).toEqual(1)
    expect(txHistory.txs[0].hash).toEqual('0x22e1e4f7395fed6f0e86d1f36ad65c884d0680c3a7b4d003ea7f21d8d7995a4a')
    expect(assetToString(txHistory.txs[0].asset)).toEqual(assetToString(AssetETH))
    expect(txHistory.txs[0].from[0].from).toEqual('0xd3330a2f2fb4075335b9f2a682a5a550ffdadd6a')
    expect(
      txHistory.txs[0].from[0].amount.amount().isEqualTo(baseAmount('10200494500000000', ETH_DECIMAL).amount()),
    ).toBeTruthy()
    expect(txHistory.txs[0].to[0].to).toEqual('0xff71cb760666ab06aa73f34995b42dd4b85ea07b')
    expect(
      txHistory.txs[0].to[0].amount.amount().isEqualTo(baseAmount('10200494500000000', ETH_DECIMAL).amount()),
    ).toBeTruthy()
    expect(txHistory.txs[0].type).toEqual('transfer')
  })

  it('get token transaction history', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      ethplorerApiKey: 'api-key',
    })

    mock_ethplorer_api_getAddressHistory(ethClient.getEthplorerUrl(), address, [
      {
        timestamp: 1610014043,
        transactionHash: '0x042f4c15f379ea9d15adf31df62024ae1738fafbef2267460a046295e2e28046',
        tokenInfo: {
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          name: 'Tether USD',
          decimals: '6',
          symbol: 'USDT',
          totalSupply: '14040316718197079',
          owner: '0xc6cde7c39eb2f0f0095f41570af89efc2c1ea828',
          txsCount: 78093026,
          transfersCount: 82658394,
          lastUpdated: 1610070598,
          issuancesCount: 0,
          holdersCount: 2324375,
          website: 'https://tether.to/',
          twitter: 'Tether_to',
          image: '/images/tether.png',
          facebook: 'tether.to',
          coingecko: 'tether',
          ethTransfersCount: 0,
          price: {
            rate: 1.00018102460765,
            diff: -0.16,
            diff7d: -0.08,
            ts: 1610070308,
            marketCapUsd: 23460968852.67532,
            availableSupply: 23456722608.66833,
            volume24h: 129342312569.62343,
            diff30d: -0.004226854901574484,
            volDiff1: 10.400245909757658,
            volDiff7: 65.49381861802408,
            volDiff30: 31.788420372084232,
            currency: 'USD',
          },
          publicTags: ['Stablecoins'],
        },
        type: 'transfer',
        value: '103000000',
        from: '0xf743cce2be90dd1d1ea13860a238fa4713d552ab',
        to: '0xe242271f229e4a7e3f3d555d5b0f86a412f24123',
      },
    ])

    const txHistory = await ethClient.getTransactions({
      address,
      limit: 1,
      asset: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
    })
    expect(txHistory.total).toEqual(1)
    expect(txHistory.txs[0].hash).toEqual('0x042f4c15f379ea9d15adf31df62024ae1738fafbef2267460a046295e2e28046')
    expect(txHistory.txs[0].asset.symbol).toEqual('USDT-0xdac17f958d2ee523a2206206994597c13d831ec7')
    expect(txHistory.txs[0].from[0].from).toEqual('0xf743cce2be90dd1d1ea13860a238fa4713d552ab')
    expect(txHistory.txs[0].from[0].amount.amount().isEqualTo(baseAmount('103000000', 6).amount())).toBeTruthy()
    expect(txHistory.txs[0].to[0].to).toEqual('0xe242271f229e4a7e3f3d555d5b0f86a412f24123')
    expect(txHistory.txs[0].to[0].amount.amount().isEqualTo(baseAmount('103000000', 6).amount())).toBeTruthy()
    expect(txHistory.txs[0].type).toEqual('transfer')
  })

  it('get transaction data', async () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
    })

    mock_ethplorer_api_getTxInfo(
      ethClient.getEthplorerUrl(),
      '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
      {
        hash: '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
        timestamp: 1604254250,
        blockNumber: 11172738,
        confirmations: 433964,
        success: true,
        from: '0xbabeae03735f9ed247f73978fe912028c9b5e828',
        to: '0x7ee158dab5b5b7f0bb0c8e5192c563666e7cdd85',
        value: 0,
        input:
          '0xa9059cbb000000000000000000000000e40ec68d7dccb6a7314d0faf6d33a4d72483cd770000000000000000000000000000000000000000000000000000048c27395000',
        gasLimit: 80952,
        gasUsed: 53968,
        logs: [],
        operations: [
          {
            timestamp: 1604254250,
            transactionHash: '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
            value: '1000',
            intValue: 1000,
            type: 'transfer',
            isEth: false,
            priority: 203,
            from: '0xbabeae03735f9ed247f73978fe912028c9b5e828',
            to: '0xe40ec68d7dccb6a7314d0faf6d33a4d72483cd77',
            addresses: ['0xbabeae03735f9ed247f73978fe912028c9b5e828', '0xe40ec68d7dccb6a7314d0faf6d33a4d72483cd77'],
            tokenInfo: {
              address: '0x7ee158dab5b5b7f0bb0c8e5192c563666e7cdd85',
              decimals: '6',
              name: 'MEMEI',
              symbol: 'MEI',
              totalSupply: '74075000000000',
              lastUpdated: 1609732766,
              owner: '0x',
              issuancesCount: 0,
              holdersCount: 1557,
              ethTransfersCount: 0,
              price: false,
            },
          },
        ],
      },
    )

    const txData = await ethClient.getTransactionData(
      '0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c',
    )

    expect(txData.hash).toEqual('0xc058a6e70f043f0887ba0d43198fb31f1752632ef06f7e975e193160fd14897c')
    expect(txData.asset.symbol).toEqual('MEI-0x7ee158dab5b5b7f0bb0c8e5192c563666e7cdd85')
    expect(txData.from[0].from).toEqual('0xbabeae03735f9ed247f73978fe912028c9b5e828')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(1000, 6).amount())).toBeTruthy()
    expect(txData.to[0].to).toEqual('0xe40ec68d7dccb6a7314d0faf6d33a4d72483cd77')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(1000, 6).amount())).toBeTruthy()
    expect(txData.type).toEqual('transfer')
  })

  it('sends a normalTx', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      kovanInfuraUrl,
      kovanAlchemyUrl,
      'eth_sendRawTransaction',
      '0xe389726c5d2bfd8b88f5842f1000635fc672992eb7aaa92d583b207ba51d9946',
    )

    const txResult = await ethClient.transfer({
      recipient: '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9',
      amount: baseAmount(100, ETH_DECIMAL),
    })
    expect(txResult).toEqual('0xe389726c5d2bfd8b88f5842f1000635fc672992eb7aaa92d583b207ba51d9946')
  })

  it('sends a erc20Tx', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      kovanInfuraUrl,
      kovanAlchemyUrl,
      'eth_sendRawTransaction',
      '0xcd0e007a6f81120d45478e3eef07c017ec104d4a2a5f1bff23cf0837ba3aab28',
    )

    const txHash = await ethClient.erc20Transfer({
      recipient: '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      amount: baseAmount(100, ETH_DECIMAL),
      assetAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
    })
    expect(txHash).toEqual('0xcd0e007a6f81120d45478e3eef07c017ec104d4a2a5f1bff23cf0837ba3aab28')
  })

  it('gets gas estimate for a erc20 transfer', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })
    const mockerc20 = jest.spyOn(ethClient, 'estimateGasERC20Tx')
    mockerc20.mockImplementation(async (_): Promise<BaseAmount> => Promise.resolve(baseAmount(100000, 18)))

    const gasEstimate = await ethClient.estimateGasERC20Tx({
      assetAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: baseAmount(1, ETH_DECIMAL),
    })

    expect(gasEstimate.amount().toString()).toEqual(baseAmount(100000, 18).amount().toString())
  })

  it('isApproved', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_call', '0x0000000000000000000000000000000000000000000000000000000000000064')

    let isApproved = await ethClient.isApproved(
      '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      baseAmount(100, ETH_DECIMAL),
    )
    expect(isApproved).toEqual(true)

    isApproved = await ethClient.isApproved(
      '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      baseAmount(101, ETH_DECIMAL),
    )
    expect(isApproved).toEqual(false)
  })

  it('approve', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, kovanInfuraUrl, kovanAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      kovanInfuraUrl,
      kovanAlchemyUrl,
      'eth_sendRawTransaction',
      '0x14dda501ddbddaf04e1dfde884a3b1b0e751cebe79bc922bead30789d39ed92c',
    )

    const hash = await ethClient.approve(
      '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      baseAmount(100, ETH_DECIMAL),
    )
    expect(hash).toEqual('0x14dda501ddbddaf04e1dfde884a3b1b0e751cebe79bc922bead30789d39ed92c')
  })
})
