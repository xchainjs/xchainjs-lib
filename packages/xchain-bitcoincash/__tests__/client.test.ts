import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import {
  mock_broadcastTx,
  mock_estimateFee,
  mock_estimateFeeFromThor,
  mock_getBalance,
  mock_getRawTransactionData,
  mock_getTransactionData,
  mock_getTransactions,
  mock_getUnspents,
} from '../__mocks__/api'
import { Client } from '../src/client'
import { BCH_DECIMAL } from '../src/utils'

const bchClient = new Client({ network: Network.Mainnet })

describe('BCHClient Test', () => {
  beforeEach(() => bchClient.purgeClient())
  afterEach(() => bchClient.purgeClient())

  const MEMO = 'SWAP:THOR.RUNE'
  const phrase = 'atom green various power must another rent imitate gadget creek fat then'
  const testnet_address_path0 = 'qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
  const testnet_address_path1 = 'qrkd7dhu7zcmn6wwvj3p4aueslycqchj5vxx3stmjz'
  const mainnet_address_path0 = 'qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj'
  const mainnet_address_path1 = 'qr4jrkhu3usuk8ghv60m7pg9eywuc79yqvd0wxt2lm'

  it('set phrase should return correct address', () => {
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address_path0)

    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address_path0)
  })

  it('set phrase with derivation path should return correct address', () => {
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address_path0)
    expect(bchClient.getAddress(1)).toEqual(testnet_address_path1)

    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address_path0)
    expect(bchClient.getAddress(1)).toEqual(mainnet_address_path1)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => bchClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(bchClient.setPhrase(phrase)).toBeUndefined
  })

  it('should validate the right address', () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)
    expect(bchClient.getAddress()).toEqual(testnet_address_path0)
    expect(bchClient.validateAddress(testnet_address_path0)).toBeTruthy()

    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.validateAddress(mainnet_address_path0)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.getExplorerUrl()).toEqual('https://www.blockchain.com/bch')

    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.getExplorerUrl()).toEqual('https://www.blockchain.com/bch-testnet')
  })

  it('should return valid explorer address url', () => {
    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://www.blockchain.com/bch/address/testAddressHere',
    )
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://www.blockchain.com/bch-testnet/address/anotherTestAddressHere',
    )
  })

  it('should return valid explorer tx url', () => {
    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.getExplorerTxUrl('testTxHere')).toEqual('https://www.blockchain.com/bch/tx/testTxHere')
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://www.blockchain.com/bch-testnet/tx/anotherTestTxHere',
    )
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getHaskoinURL(), bchClient.getAddress(), {
      received: 124442749359,
      utxo: 1336,
      address: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      txs: 1345,
      unconfirmed: 0,
      confirmed: 0,
    })
    const balance = await bchClient.getBalance(bchClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(0)
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getHaskoinURL(), bchClient.getAddress(), {
      received: 123817511737,
      utxo: 1336,
      address: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      txs: 1345,
      unconfirmed: 100000000000,
      confirmed: 123817511737,
    })
    const balance = await bchClient.getBalance(bchClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().isEqualTo('223817511737')).toBeTruthy()
  })

  it('should get transaction data', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_getTransactionData(
      bchClient.getHaskoinURL(),
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
    expect(txData.from[0].from).toEqual('qzyrvsm6z4ucrhaq4zza3wylre7mavvldgr67jrxt4')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(4008203, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(1)
    expect(txData.to[0].to).toEqual('qq235k7k9y5cwf3s2vfpxwgu8c5497sxnsdnxv6upc')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(4005704, 8).amount())).toBeTruthy()
  })

  it('should get transactions', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getHaskoinURL(), 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf', {
      received: 124442749359,
      utxo: 1336,
      address: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      txs: 1345,
      unconfirmed: 0,
      confirmed: 0,
    })
    mock_getTransactions(bchClient.getHaskoinURL(), 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf', [
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
    ])

    const txs = await bchClient.getTransactions({
      address: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      limit: 1,
    })
    expect(txs.total).toEqual(1345)
    expect(txs.txs[0].hash).toEqual('0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b')
    expect(txs.txs[0].from.length).toEqual(1)
    expect(txs.txs[0].from[0].from).toEqual('qzyrvsm6z4ucrhaq4zza3wylre7mavvldgr67jrxt4')
    expect(txs.txs[0].from[0].amount.amount().isEqualTo(baseAmount(4008203, 8).amount())).toBeTruthy()
    expect(txs.txs[0].to.length).toEqual(1)
    expect(txs.txs[0].to[0].to).toEqual('qq235k7k9y5cwf3s2vfpxwgu8c5497sxnsdnxv6upc')
    expect(txs.txs[0].to[0].amount.amount().isEqualTo(baseAmount(4005704, 8).amount())).toBeTruthy()
  })

  it('should transfer bch', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_getBalance(
      bchClient.getHaskoinURL(),
      bchClient.getAddress(),
      {
        received: 12964626,
        utxo: 1,
        address: bchClient.getAddress(),
        txs: 13,
        unconfirmed: 0,
        confirmed: 992999,
      },
      2,
    )
    mock_getUnspents(bchClient.getHaskoinURL(), bchClient.getAddress(), [
      {
        pkscript: '76a9145be96e4fbfd68370cfd30ad2f3458c580f09afb188ac',
        value: 992999,
        address: bchClient.getAddress(),
        block: {
          height: 1436370,
          position: 4,
        },
        index: 1,
        txid: '66f090bd35b15a4a8ede2f71184cf4d2cc08483921752b845ba2fdee7b96ca79',
      },
    ])
    mock_getRawTransactionData(
      bchClient.getHaskoinURL(),
      '66f090bd35b15a4a8ede2f71184cf4d2cc08483921752b845ba2fdee7b96ca79',
      {
        result:
          '02000000010913175382c5014e69c174377320717629c736370d29e8d19e31c27609a03053010000006a4730440220748b74d61e2e0bbec73a5a9e7e475b502029606cf7affea499a3246d6011e155022056c4f2979df51e15e1745b614eb2e5ecd2a2353be9211a0beddbbf2a344ce8434121027887b7dbccb26dc0b7e3e4174b986cbb5011ade42654d3a92f7bdba3bd08c8f9ffffffff0264000000000000001976a91497a808f1d39ae863ed78500504780e2ca0c21b7288ace7260f00000000001976a9145be96e4fbfd68370cfd30ad2f3458c580f09afb188ac00000000',
      },
    )
    mock_estimateFee()
    mock_broadcastTx(bchClient.getNodeURL(), '82b65a0006697bff406c62ad0b3fd07db9f20ce6fbc468c81679d96aebc36f69')

    const txId = await bchClient.transfer({
      walletIndex: 0,
      recipient: 'bchtest:qzt6sz836wdwscld0pgq2prcpck2pssmwge9q87pe9',
      amount: baseAmount(100, BCH_DECIMAL),
      feeRate: 1,
    })
    expect(txId).toEqual('82b65a0006697bff406c62ad0b3fd07db9f20ce6fbc468c81679d96aebc36f69')
  })

  it('should transfer bch to a legacy address format', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)
    mock_getBalance(
      bchClient.getHaskoinURL(),
      bchClient.getAddress(),
      {
        received: 12964626,
        utxo: 1,
        address: bchClient.getAddress(),
        txs: 13,
        unconfirmed: 0,
        confirmed: 992999,
      },
      2,
    )
    mock_getUnspents(bchClient.getHaskoinURL(), bchClient.getAddress(), [
      {
        pkscript: '76a9145be96e4fbfd68370cfd30ad2f3458c580f09afb188ac',
        value: 992999,
        address: bchClient.getAddress(),
        block: {
          height: 1436370,
          position: 4,
        },
        index: 1,
        txid: '66f090bd35b15a4a8ede2f71184cf4d2cc08483921752b845ba2fdee7b96ca79',
      },
    ])
    mock_getRawTransactionData(
      bchClient.getHaskoinURL(),
      '66f090bd35b15a4a8ede2f71184cf4d2cc08483921752b845ba2fdee7b96ca79',
      {
        result:
          '02000000010913175382c5014e69c174377320717629c736370d29e8d19e31c27609a03053010000006a4730440220748b74d61e2e0bbec73a5a9e7e475b502029606cf7affea499a3246d6011e155022056c4f2979df51e15e1745b614eb2e5ecd2a2353be9211a0beddbbf2a344ce8434121027887b7dbccb26dc0b7e3e4174b986cbb5011ade42654d3a92f7bdba3bd08c8f9ffffffff0264000000000000001976a91497a808f1d39ae863ed78500504780e2ca0c21b7288ace7260f00000000001976a9145be96e4fbfd68370cfd30ad2f3458c580f09afb188ac00000000',
      },
    )
    mock_estimateFee()
    mock_broadcastTx(bchClient.getNodeURL(), '82b65a0006697bff406c62ad0b3fd07db9f20ce6fbc468c81679d96aebc36f69')

    const txId = await bchClient.transfer({
      walletIndex: 0,
      recipient: '2N3oefVeg6stiTb5Kh3ozCSkaqmx91FDbsm',
      amount: baseAmount(100, BCH_DECIMAL),
      feeRate: 1,
    })
    expect(txId).toEqual('82b65a0006697bff406c62ad0b3fd07db9f20ce6fbc468c81679d96aebc36f69')
  })

  it('returns fees and rates of a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_estimateFee()

    const { fees, rates } = await bchClient.getFeesWithRates()
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates(from thornodeAPI) of a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_estimateFeeFromThor()

    const { fees, rates } = await bchClient.getFeesWithRates()
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates of a tx w/ memo', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_estimateFee()

    const { fees, rates } = await bchClient.getFeesWithRates(MEMO)
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('should return estimated fees of a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_estimateFee()

    const estimates = await bchClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('returns different fee rates for a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    mock_estimateFee()

    const { fast, fastest, average } = await bchClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })
})
