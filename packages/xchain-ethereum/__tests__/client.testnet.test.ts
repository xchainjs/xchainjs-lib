import { TransactionResponse } from '@ethersproject/abstract-provider'
import { FeeOption, Network } from '@xchainjs/xchain-client'
import { AssetETH, Chain, ETHChain, assetFromString, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { BigNumber, Wallet, providers } from 'ethers'
import nock from 'nock'

import { mock_all_api } from '../__mocks__'
import {
  mock_etherscan_eth_txs_api,
  mock_etherscan_token_txs_api,
  mock_gastracker_api,
} from '../__mocks__/etherscan-api'
import {
  mock_thornode_inbound_addresses_fail,
  mock_thornode_inbound_addresses_success,
} from '../__mocks__/thornode-api'
import Client from '../src/client'
import erc20ABI from '../src/data/erc20.json'
import { ETH_DECIMAL } from '../src/utils'

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e'
const etherscanUrl = 'https://api-ropsten.etherscan.io'
const ropstenInfuraUrl = 'https://ropsten.infura.io/v3'
const ropstenAlchemyUrl = 'https://eth-ropsten.alchemyapi.io/v2'
const thornodeApiUrl = 'https://testnet.thornode.thorchain.info'

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

const sampleBlock = {
  gasLimit: '0x7a1200',
  baseFeePerGas: '0x21be0',
  difficulty: '0x1e2bc010',
  extraData: '0xd883010a08846765746888676f312e31362e35856c696e7578',
  gasUsed: '0x79fbf9',
  hash: '0x989219f6686ee98fd459fad2de7b4233ad48903c4eb8ce39484a4205fc165fa5',
  logsBloom:
    '0x41208401000104020801001080010240961008004100022c4591421000020008000000800000000c8008080810010000048221028140c020424000400824000006000510401204000a000008005200200011425800140040000800b08000008000301001021804900000006008800b0440c0081240205314002400900201c04400808040000000000040000000000000120410812118008802008050040004000200800000020400d00000040010500008080040010511900804082603204000400880624040800040004000400604004008000000000010018910c0540061470030404811041000001040200284002842002002000000400001800e08808004',
  miner: '0x9ffed2297c7b81293413550db675073ab46980b2',
  mixHash: '0xa5d01de4503d87aeed68fda0a977846cbdb13fcbf9ae63d23b246aa6abd33d4c',
  nonce: '0xfc28d6e03af2d6cf',
  number: '0xa7cac8',
  parentHash: '0x5019f700259c66171da9ad0cdd2a856423802de934eb81bddb2f727115556d93',
  receiptsRoot: '0xcfedb0bf81ec15c2858f9cf5348da06ef0f312e341532a48918498b4f0e2a23d',
  sha3Uncles: '0xee98d83db96d242b1b523a9fd9818cb805edd014ed154660e3d575dbaf54292e',
  size: '0x1b8d1',
  stateRoot: '0x2e7cd7660bf740c99f83fd3bf31ad1b5c2631483032e4626a1577ac6e9eef43d',
  timestamp: '0x6138dbd2',
  totalDifficulty: '0x7b5aae13f0a664',
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

  describe('#constructor', () => {
    it('should throw error on bad phrase', () => {
      expect(() => {
        new Client({ phrase: 'bad bad phrase' })
      }).toThrowError()
    })

    it('should not throw on a client without a phrase', () => {
      expect(() => {
        new Client({
          network: Network.Testnet,
        })
      }).not.toThrow()
    })
  })

  describe('#purgeClient', () => {
    it('should not have a phrase after purging', () => {
      const ethClient = new Client({
        network: Network.Testnet,
        phrase,
      })

      expect(ethClient['phrase']).toEqual(phrase)
      ethClient.purgeClient()
      expect(ethClient['phrase']).toEqual('')
    })
  })

  describe('#getWallet', () => {
    let ethClient: Client

    beforeEach(() => {
      ethClient = new Client({
        network: Network.Testnet,
        phrase,
      })
    })

    it('should create a wallet from phrase', () => {
      expect(ethClient.getWallet(0)).toBeInstanceOf(Wallet)
      expect(ethClient.getWallet(0)._signingKey()).toMatchObject(wallet.signingKey)
    })

    it('should throw errors if phrase is not present', () => {
      ethClient.purgeClient()
      expect(() => {
        ethClient.getAddress()
      }).toThrow()
    })
  })

  it('should set new phrase', () => {
    const ethClient = new Client({ phrase })
    const newWallet = ethClient.setPhrase(newPhrase)
    expect(ethClient.getWallet(0).mnemonic.phrase).toEqual(newPhrase)
    expect(newWallet).toBeTruthy()
  })

  it('should fail to set new phrase', () => {
    const ethClient = new Client({ phrase })
    expect(() => ethClient.setPhrase('bad bad phrase')).toThrowError()
  })

  it('should connect to specified network', async () => {
    const ethClient = new Client({
      network: 'mainnet' as Network,
      phrase,
    })

    const wallet = ethClient.getWallet(0)
    expect(wallet).toBeInstanceOf(Wallet)
    expect(wallet.provider).toBeInstanceOf(providers.FallbackProvider)
    const network = await ethClient.getWallet(0).provider.getNetwork()
    expect(network.name).toEqual('homestead')
    expect(network.chainId).toEqual(1)
  })

  it('should connect to Infura provider', async () => {
    const ethClient = new Client({
      network: 'mainnet' as Network,
      phrase,
      infuraCreds: {
        projectId: '',
        projectSecret: '',
      },
    })

    expect(ethClient.getWallet(0).provider).toBeInstanceOf(providers.InfuraProvider)
  })

  it('should set network', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })
    ethClient.setNetwork('testnet' as Network)

    const network = await ethClient.getWallet(0).provider.getNetwork()
    expect(network.name).toEqual('ropsten')
    expect(network.chainId).toEqual(3)
  })

  describe('#getAddress', () => {
    let ethClient: Client

    beforeEach(() => {
      ethClient = new Client({
        network: Network.Testnet,
        phrase,
      })
    })

    it('should get address', () => {
      expect(ethClient.getAddress()).toEqual(address)
    })

    it('throws error on bad index', async () => {
      expect(() => ethClient.getAddress(-1)).toThrow()
    })

    it('should throw errors if phrase is not present', () => {
      ethClient.purgeClient()
      expect(() => {
        ethClient.getAddress()
      }).toThrow()
    })
  })

  it('should get network', () => {
    const ethClient = new Client({ phrase, network: 'testnet' as Network })
    expect(ethClient.getNetwork()).toEqual('testnet')
  })

  it('should fail a bad address', () => {
    const ethClient = new Client({ phrase, network: 'testnet' as Network })
    expect(ethClient.validateAddress('0xBADbadBad')).toBeFalsy()
  })

  it('should pass a good address', () => {
    const ethClient = new Client({ phrase, network: 'testnet' as Network })
    const goodAddress = ethClient.validateAddress(address)
    expect(goodAddress).toBeTruthy()
  })

  it('estimateGasPrices', async () => {
    mock_thornode_inbound_addresses_success(
      thornodeApiUrl,
      require('../__mocks__/responses/inbound_addresses_testnet.json'),
    )

    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    const { fast, fastest, average } = await ethClient.estimateGasPrices()

    expect(fast.amount().toString()).toEqual('30000000000')
    expect(fastest.amount().toString()).toEqual('150000000000')
    expect(average.amount().toString()).toEqual('15000000000')
  })

  it('get eth transaction history', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_etherscan_eth_txs_api(etherscanUrl, [
      {
        blockNumber: '7937085',
        timeStamp: '1611284369',
        hash: '0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4',
        from: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        to: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
        value: '150023345036431545',
        contractAddress: '',
        input: '',
        type: 'call',
        gas: '0',
        gasUsed: '0',
        traceId: '0_1',
        isError: '0',
        errCode: '',
      },
    ])

    const txHistory = await ethClient.getTransactions({
      address,
      limit: 1,
    })

    expect(txHistory.total).toEqual(1)
    expect(txHistory.txs[0].hash).toEqual('0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4')
    expect(assetToString(txHistory.txs[0].asset)).toEqual(assetToString(AssetETH))
    expect(txHistory.txs[0].from[0].from).toEqual('0x7a250d5630b4cf539739df2c5dacb4c659f2488d')
    expect(
      txHistory.txs[0].from[0].amount.amount().isEqualTo(baseAmount('150023345036431545', ETH_DECIMAL).amount()),
    ).toBeTruthy()
    expect(txHistory.txs[0].to[0].to).toEqual('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
    expect(
      txHistory.txs[0].to[0].amount.amount().isEqualTo(baseAmount('150023345036431545', ETH_DECIMAL).amount()),
    ).toBeTruthy()
    expect(txHistory.txs[0].type).toEqual('transfer')
  })

  it('get token transaction history', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_etherscan_token_txs_api(etherscanUrl, [
      {
        blockNumber: '7937097',
        timeStamp: '1611284549',
        hash: '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
        nonce: '11',
        blockHash: '0x460e054d7420823b4d6110045593d33ec82a040df8f1e47371bf3a52ab54910a',
        from: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
        contractAddress: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
        to: '0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa',
        value: '200000000000000000000',
        tokenName: 'ChainLink Token',
        tokenSymbol: 'LINK',
        tokenDecimal: '18',
        transactionIndex: '3',
        gas: '219318',
        gasPrice: '1000000000',
        gasUsed: '188808',
        cumulativeGasUsed: '680846',
        input: 'deprecated',
        confirmations: '11597',
      },
    ])

    const txHistory = await ethClient.getTransactions({
      address,
      limit: 1,
      asset: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
    })
    expect(txHistory.total).toEqual(1)
    expect(txHistory.txs[0].hash).toEqual('0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e')
    expect(txHistory.txs[0].asset.symbol).toEqual('LINK-0x01be23585060835e02b77ef475b0cc51aa1e0709')
    expect(txHistory.txs[0].from[0].from).toEqual('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
    expect(
      txHistory.txs[0].from[0].amount.amount().isEqualTo(baseAmount('200000000000000000000', 18).amount()),
    ).toBeTruthy()
    expect(txHistory.txs[0].to[0].to).toEqual('0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa')
    expect(
      txHistory.txs[0].to[0].amount.amount().isEqualTo(baseAmount('200000000000000000000', 18).amount()),
    ).toBeTruthy()
    expect(txHistory.txs[0].type).toEqual('transfer')
  })

  it('get transaction data', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionByHash', {
      blockHash: '0x460e054d7420823b4d6110045593d33ec82a040df8f1e47371bf3a52ab54910a',
      blockNumber: '0x791c49',
      from: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
      gas: '0x358b6',
      gasPrice: '0x3b9aca00',
      hash: '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
      input:
        '0x38ed173900000000000000000000000000000000000000000000000ad78ebc5ac62000000000000000000000000000000000000000000000000000007abf2a9d39bcfaf800000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000b8c0c226d6fe17e5d9132741836c3ae82a5b6c4e00000000000000000000000000000000000000000000000000000000600a44c8000000000000000000000000000000000000000000000000000000000000000300000000000000000000000001be23585060835e02b77ef475b0cc51aa1e0709000000000000000000000000c778417e063141139fce010982780140aa0cd5ab0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984',
      nonce: '0xb',
      to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
      transactionIndex: '0x3',
      value: '0x0',
      v: '0x2c',
      r: '0x933df8626f5d58ab156fee63948fc4a9caffbcbd583d8e813dacbac6ca016077',
      s: '0x1dd7659476b58823b4d23aca9a4a91e89c5840fe7e34c01c4e9a10c571c9ef44',
    })
    mock_etherscan_token_txs_api(etherscanUrl, [
      {
        blockNumber: '7937097',
        timeStamp: '1611284549',
        hash: '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
        nonce: '11',
        blockHash: '0x460e054d7420823b4d6110045593d33ec82a040df8f1e47371bf3a52ab54910a',
        from: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
        contractAddress: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
        to: '0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa',
        value: '200000000000000000000',
        tokenName: 'ChainLink Token',
        tokenSymbol: 'LINK',
        tokenDecimal: '18',
        transactionIndex: '3',
        gas: '219318',
        gasPrice: '1000000000',
        gasUsed: '188808',
        cumulativeGasUsed: '680846',
        input: 'deprecated',
        confirmations: '11597',
      },
    ])

    const txData = await ethClient.getTransactionData(
      '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
      '0x01be23585060835e02b77ef475b0cc51aa1e0709',
    )

    expect(txData.hash).toEqual('0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e')
    expect(txData.asset.symbol).toEqual('LINK-0x01be23585060835e02b77ef475b0cc51aa1e0709')
    expect(txData.from[0].from).toEqual('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(200000000000000000000, 18).amount())).toBeTruthy()
    expect(txData.to[0].to).toEqual('0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(200000000000000000000, 18).amount())).toBeTruthy()
    expect(txData.type).toEqual('transfer')
  })

  it('ETH transfer', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0xa7cac8')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x0')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getBlockByNumber', sampleBlock)
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_sendRawTransaction',
      '0x5db775f690e45250e4e143fe3ba197f72b51192e88a87048bc52eb2e60f9c503',
    )
    mock_thornode_inbound_addresses_fail(thornodeApiUrl)
    mock_gastracker_api(etherscanUrl, 'gasoracle', {
      LastBlock: '11745402',
      SafeGasPrice: '51',
      ProposeGasPrice: '59',
      FastGasPrice: '76',
    })

    const gasFee = await ethClient.estimateFeesWithGasPricesAndLimits({
      recipient: '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9',
      amount: baseAmount(1000001, ETH_DECIMAL),
    })
    const txResult = await ethClient.transfer({
      recipient: '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9',
      amount: baseAmount(1000001, ETH_DECIMAL),
      gasLimit: gasFee.gasLimit,
      gasPrice: gasFee.gasPrices.fastest,
    })
    expect(txResult).toEqual('0x5db775f690e45250e4e143fe3ba197f72b51192e88a87048bc52eb2e60f9c503')
  })

  it('ERC20 transfer', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0xa7cac8')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x0')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getBlockByNumber', sampleBlock)
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_call',
      '0x0000000000000000000000000000000000000000000000000000000000000064',
    )
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_sendRawTransaction',
      '0x4479b2af29590d5ad1b591ddfbb479dba37a5857c2a250b41c16bb2cecb7d08c',
    )
    mock_thornode_inbound_addresses_success(thornodeApiUrl, [
      {
        chain: 'ETH' as Chain,
        pub_key: 'tthorpub1addwnpepqfz98sx54jpv3f95qfg39zkx500avc6tr0d8ww0lv283yu3ucgq3g9y9njj',
        address: '0x8d1133a8cf23112fdb21f1efca340d727a98196e',
        router: '0xe0a63488e677151844e70623533c22007dc57c9e',
        halted: false,
        gas_rate: '30',
      },
      {
        chain: 'LTC' as Chain,
        pub_key: 'tthorpub1addwnpepqfz98sx54jpv3f95qfg39zkx500avc6tr0d8ww0lv283yu3ucgq3g9y9njj',
        address: 'tltc1q3x76wl4gmwu4yzx682r30ej0a8e2tttaw6pv7u',
        halted: false,
        gas_rate: '49',
      },
    ])

    const gasFee = await ethClient.estimateFeesWithGasPricesAndLimits({
      recipient: '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      amount: baseAmount('10000000000000', ETH_DECIMAL),
      asset: assetFromString(`${ETHChain}.DAI-0xc7ad46e0b8a400bb3c915120d284aafba8fc4735`) || undefined,
    })
    const txHash = await ethClient.transfer({
      recipient: '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      amount: baseAmount('10000000000000', ETH_DECIMAL),
      asset: assetFromString(`${ETHChain}.DAI-0xc7ad46e0b8a400bb3c915120d284aafba8fc4735`) || undefined,
      gasLimit: gasFee.gasLimit,
      gasPrice: gasFee.gasPrices.fastest,
    })
    expect(txHash).toEqual('0x4479b2af29590d5ad1b591ddfbb479dba37a5857c2a250b41c16bb2cecb7d08c')
  })

  it('estimate gas for eth transfer', async () => {
    const ethClient = new Client({ network: 'testnet' as Network, phrase })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_thornode_inbound_addresses_fail(thornodeApiUrl)
    mock_gastracker_api(etherscanUrl, 'gasoracle', {
      LastBlock: '11745402',
      SafeGasPrice: '51',
      ProposeGasPrice: '59',
      FastGasPrice: '76',
    })
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_sendRawTransaction',
      '0xcd0e007a6f81120d45478e3eef07c017ec104d4a2a5f1bff23cf0837ba3aab28',
    )

    const gasEstimate = await ethClient.estimateFeesWithGasPricesAndLimits({
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: baseAmount(1, ETH_DECIMAL),
    })

    expect(gasEstimate.fees.average.amount().toString()).toEqual(baseAmount('1071000000000000', 18).amount().toString())
    expect(gasEstimate.fees.fast.amount().toString()).toEqual(baseAmount('1239000000000000', 18).amount().toString())
    expect(gasEstimate.fees.fastest.amount().toString()).toEqual(baseAmount('1596000000000000', 18).amount().toString())
  })

  it('estimate gas for erc20 transfer', async () => {
    const ethClient = new Client({ network: 'testnet' as Network, phrase })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_thornode_inbound_addresses_fail(thornodeApiUrl)
    mock_gastracker_api(etherscanUrl, 'gasoracle', {
      LastBlock: '11745402',
      SafeGasPrice: '51',
      ProposeGasPrice: '59',
      FastGasPrice: '76',
    })
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_sendRawTransaction',
      '0x92f7a7ecc80b955647988b705ad6a3607044226b64f2ce6a7ef2753296692a5b',
    )

    const gasEstimate = await ethClient.estimateFeesWithGasPricesAndLimits({
      asset: assetFromString(`${ETHChain}.DAI-0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa`) || undefined,
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: baseAmount(1, ETH_DECIMAL),
    })

    expect(gasEstimate.fees.average.amount().toString()).toEqual(baseAmount('1071000000000000', 18).amount().toString())
    expect(gasEstimate.fees.fast.amount().toString()).toEqual(baseAmount('1239000000000000', 18).amount().toString())
    expect(gasEstimate.fees.fastest.amount().toString()).toEqual(baseAmount('1596000000000000', 18).amount().toString())
  })

  describe('isApproved', () => {
    const contractAddress = '0xA3910454bF2Cb59b8B3a401589A3bAcC5cA42306' // USDT
    const spenderAddress = '0xeB005a0aa5027F66c8D195C77f7B01324C48501C' // router
    const client = new Client({
      network: Network.Testnet,
      phrase,
    })

    it('approved', async () => {
      mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0xa7cac8')
      mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x0')
      mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0x5969ec91')
      mock_all_api(
        etherscanUrl,
        ropstenInfuraUrl,
        ropstenAlchemyUrl,
        'eth_call',
        '0x0000000000000000000000000000000000000000000000000000000000000064', // 100
      )

      const result = await client.isApproved({
        contractAddress,
        spenderAddress,
        amount: baseAmount(100, 6),
        walletIndex: 0,
      })
      expect(result).toBeTruthy()
    })

    it('not approved', async () => {
      mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0xa7cac8')
      mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x0')
      mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0x5969ec91')
      mock_all_api(
        etherscanUrl,
        ropstenInfuraUrl,
        ropstenAlchemyUrl,
        'eth_call',
        '0x0000000000000000000000000000000000000000000000000000000000000064', // 100
      )

      const result = await client.isApproved({
        contractAddress,
        spenderAddress,
        amount: baseAmount(101, 6),
        walletIndex: 0,
      })
      expect(result).toBeFalsy()
    })
  })

  it('estimateApprove', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5208') // 2100

    const fromAddress = ethClient.getAddress(0)

    const gasLimit = await ethClient.estimateApprove({
      fromAddress,
      contractAddress: '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      spenderAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      amount: baseAmount(100, ETH_DECIMAL),
    })
    expect(gasLimit.eq(21000)).toBeTruthy()
  })

  it('approve', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0xa7cac8')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x0')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getBlockByNumber', sampleBlock)

    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_sendRawTransaction',
      '0x9df14ad5cf1a14d625cc6a6f2b5af4b410183387f85d9109985d7779ea07c869',
    )

    const contractAddress = '0xA3910454bF2Cb59b8B3a401589A3bAcC5cA42306' // USDT
    const spenderAddress = '0xeB005a0aa5027F66c8D195C77f7B01324C48501C' // router

    const tx = await ethClient.approve({
      walletIndex: 0,
      contractAddress,
      spenderAddress,
      feeOptionKey: FeeOption.Fastest,
      amount: baseAmount(100, ETH_DECIMAL),
    })
    expect(tx.hash).toEqual('0x9df14ad5cf1a14d625cc6a6f2b5af4b410183387f85d9109985d7779ea07c869')
  })
  it('estimate call', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5208')

    const gasLimit = await ethClient.estimateCall({
      contractAddress: '0xd15ffaef3112460bf3bcd81087fcbbce394e2ae7',
      abi: erc20ABI,
      funcName: 'transfer',
      funcParams: [
        '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
        BigNumber.from(baseAmount('10000000000000', ETH_DECIMAL).amount().toString()),
        {
          from: ethClient.getAddress(0),
        },
      ],
    })

    expect(gasLimit.toString()).toEqual('21000')
  })

  it('call', async () => {
    const ethClient = new Client({
      network: 'testnet' as Network,
      phrase,
    })

    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_blockNumber', '0xa7cac8')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getTransactionCount', '0x0')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_gasPrice', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_estimateGas', '0x5969ec91')
    mock_all_api(etherscanUrl, ropstenInfuraUrl, ropstenAlchemyUrl, 'eth_getBlockByNumber', sampleBlock)
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_sendRawTransaction',
      '0xe57981c3948b4781ca6ef338bf08e86f6dac2fbcb855835a09063a2a61e9bca3',
    )
    mock_all_api(
      etherscanUrl,
      ropstenInfuraUrl,
      ropstenAlchemyUrl,
      'eth_call',
      '0x0000000000000000000000000000000000000000000000000000000000000064',
    )
    mock_thornode_inbound_addresses_success(thornodeApiUrl, [
      {
        chain: 'ETH' as Chain,
        pub_key: 'tthorpub1addwnpepqfz98sx54jpv3f95qfg39zkx500avc6tr0d8ww0lv283yu3ucgq3g9y9njj',
        address: '0x8d1133a8cf23112fdb21f1efca340d727a98196e',
        router: '0xe0a63488e677151844e70623533c22007dc57c9e',
        halted: false,
        gas_rate: '51',
      },
      {
        chain: 'LTC' as Chain,
        pub_key: 'tthorpub1addwnpepqfz98sx54jpv3f95qfg39zkx500avc6tr0d8ww0lv283yu3ucgq3g9y9njj',
        address: 'tltc1q3x76wl4gmwu4yzx682r30ej0a8e2tttaw6pv7u',
        halted: false,
        gas_rate: '49',
      },
    ])

    const prices = await ethClient.estimateGasPrices()
    const signer = ethClient.getWallet(0)
    const txResult = await ethClient.call<TransactionResponse>({
      signer,
      contractAddress: '0xd15ffaef3112460bf3bcd81087fcbbce394e2ae7',
      abi: erc20ABI,
      funcName: 'transfer',
      funcParams: [
        '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
        BigNumber.from(baseAmount('10000000000000', ETH_DECIMAL).amount().toString()),
        // Here the tx overrides
        {
          from: ethClient.getAddress(),
          gasPrice: BigNumber.from(prices.average.amount().toString()),
        },
      ],
    })

    expect(txResult.hash).toEqual('0xe57981c3948b4781ca6ef338bf08e86f6dac2fbcb855835a09063a2a61e9bca3')
  })
})
