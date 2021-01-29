import { Client } from '../src/client'
import { mock_getBalance, mock_getTransactionData } from '../__mocks__/api'
import { baseAmount } from '@xchainjs/xchain-util'

const bchClient = new Client({ network: 'mainnet' })

describe('BCHClient Test', () => {
  beforeEach(() => bchClient.purgeClient())
  afterEach(() => bchClient.purgeClient())

  const phrase = 'atom green various power must another rent imitate gadget creek fat then'
  const testnet_address = 'bchtest:qpgxmhllgd8fn2flps84537s6uj8mywd4s0w0up43e'
  const mainnet_address = 'bitcoincash:qrqwc4dxav4dzltr97q8u2245rz7wlxu3ye8c6x99u'

  it('set phrase should return correct address', () => {
    bchClient.setNetwork('testnet')
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address)

    bchClient.setNetwork('mainnet')
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => bchClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(bchClient.setPhrase(phrase)).toBeUndefined
  })

  it('should validate the right address', () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)
    expect(bchClient.getAddress()).toEqual(testnet_address)
    expect(bchClient.validateAddress(testnet_address)).toBeTruthy()
    expect(bchClient.validateAddress(mainnet_address)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerUrl()).toEqual('https://www.blockchain.com/bch')

    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerUrl()).toEqual('https://www.blockchain.com/bch-testnet')
  })

  it('should retrun valid explorer address url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://www.blockchain.com/bch/address/testAddressHere',
    )
    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://www.blockchain.com/bch-testnet/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerTxUrl('testTxHere')).toEqual('https://www.blockchain.com/bch/tx/testTxHere')
    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://www.blockchain.com/bch-testnet/tx/anotherTestTxHere',
    )
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getClientURL(), 'qpgxmhllgd8fn2flps84537s6uj8mywd4s0w0up43e', {
      confirmed: 0,
      unconfirmed: 0,
      balance: 0,
    })
    const balance = await bchClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(0)
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getClientURL(), 'qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf', {
      confirmed: 123817511737,
      unconfirmed: 0,
      balance: 123817511737,
    })
    const balance = await bchClient.getBalance('qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf')
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().isEqualTo('123817511737')).toBeTruthy()
  })

  it('should get transaction data', async () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)

    mock_getTransactionData(
      bchClient.getClientURL(),
      '0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c',
      {
        _id: '5f296d1ac1032d46866487cc',
        txid: '0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c',
        network: 'testnet',
        chain: 'BCH',
        blockHeight: 1398942,
        blockHash: '00000000b364765e61e40c6dfa64534cfd298bceb31c97502650797925af6e55',
        blockTime: '2020-08-04T14:15:49.000Z',
        blockTimeNormalized: '2020-08-04T14:15:49.000Z',
        coinbase: false,
        locktime: -1,
        inputCount: 1,
        outputCount: 2,
        size: 226,
        fee: 248,
        value: 3586,
        confirmations: 33389,
      },
      {
        inputs: [
          {
            _id: '5ec7498ac1032d4686ffad97',
            chain: 'BCH',
            network: 'testnet',
            coinbase: false,
            mintIndex: 0,
            spentTxid: '0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c',
            mintTxid: 'ab0b2458480c7981abb79a0ba431aaaf65972ff2234e2bf9fc0570c755e811da',
            mintHeight: 1380503,
            spentHeight: 1398942,
            address: 'qzmpc0fz8tdz9kkfhxzmu0rt6d23dvyusugshegndx',
            script: '76a914b61c3d223ada22dac9b985be3c6bd35516b09c8788ac',
            value: 3834,
            confirmations: -1,
            sequenceNumber: 4294967295,
          },
        ],
        outputs: [
          {
            _id: '5f296d1ac1032d46866487c6',
            chain: 'BCH',
            network: 'testnet',
            coinbase: false,
            mintIndex: 0,
            spentTxid: '',
            mintTxid: '0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c',
            mintHeight: 1398942,
            spentHeight: -2,
            address: 'qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
            script: '76a914a34bd369e9dca0837d5480fd7c3e6cd9449ac15488ac',
            value: 600,
            confirmations: -1,
          },
          {
            _id: '5f296d1ac1032d46866487c5',
            chain: 'BCH',
            network: 'testnet',
            coinbase: false,
            mintIndex: 1,
            spentTxid: '27bfb1667fddcaba710af6a13c8bd2aa45c31888b47bb7e74650223f7f94b47a',
            mintTxid: '0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c',
            mintHeight: 1398942,
            spentHeight: 1398948,
            address: 'qqgjndf87xlamm9thts6p860p90gq29zhswu6kvyru',
            script: '76a9141129b527f1bfddecabbae1a09f4f095e8028a2bc88ac',
            value: 2986,
            confirmations: -1,
            sequenceNumber: 4294967295,
          },
        ],
      },
    )

    const txData = await bchClient.getTransactionData(
      '0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c',
    )
    expect(txData.hash).toEqual('0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c')
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('bchtest:qzmpc0fz8tdz9kkfhxzmu0rt6d23dvyusugshegndx')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(3834, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual('bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(600, 8).amount())).toBeTruthy()
    expect(txData.to[1].to).toEqual('bchtest:qqgjndf87xlamm9thts6p860p90gq29zhswu6kvyru')
    expect(txData.to[1].amount.amount().isEqualTo(baseAmount(2986, 8).amount())).toBeTruthy()
  })
})
