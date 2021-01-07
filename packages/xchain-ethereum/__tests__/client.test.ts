import nock from 'nock'
import { ethers, Wallet, providers, utils } from 'ethers'
import { parseEther } from '@ethersproject/units'
import { TransactionResponse, TransactionReceipt } from '@ethersproject/abstract-provider'
import { baseAmount, AssetETH, BaseAmount, assetToString } from '@xchainjs/xchain-util'
import Client from '../src/client'
import { ETH_DECIMAL } from '../src/utils'
import { mockDashboardAddress, mockGetTx } from '../__mocks__/blockchair-api'
import { mock_all_api } from '../__mocks__'
import { mock_ethplorer_api_getAddress } from '../__mocks__/ethplorer-api'

/**
 * Test Data
 * @todo import from .ts
 */
const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e'
const vault = '0x8c2A90D36Ec9F745C9B28B588Cba5e2A978A1656'
const blockchairUrl = 'https://api.blockchair.com/ethereum/testnet'
const ethplorerUrl = 'https://api.ethplorer.io'
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

const txResponse = {
  hash: '0x9eb9db9c3ec72918c7db73ae44e520139e95319c421ed6f9fc11fa8dd0cddc56',
  parentHash: '0x9b095b36c15eaf13044373aef8ee0bd3a382a5abb92e402afa44b8249c3a90e9',
  number: 3,
  timestamp: 1492010489,
  nonce: 1,
  difficulty: 2,
  gasLimit: ethers.BigNumber.from('0x47e7c4'),
  gasPrice: ethers.BigNumber.from('0x3b9aca00'),
  to: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
  from: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
  value: ethers.BigNumber.from('0x00'),
  data: '0x54455354',
  chainId: 4,
  gasUsed: ethers.BigNumber.from(0),
  miner: '0x0000000000000000000000000000000000000000',
  extraData:
    '0xd783010600846765746887676f312e372e33856c696e757800000000000000004e10f96536e45ceca7e34cc1bdda71db3f3bb029eb69afd28b57eb0202c0ec0859d383a99f63503c4df9ab6c1dc63bf6b9db77be952f47d86d2d7b208e77397301',
  transactions: [],
  confirmations: 1,
  wait: (_?: number): Promise<TransactionReceipt> => Promise.reject(new Error('no need to implement')),
}

/**
 * Wallet Tests
 */
describe('Wallets', () => {
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
})

/**
 * Connectivity Tests (networks/providers)
 */
describe('Connecting', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
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
})

/**
 * Utils
 */
describe('Utils', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
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
})

describe('Balances', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('gets a balance without address args', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      ethplorerUrl,
    })

    mock_ethplorer_api_getAddress(ethplorerUrl, ethClient.getAddress(), {
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
    expect(balance[0].amount.amount().isEqualTo(baseAmount(100, ETH_DECIMAL).amount())).toBeTruthy()
  })

  it('gets a balance from address', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      ethplorerUrl,
    })

    mock_ethplorer_api_getAddress(ethplorerUrl, '0x12d4444f96c644385d8ab355f6ddf801315b6254', {
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
    expect(balance[0].amount.amount().isEqualTo(baseAmount(100, ETH_DECIMAL).amount())).toBeTruthy()
    expect(balance[1].asset.symbol).toEqual('TOMATOS')
    expect(balance[1].amount.amount().isEqualTo(baseAmount(1000, 18).amount())).toBeTruthy()
  })

  it('throws error on bad address', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    const balances = ethClient.getBalance('0xbad')
    expect(balances).rejects.toThrowError()
  })
})

describe('Transactions', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('get transaction history', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      blockchairUrl,
    })

    mockDashboardAddress(blockchairUrl, '0xdac17f958d2ee523a2206206994597c13d831ec7', {
      '0xdac17f958d2ee523a2206206994597c13d831ec7': {
        address: {
          type: 'account',
          contract_code_hex: null,
          contract_created: null,
          contract_destroyed: null,
          balance: '10000',
          balance_usd: 0,
          received_approximate: '4358301000000000000',
          received_usd: 0,
          spent_approximate: '0',
          spent_usd: 0,
          fees_approximate: '0',
          fees_usd: 0,
          receiving_call_count: 38,
          spending_call_count: 0,
          call_count: 38,
          transaction_count: 38,
          first_seen_receiving: '2020-04-21 07:52:18',
          last_seen_receiving: '2020-12-08 04:49:56',
          first_seen_spending: null,
          last_seen_spending: null,
          nonce: null,
        },
        calls: [
          {
            block_id: 3888697,
            transaction_hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
            index: '0',
            time: '2020-12-08 04:49:56',
            sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
            recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            value: 0,
            value_usd: null,
            transferred: true,
          },
          {
            block_id: 3888697,
            transaction_hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
            index: '0',
            time: '2020-12-08 04:49:56',
            sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
            recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            value: 0,
            value_usd: null,
            transferred: true,
          },
        ],
      },
    })

    mockDashboardAddress(blockchairUrl, '0xdac17f958d2ee523a2206206994597c13d831ec7', {
      '0xdac17f958d2ee523a2206206994597c13d831ec7': {
        address: {
          type: 'account',
          contract_code_hex: null,
          contract_created: null,
          contract_destroyed: null,
          balance: '10000',
          balance_usd: 0,
          received_approximate: '4358301000000000000',
          received_usd: 0,
          spent_approximate: '0',
          spent_usd: 0,
          fees_approximate: '0',
          fees_usd: 0,
          receiving_call_count: 38,
          spending_call_count: 0,
          call_count: 38,
          transaction_count: 38,
          first_seen_receiving: '2020-04-21 07:52:18',
          last_seen_receiving: '2020-12-08 04:49:56',
          first_seen_spending: null,
          last_seen_spending: null,
          nonce: null,
        },
        calls: [
          {
            block_id: 3888697,
            transaction_hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
            index: '0',
            time: '2020-12-08 04:49:56',
            sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
            recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            value: 1000,
            value_usd: null,
            transferred: true,
          },
        ],
      },
    })

    mockGetTx(blockchairUrl, '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2', {
      '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2': {
        transaction: {
          block_id: 3888697,
          id: 3888697000001,
          index: 1,
          hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
          date: '2020-12-08',
          time: '2020-12-08 04:49:56',
          failed: false,
          type: 'call',
          sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
          recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          call_count: 1,
          value: '1000',
          value_usd: 0,
          internal_value: '0',
          internal_value_usd: null,
          fee: '432160000000000',
          fee_usd: null,
          gas_used: 21608,
          gas_limit: 32412,
          gas_price: 20000000000,
          input_hex:
            'a9059cbb0000000000000000000000001d5516bc994a130fc4fa2a6275f5b4ee022b18720000000000000000000000000000000000000000000000000000000004cace80',
          nonce: 98,
          v: '2e',
          r: '8797fe82968c48ccaf7db43785a2a97c6868b187a009f930e8406a052aefdc7b',
          s: '54dc9740ebf75835bd3aca3de018454251213e13b44fa93ecbf5f17faf16d995',
        },
        calls: [
          {
            block_id: 3888697,
            transaction_id: 3888697000001,
            transaction_hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
            index: '0',
            depth: 0,
            date: '2020-12-08',
            time: '2020-12-08 04:49:56',
            failed: false,
            fail_reason: null,
            type: 'call',
            sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
            recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            child_call_count: 0,
            value: '1000',
            value_usd: 0,
            transferred: true,
            input_hex:
              'a9059cbb0000000000000000000000001d5516bc994a130fc4fa2a6275f5b4ee022b18720000000000000000000000000000000000000000000000000000000004cace80',
            output_hex: '',
          },
        ],
      },
    })

    const txHistory = await ethClient.getTransactions({
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      limit: 1,
    })
    expect(txHistory.total).toEqual(2)
    expect(txHistory.txs[0].hash).toEqual('0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2')
    expect(txHistory.txs[0].asset).toEqual(AssetETH)
    expect(txHistory.txs[0].from[0].from).toEqual('0x4a89644d5dffb825a42a3496e24510424ca01516')
    expect(txHistory.txs[0].from[0].amount.amount().isEqualTo(baseAmount(1000, ETH_DECIMAL).amount())).toBeTruthy()
    expect(txHistory.txs[0].to[0].to).toEqual('0xdac17f958d2ee523a2206206994597c13d831ec7')
    expect(txHistory.txs[0].to[0].amount.amount().isEqualTo(baseAmount(1000, ETH_DECIMAL).amount())).toBeTruthy()
    expect(txHistory.txs[0].type).toEqual('transfer')
  })

  it('get transaction data', async () => {
    const ethClient = new Client({
      network: 'mainnet',
      phrase,
      blockchairUrl,
    })

    mockGetTx(blockchairUrl, '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2', {
      '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2': {
        transaction: {
          block_id: 3888697,
          id: 3888697000001,
          index: 1,
          hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
          date: '2020-12-08',
          time: '2020-12-08 04:49:56',
          failed: false,
          type: 'call',
          sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
          recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          call_count: 1,
          value: '1000',
          value_usd: 0,
          internal_value: '0',
          internal_value_usd: null,
          fee: '432160000000000',
          fee_usd: null,
          gas_used: 21608,
          gas_limit: 32412,
          gas_price: 20000000000,
          input_hex:
            'a9059cbb0000000000000000000000001d5516bc994a130fc4fa2a6275f5b4ee022b18720000000000000000000000000000000000000000000000000000000004cace80',
          nonce: 98,
          v: '2e',
          r: '8797fe82968c48ccaf7db43785a2a97c6868b187a009f930e8406a052aefdc7b',
          s: '54dc9740ebf75835bd3aca3de018454251213e13b44fa93ecbf5f17faf16d995',
        },
        calls: [
          {
            block_id: 3888697,
            transaction_id: 3888697000001,
            transaction_hash: '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
            index: '0',
            depth: 0,
            date: '2020-12-08',
            time: '2020-12-08 04:49:56',
            failed: false,
            fail_reason: null,
            type: 'call',
            sender: '0x4a89644d5dffb825a42a3496e24510424ca01516',
            recipient: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            child_call_count: 0,
            value: '1000',
            value_usd: 0,
            transferred: true,
            input_hex:
              'a9059cbb0000000000000000000000001d5516bc994a130fc4fa2a6275f5b4ee022b18720000000000000000000000000000000000000000000000000000000004cace80',
            output_hex: '',
          },
        ],
      },
    })

    const txData = await ethClient.getTransactionData(
      '0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2',
    )
    expect(txData.hash).toEqual('0x0816e0f18643b8a53b52091321954733bc173542f01424f4ca86cbf1d2e567b2')
    expect(txData.asset).toEqual(AssetETH)
    expect(txData.from[0].from).toEqual('0x4a89644d5dffb825a42a3496e24510424ca01516')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(1000, ETH_DECIMAL).amount())).toBeTruthy()
    expect(txData.to[0].to).toEqual('0xdac17f958d2ee523a2206206994597c13d831ec7')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(1000, ETH_DECIMAL).amount())).toBeTruthy()
    expect(txData.type).toEqual('transfer')
  })

  it('sends a normalTx', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      blockchairUrl,
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

  it('sends a normalTx with special parameters', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
      blockchairUrl,
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
      '0x3ee03f3d41acc7dffe5fa83fbaa65dab11803f6c5862cd20de58a9258ffb6043',
    )

    const txResult = await ethClient.normalTx({
      recipient: ethClient.getAddress(),
      amount: baseAmount(100, ETH_DECIMAL),
      overrides: {
        data: utils.toUtf8Bytes('memo'),
      },
    })
    expect(txResult.data).toEqual('0x6d656d6f')
  })

  it('checks vault and vaultTx', async () => {
    const ethClient = new Client({ network: 'mainnet', phrase })

    const vaultTx = ethClient.vaultTx(ethClient.getAddress(), baseAmount(parseEther('1').toString(), 18), 'SWAP')
    expect(vaultTx).rejects.toThrowError()
    ethClient.setVault(vault)
    expect(ethClient.getVault()).toEqual(vault)
  })
})

describe('ERC20', () => {
  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('gets gas estimate for a erc20 transfer', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })
    const mockerc20 = jest.spyOn(ethClient, 'estimateGasERC20Tx')
    mockerc20.mockImplementation(async (_): Promise<BaseAmount> => Promise.resolve(baseAmount(100000, 18)))

    const gasEstimate = await ethClient.estimateGasERC20Tx({
      assetAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: 1,
    })

    expect(gasEstimate.amount().toString()).toEqual(baseAmount(100000, 18).amount().toString())
  })

  it('sends erc20 with params', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    const mockerc20 = jest.spyOn(ethClient, 'erc20Tx')
    mockerc20.mockImplementation(async (_): Promise<TransactionResponse> => Promise.resolve(txResponse))

    const txR = await ethClient.erc20Tx({
      assetAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: 1,
      overrides: {
        gasLimit: 100000,
      },
    })

    expect(txR).toEqual(txResponse)
    expect(mockerc20).toHaveBeenCalledWith({
      assetAddress: '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8',
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: 1,
      overrides: {
        gasLimit: 100000,
      },
    })
  })
})
