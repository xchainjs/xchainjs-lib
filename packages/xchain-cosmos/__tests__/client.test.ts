import { proto } from '@cosmos-client/core'
import { Network, TxsPage } from '@xchainjs/xchain-client'
import { BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import nock from 'nock'

import { Client } from '../src/client'
import { AssetAtom } from '../src/const'
import { GetTxByHashResponse, TxHistoryResponse } from '../src/cosmos/types'

const getClientUrl = (client: Client): string => {
  return client.getNetwork() === Network.Testnet
    ? 'https://rest.sentry-02.theta-testnet.polypore.xyz'
    : 'https://api.cosmos.network'
}

const mockAccountsAddress = (
  url: string,
  address: string,
  result: {
    account: {
      '@type': string
      address: string
      pub_key?: {
        '@type': string
        key: string
      }
      account_number: string
      sequence: string
    }
  },
) => {
  nock(url).get(`/cosmos/auth/v1beta1/accounts/${address}`).reply(200, result)
}

const mockAccountsBalance = (
  url: string,
  address: string,
  result: {
    balances: proto.cosmos.base.v1beta1.Coin[]
  },
) => {
  nock(url).get(`/cosmos/bank/v1beta1/balances/${address}`).reply(200, result)
}

const assertTxsPost = (
  url: string,
  result: {
    tx_response: {
      txhash: string
    }
  },
): void => {
  nock(url, { allowUnmocked: true })
    .post(`/cosmos/tx/v1beta1/txs`, (body) => {
      expect(body.mode).toEqual('BROADCAST_MODE_SYNC')
      expect(body.tx_bytes.length).toBeGreaterThan(0)
      return true
    })
    .reply(200, result)
}

const assertTxHstory = (url: string, address: string, result: TxHistoryResponse): void => {
  nock(url).get(`/cosmos/tx/v1beta1/txs?events=message.sender='${address}'`).reply(200, result)
}

const assertTxHashGet = (url: string, hash: string, result: GetTxByHashResponse): void => {
  nock(url).get(`/cosmos/tx/v1beta1/txs/${hash}`).reply(200, result)
}

describe('Client Test', () => {
  let cosmosClient: Client

  const phrase = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  const address0_mainnet = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'
  const address1_mainnet = 'cosmos1924f27fujxqnkt74u4d3ke3sfygugv9qp29hmk'

  const address0_testnet = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'
  const address1_testnet = 'cosmos1924f27fujxqnkt74u4d3ke3sfygugv9qp29hmk'

  beforeEach(() => {
    cosmosClient = new Client({ phrase, network: Network.Testnet })
  })

  afterEach(() => {
    cosmosClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const cosmosClientEmptyMain = new Client({ phrase, network: Network.Mainnet })
    expect(cosmosClientEmptyMain.getAddress()).toEqual(address0_mainnet)
    expect(cosmosClientEmptyMain.getAddress(1)).toEqual(address1_mainnet)

    const cosmosClientEmptyTest = new Client({ phrase, network: Network.Testnet })
    expect(cosmosClientEmptyTest.getAddress()).toEqual(address0_testnet)
    expect(cosmosClientEmptyTest.getAddress(1)).toEqual(address1_testnet)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new Client({ phrase: 'invalid phrase', network: Network.Mainnet })
    }).toThrow()

    expect(() => {
      new Client({ phrase: 'invalid phrase', network: Network.Testnet })
    }).toThrow()
  })

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client({
        network: Network.Testnet,
      })
    }).not.toThrow()
  })

  it('should have right address', async () => {
    expect(cosmosClient.getAddress()).toEqual(address0_testnet)
  })

  it('should update net', async () => {
    const client = new Client({ phrase, network: Network.Mainnet })
    client.setNetwork(Network.Testnet)
    expect(client.getNetwork()).toEqual('testnet')

    const address = client.getAddress()
    expect(address).toEqual(address)
  })

  it('should init, should have right prefix', async () => {
    expect(cosmosClient.validateAddress(cosmosClient.getAddress())).toEqual(true)

    cosmosClient.setNetwork(Network.Mainnet)
    expect(cosmosClient.validateAddress(cosmosClient.getAddress())).toEqual(true)
  })

  it('has no balances', async () => {
    cosmosClient.setNetwork(Network.Mainnet)

    mockAccountsBalance(getClientUrl(cosmosClient), address0_mainnet, {
      balances: [],
    })

    const result = await cosmosClient.getBalance(address0_mainnet)
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    mockAccountsBalance(getClientUrl(cosmosClient), 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv', {
      balances: [
        new proto.cosmos.base.v1beta1.Coin({
          denom: 'uatom',
          amount: '75000000',
        }),
      ],
    })
    const balances = await cosmosClient.getBalance('cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv')

    const expected = balances[0].amount.amount().isEqualTo(baseAmount(75000000, 6).amount())
    expect(expected).toBeTruthy()
    expect(balances[0].asset).toEqual(AssetAtom)
  })

  it('has an empty tx history', async () => {
    cosmosClient.setNetwork(Network.Mainnet)

    const expected: TxsPage = {
      total: 0,
      txs: [],
    }
    assertTxHstory(getClientUrl(cosmosClient), address0_mainnet, {
      pagination: {
        total: '0',
      },
      limit: 30,
      page_number: 1,
      page_total: 1,
      tx_responses: [],
    })

    const transactions = await cosmosClient.getTransactions({ address: address0_mainnet })
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2',
      to_address: 'cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr',
      amount: [
        {
          denom: 'uatom',
          amount: '4318994970',
        },
      ],
    })

    assertTxHstory(getClientUrl(cosmosClient), 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2', {
      pagination: {
        total: '1',
      },
      limit: 30,
      page_number: 1,
      page_total: 1,
      tx_responses: [
        {
          height: 1047,
          txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
          data: '0A090A076465706F736974',
          raw_log: 'transaction logs',
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          tx: {
            body: {
              messages: [msgSend],
            },
          },
          timestamp: '2020-09-25T06:09:15Z',
        },
      ],
    })

    let transactions = await cosmosClient.getTransactions({ address: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2' })
    expect(transactions.total).toBeGreaterThan(0)

    cosmosClient.setNetwork(Network.Mainnet)
    const msgSend2 = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z',
      to_address: 'cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr',
      amount: [
        {
          denom: 'uatom',
          amount: '4318994970',
        },
      ],
    })
    assertTxHstory(getClientUrl(cosmosClient), 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z', {
      pagination: {
        total: '1',
      },
      limit: 30,
      page_number: 1,
      page_total: 1,
      tx_responses: [
        {
          height: 1047,
          txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
          data: '0A090A076465706F736974',
          raw_log: 'transaction logs',
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          tx: {
            body: {
              messages: [msgSend2],
            },
          },
          timestamp: '2020-09-25T06:09:15Z',
        },
      ],
    })

    transactions = await cosmosClient.getTransactions({ address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z' })
    expect(transactions.total).toBeGreaterThan(0)
  })

  it('transfer', async () => {
    const to_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result = {
      tx_response: {
        txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
        code: 0,
      },
    }

    mockAccountsAddress(getClientUrl(cosmosClient), cosmosClient.getAddress(), {
      account: {
        '@type': '/cosmos.auth.v1beta1.BaseAccount',
        address: cosmosClient.getAddress(),
        pub_key: {
          '@type': '/cosmos.crypto.secp256k1.PubKey',
          key: 'AyB84hKBjN2wsmdC2eF1Ppz6l3VxlfSKJpYsTaL4VrrE',
        },
        account_number: '0',
        sequence: '0',
      },
    })
    assertTxsPost(getClientUrl(cosmosClient), expected_txsPost_result)

    const result = await cosmosClient.transfer({
      asset: AssetAtom,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('get transaction data', async () => {
    cosmosClient.setNetwork(Network.Mainnet)

    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z',
      to_address: 'cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr',
      amount: [
        {
          denom: 'uatom',
          amount: '4318994970',
        },
      ],
    })

    assertTxHashGet(getClientUrl(cosmosClient), '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066', {
      tx_response: {
        height: 1047,
        txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
        data: '0A090A076465706F736974',
        raw_log: 'transaction logs',
        gas_wanted: '5000000000000000',
        gas_used: '148996',
        tx: {
          body: {
            messages: [msgSend],
          },
        },
        timestamp: '2020-09-25T06:09:15Z',
      },
    })

    const tx = await cosmosClient.getTransactionData('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.type).toEqual('transfer')
    expect(tx.hash).toEqual('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.from[0].from).toEqual('cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z')
    expect(tx.from[0].amount.amount().isEqualTo(baseAmount(4318994970, 6).amount())).toBeTruthy()
    expect(tx.to[0].to).toEqual('cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr')
    expect(tx.to[0].amount.amount().isEqualTo(baseAmount(4318994970, 6).amount())).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    // Client created with network === 'testnet'
    expect(cosmosClient.getExplorerUrl()).toEqual('https://explorer.theta-testnet.polypore.xyz')

    cosmosClient.setNetwork(Network.Mainnet)
    expect(cosmosClient.getExplorerUrl()).toEqual('https://cosmos.bigdipper.live')
  })

  it('should retrun valid explorer address url', () => {
    expect(cosmosClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://explorer.theta-testnet.polypore.xyz/account/anotherTestAddressHere',
    )

    cosmosClient.setNetwork(Network.Mainnet)
    expect(cosmosClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://cosmos.bigdipper.live/account/testAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    expect(cosmosClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://explorer.theta-testnet.polypore.xyz/transactions/anotherTestTxHere',
    )

    cosmosClient.setNetwork(Network.Mainnet)
    expect(cosmosClient.getExplorerTxUrl('testTxHere')).toEqual('https://cosmos.bigdipper.live/transactions/testTxHere')
  })
})
