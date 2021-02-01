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

    mock_getBalance(bchClient.getClientURL(), bchClient.getAddress(), {
      received: 124442749359,
      utxo: 1336,
      address: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      txs: 1345,
      unconfirmed: 0,
      confirmed: 0,
    })
    const balance = await bchClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(0)
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getClientURL(), 'qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf', {
      received: 123817511737,
      utxo: 1336,
      address: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      txs: 1345,
      unconfirmed: 0,
      confirmed: 123817511737,
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
      '0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b',
      {
        time: 1548767230,
        size: 245,
        inputs: [
          {
            pkscript: '76a9148836437a157981dfa0a885d8b89f1e7dbeb19f6a88ac',
            value: 4008203,
            address: 'bchtest:qzyrvsm6z4ucrhaq4zza3wylre7mavvldgr67jrxt4',
            witness: [],
            sequence: 4294967294,
            output: 0,
            sigscript:
              '483045022100bb913689120d3b0c15a4cbf8692db56b280fce590d6742c0786eb9e86adafeff022057eb92814fa417349a867aa38b8a7c38a12c72ae6fa3b479b2e477c5a4482898412103d740fe05c374c9ffdc294d6d486b4b490db9322124cafbd56fee3a71cb9c006c',
            coinbase: false,
            txid: '5fb7685ebec529851d2b0c4dacc8e0ada028191e5279d68baf5a0d96e9e29577',
          },
        ],
        weight: 980,
        fee: 2499,
        locktime: 0,
        block: {
          height: 1283394,
          position: 1,
        },
        outputs: [
          {
            spent: true,
            pkscript: '76a914151a5bd62929872630531213391c3e2952fa069c88ac',
            value: 4005704,
            address: 'bchtest:qq235k7k9y5cwf3s2vfpxwgu8c5497sxnsdnxv6upc',
            spender: {
              input: 0,
              txid: 'f1173bb9269c5f7da1e188fae7b6295f3ed4d2861fbd45f4b5415f5bbe06d8ae',
            },
          },
          {
            spent: false,
            pkscript: '6a09696e7465726c696e6b2094112b9aec1d3e1e7c397d40330c920677f74966c858f5ccf940bdb43c580c30',
            value: 0,
            address: null,
            spender: null,
          },
        ],
        version: 1,
        deleted: false,
        rbf: false,
        txid: '0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b',
      },
    )

    const txData = await bchClient.getTransactionData(
      '0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b',
    )
    expect(txData.hash).toEqual('0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b')
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('bchtest:qzyrvsm6z4ucrhaq4zza3wylre7mavvldgr67jrxt4')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(4008203, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(1)
    expect(txData.to[0].to).toEqual('bchtest:qq235k7k9y5cwf3s2vfpxwgu8c5497sxnsdnxv6upc')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(4005704, 8).amount())).toBeTruthy()
  })
})
