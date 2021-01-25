import nock from 'nock'
import { Wallet, providers } from 'ethers'
import { baseAmount, AssetETH, assetToString, assetFromString, ETHChain } from '@xchainjs/xchain-util'
import Client from '../src/client'
import { ETH_DECIMAL } from '../src/utils'
import { mock_all_api } from '../__mocks__'
import {
  mock_etherscan_balance_api,
  mock_etherscan_tokenbalance_api,
  mock_etherscan_eth_txs_api,
  mock_etherscan_token_txs_api,
  mock_etherscan_txdata_api,
} from '../__mocks__/etherscan-api'

const phrase = 'canyon throw labor waste awful century ugly they found post source draft'
const newPhrase = 'logic neutral rug brain pluck submit earth exit erode august remain ready'
const address = '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e'
const etherscanUrl = 'https://api-rinkeby.etherscan.io'
const rinkebyInfuraUrl = 'https://rinkeby.infura.io/v3'
const rinkebyAlchemyUrl = 'https://eth-rinkeby.alchemyapi.io/v2'
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
    expect(network.name).toEqual('rinkeby')
    expect(network.chainId).toEqual(4)
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
    })

    mock_etherscan_balance_api(etherscanUrl, '96713467036431545')

    const balance = await ethClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(assetToString(balance[0].asset)).toEqual(assetToString(AssetETH))
    expect(balance[0].amount.amount().isEqualTo(baseAmount('96713467036431545', ETH_DECIMAL).amount())).toBeTruthy()
  })

  it('gets a balance from address', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_etherscan_balance_api(etherscanUrl, '96713467036431545')

    const balance = await ethClient.getBalance('0x8d8ac01b3508ca869cb631bb2977202fbb574a0d')
    expect(balance.length).toEqual(1)
    expect(assetToString(balance[0].asset)).toEqual(assetToString(AssetETH))
    expect(balance[0].amount.amount().isEqualTo(baseAmount('96713467036431545', ETH_DECIMAL).amount())).toBeTruthy()
  })

  it('gets erc20 token balance', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_etherscan_tokenbalance_api(etherscanUrl, '96713467036431545')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_call',
      '0x0000000000000000000000000000000000000000000000000000000000000012',
    )

    const asset = assetFromString(`${ETHChain}.DAI-0xc7ad46e0b8a400bb3c915120d284aafba8fc4735`) ?? undefined
    const balance = await ethClient.getBalance(undefined, asset)
    expect(balance.length).toEqual(1)
    expect(assetToString(balance[0].asset)).toEqual(assetToString(asset ?? AssetETH))
    expect(balance[0].amount.decimal).toEqual(18)
    expect(balance[0].amount.amount().isEqualTo(baseAmount('96713467036431545', 18).amount())).toBeTruthy()
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
      network: 'testnet',
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
      offset: 1,
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
      network: 'testnet',
      phrase,
    })

    mock_etherscan_txdata_api(etherscanUrl, {
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
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_sendRawTransaction',
      '0x595e89d0129f5ae6aafad1da3ae85fb8accc0132c89dbc1feff90d584c5f587d',
    )

    const txResult = await ethClient.transfer({
      recipient: '0x8ced5ad0d8da4ec211c17355ed3dbfec4cf0e5b9',
      amount: baseAmount(1001, ETH_DECIMAL),
    })
    expect(txResult).toEqual('0x595e89d0129f5ae6aafad1da3ae85fb8accc0132c89dbc1feff90d584c5f587d')
  })

  it('ERC20 transfer', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_call',
      '0x0000000000000000000000000000000000000000000000000000000000000064',
    )
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_sendRawTransaction',
      '0x322e5e48a0357dae04c1cf6e1408e7887fe30388ab6c9eaf2c8e25242a7f7c3e',
    )

    const txHash = await ethClient.transfer({
      recipient: '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      amount: baseAmount(1000000, ETH_DECIMAL),
      asset: assetFromString(`${ETHChain}.DAI-0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa`) || undefined,
    })
    expect(txHash).toEqual('0x322e5e48a0357dae04c1cf6e1408e7887fe30388ab6c9eaf2c8e25242a7f7c3e')
  })

  it('estimate gas for eth transfer', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_sendRawTransaction',
      '0xcd0e007a6f81120d45478e3eef07c017ec104d4a2a5f1bff23cf0837ba3aab28',
    )

    const gasEstimate = await ethClient.estimateGas({
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: baseAmount(1, ETH_DECIMAL),
    })

    expect(gasEstimate.amount().toString()).toEqual(baseAmount(21000, 18).amount().toString())
  })

  it('estimate gas for erc20 transfer', async () => {
    const ethClient = new Client({ network: 'testnet', phrase })

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_sendRawTransaction',
      '0xcd0e007a6f81120d45478e3eef07c017ec104d4a2a5f1bff23cf0837ba3aab28',
    )

    const gasEstimate = await ethClient.estimateGas({
      asset: assetFromString(`${ETHChain}.DAI-0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa`) || undefined,
      recipient: '0x2fe25ca708fc485cf356b2f27399247d91c6edbd',
      amount: baseAmount(1, ETH_DECIMAL),
    })

    expect(gasEstimate.amount().toString()).toEqual(baseAmount(21000, 18).amount().toString())
  })

  it('isApproved', async () => {
    const ethClient = new Client({
      network: 'testnet',
      phrase,
    })

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_call',
      '0x0000000000000000000000000000000000000000000000000000000000000064',
    )

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

    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_blockNumber', '0x3c6de5')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_getTransactionCount', '0x10')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_gasPrice', '0xb2d05e00')
    mock_all_api(etherscanUrl, rinkebyInfuraUrl, rinkebyAlchemyUrl, 'eth_estimateGas', '0x5208')
    mock_all_api(
      etherscanUrl,
      rinkebyInfuraUrl,
      rinkebyAlchemyUrl,
      'eth_sendRawTransaction',
      '0xbe7340bf40f50e250ded48f848ecafbd964034cc7de05feb5b04f36de40dcb2d',
    )

    const hash = await ethClient.approve(
      '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
      '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
      baseAmount(100, ETH_DECIMAL),
    )
    expect(hash).toEqual('0xbe7340bf40f50e250ded48f848ecafbd964034cc7de05feb5b04f36de40dcb2d')
  })
})
