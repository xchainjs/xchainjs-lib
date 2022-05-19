import { Network } from '@xchainjs/xchain-client/lib'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'

import mockOpenHaven from '../__mocks__/open-haven'
import { AssetXHV, AssetXUSD } from '../src/assets'
import { Client as HavenClient } from '../src/client'

const havenClient = new HavenClient({ network: Network.Testnet })

describe('Haven xCHAIN Integration Test', () => {
  beforeAll(async () => {
    mockOpenHaven.init()
    await havenClient.preloadSDK()
  })

  beforeEach(() => {
    havenClient.purgeClient()
  })

  const MEMO = 'SWAP:THOR.RUNE'
  const bip39Mnemonic = 'venture expose swim treat swap defense magic toy blast hover neck permit'
  const havenMnemonic =
    'juvenile kickoff king glass scoop lair iris token truth puzzled amaze corrode justice autumn pimple turnip cafe oyster hover baffles giddy farming vector western pimple'
  const havenAddress =
    'hvtaKeraSrv8KGdn7Vp6qsQwBZLkKVQAi5fMuVynVe8HE9h7B8gdjQpMeGC1QHm4G25TBNcaXHfzSbe4G8uGTF6b5FoNTbnY5z'

  const havenAddress2 =
    'hvta6D5QfukiUdeidKdRw4AQ9Ddvt4o9e5jPg2CzkGhdeQGkZkU4RKDW7hajbbBLwsURMLu3S3DH6d5c8QYVYYSA6jy6XRzfPv'

  xit('set phrase should generate correct haven mnemonic', () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const result = havenClient.getHavenMnemonic()
    expect(result).toEqual(havenMnemonic)
  })

  xit('set phrase should return correct address', () => {
    havenClient.setNetwork(Network.Testnet)
    const result = havenClient.setPhrase(bip39Mnemonic)
    expect(result).toEqual(havenAddress)
  })

  xit('should not throw on a client without a phrase', () => {
    expect(() => {
      new HavenClient({
        network: Network.Testnet,
      })
    }).not.toThrow()
  })

  xit('should throw an error for setting a bad phrase', () => {
    expect(() => havenClient.setPhrase('very bad phrase')).toThrow()
  })

  xit('should not throw an error for setting a good phrase', () => {
    expect(havenClient.setPhrase(bip39Mnemonic)).toBeUndefined
  })

  xit('should validate the right address', () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const address = havenClient.getAddress()
    const valid = havenClient.validateAddress(address)
    expect(address).toEqual(havenAddress)
    expect(valid).toBeTruthy()
  })

  xit('all balances', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const xhvBalance = await havenClient.getBalance('ignored', [AssetXHV])
    expect(xhvBalance.length).toEqual(1)
    expect(xhvBalance[0].amount.amount().toNumber()).toBeGreaterThan(0)

    const xusdBalance = await havenClient.getBalance('ignored', [AssetXUSD])
    expect(xusdBalance.length).toEqual(1)
    expect(xusdBalance[0].amount.amount().toNumber()).toBeGreaterThan(0)

    const xusdAndXhvdBalance = await havenClient.getBalance('ignored', [AssetXHV, AssetXUSD])
    expect(xusdAndXhvdBalance.length).toEqual(2)
  })

  xit('should send funds', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const amount = baseAmount(2223)
    const txid = await havenClient.transfer({ asset: AssetXHV, recipient: havenAddress2, amount })
    expect(txid).toEqual('mock-txid')
  })

  xit('should do broadcast a transfer with a memo', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)

    const amount = baseAmount(2223)
    try {
      const txid = await havenClient.transfer({
        asset: AssetXHV,
        recipient: havenAddress2,
        amount,
        memo: MEMO,
      })
      expect(txid).toEqual('mock-txid')
    } catch (err) {
      console.log('ERR running test', err)
      throw err
    }
  })

  xit('should purge phrase', async () => {
    havenClient.purgeClient()
    expect(() => havenClient.getAddress()).toThrow()
  })

  xit('should prevent a tx when amount exceed balance', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)

    const asset = AssetXHV
    const amount = baseAmount(99999999999999)
    expect(havenClient.transfer({ asset, recipient: havenAddress2, amount })).rejects
    // expect(1).toEqual(1)
  })

  it('should return estimated fees of a normal tx', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const estimates = await havenClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  xit('should error when an invalid address is used in transfer', () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    expect(havenClient.transfer({ asset: AssetXHV, recipient: invalidAddress, amount })).rejects
  })

  xit('should get address transactions', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const txPages = await havenClient.getTransactions({ address: 'ignored' })

    expect(txPages.total).toEqual(2)
    expect(txPages.txs[0].asset).toEqual(AssetXHV)
    expect(txPages.txs[0].date).toEqual(new Date('2022-05-14 13:29:42'))
    expect(txPages.txs[0].hash).toEqual('45fa5f859207dab663d6b0e7ef827b3b9d477685e56d0aad54ae3dd71de5ee24')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(1)
    expect(txPages.txs[0].from.length).toEqual(0)
  })

  xit('should get address transactions with limit', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    // Limit should work
    const txPages = await havenClient.getTransactions({ address: 'ignored', limit: 1 })
    return expect(txPages.total).toEqual(1)
  })

  it('should only get XUSD transactions', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    // Limit should work
    const xusdAsset = AssetXUSD
    const txPages = await havenClient.getTransactions({ address: 'ignored', asset: assetToString(xusdAsset) })
    return expect(txPages.txs[0].asset).toEqual(AssetXUSD)
  })

  it('should only get XHV transactions', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    // Limit should work
    const xhvAsset = AssetXHV
    const txPages = await havenClient.getTransactions({ address: 'ignored', asset: assetToString(xhvAsset) })
    return expect(txPages.txs[0].asset).toEqual(AssetXHV)
  })

  it('should get transaction with hash', async () => {
    havenClient.setNetwork(Network.Testnet)
    havenClient.setPhrase(bip39Mnemonic)
    const txData = await havenClient.getTransactionData(
      '45fa5f859207dab663d6b0e7ef827b3b9d477685e56d0aad54ae3dd71de5ee24',
    )

    expect(txData.hash).toEqual('45fa5f859207dab663d6b0e7ef827b3b9d477685e56d0aad54ae3dd71de5ee24')
    expect(txData.to.length).toEqual(1)
    expect(txData.to[0].to).toEqual(havenAddress)
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(100, 12).amount())).toBeTruthy()
  })

  xit('should return valid explorer url', () => {
    havenClient.setNetwork(Network.Mainnet)
    expect(havenClient.getExplorerUrl()).toEqual('https://explorer.havenprotocol.org')

    havenClient.setNetwork(Network.Testnet)
    expect(havenClient.getExplorerUrl()).toEqual('https://explorer-testnet.havenprotocol.org')
  })

  xit('should return valid explorer tx url', () => {
    havenClient.setNetwork(Network.Mainnet)
    expect(havenClient.getExplorerTxUrl('testTxHere')).toEqual('https://explorer.havenprotocol.org/tx/testTxHere')
    havenClient.setNetwork(Network.Testnet)
    expect(havenClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://explorer-testnet.havenprotocol.org/tx/anotherTestTxHere',
    )
  })
})
